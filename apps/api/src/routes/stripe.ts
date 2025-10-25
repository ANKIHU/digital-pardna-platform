import Stripe from 'stripe';
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const paymentIntentSchema = z.object({
  amount: z.number().positive(),
  currency: z.enum(['jmd', 'usd']).default('jmd'),
  paymentMethodId: z.string(),
  userId: z.string(),
  circleId: z.string().optional(),
  description: z.string().optional()
});

const webhookSchema = z.object({
  type: z.string(),
  data: z.object({
    object: z.any()
  })
});

const stripeRoutes: FastifyPluginAsync = async (app) => {
  
  // Create payment intent for circle contribution
  app.post('/payments/stripe/create-intent', async (req, reply) => {
    try {
      const { amount, currency, paymentMethodId, userId, circleId, description } = 
        paymentIntentSchema.parse(req.body);

      // Convert amount to cents for Stripe (JMD doesn't have subunits, but Stripe expects cents)
      const stripeAmount = currency === 'jmd' ? amount : amount * 100;

      const paymentIntent = await stripe.paymentIntents.create({
        amount: stripeAmount,
        currency: currency,
        payment_method: paymentMethodId,
        confirmation_method: 'manual',
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/success`,
        metadata: {
          userId,
          circleId: circleId || '',
          platform: 'digital-pardna'
        },
        description: description || 'Digital Pardna Circle Contribution'
      });

      // Store payment record in database
      const payment = await prisma.payment.create({
        data: {
          id: paymentIntent.id,
          user_id: userId,
          circle_id: circleId,
          amount: BigInt(amount),
          currency,
          status: 'pending',
          payment_method: 'stripe_card',
          stripe_payment_intent_id: paymentIntent.id,
          created_at: new Date()
        }
      });

      return {
        success: true,
        paymentIntent: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          client_secret: paymentIntent.client_secret
        },
        payment: {
          id: payment.id,
          amount: Number(payment.amount),
          currency: payment.currency,
          status: payment.status
        }
      };

    } catch (error) {
      app.log.error('Stripe payment creation failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed'
      });
    }
  });

  // Confirm payment (for 3D Secure or additional authentication)
  app.post('/payments/stripe/confirm/:paymentIntentId', async (req, reply) => {
    try {
      const { paymentIntentId } = req.params as { paymentIntentId: string };

      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId);

      // Update payment status in database
      await prisma.payment.update({
        where: { stripe_payment_intent_id: paymentIntentId },
        data: {
          status: paymentIntent.status === 'succeeded' ? 'succeeded' : 'failed',
          updated_at: new Date()
        }
      });

      return {
        success: true,
        status: paymentIntent.status,
        client_secret: paymentIntent.client_secret
      };

    } catch (error) {
      app.log.error('Stripe payment confirmation failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Payment confirmation failed'
      });
    }
  });

  // Create customer for recurring payments
  app.post('/payments/stripe/create-customer', async (req, reply) => {
    try {
      const { userId, email, name } = req.body as { 
        userId: string; 
        email: string; 
        name: string; 
      };

      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          userId,
          platform: 'digital-pardna'
        }
      });

      // Store Stripe customer ID in user record
      await prisma.user.update({
        where: { id: userId },
        data: { stripe_customer_id: customer.id }
      });

      return {
        success: true,
        customerId: customer.id
      };

    } catch (error) {
      app.log.error('Stripe customer creation failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Customer creation failed'
      });
    }
  });

  // Setup payment method for future use
  app.post('/payments/stripe/setup-payment-method', async (req, reply) => {
    try {
      const { customerId, paymentMethodId } = req.body as {
        customerId: string;
        paymentMethodId: string;
      };

      // Attach payment method to customer
      await stripe.paymentMethods.attach(paymentMethodId, {
        customer: customerId,
      });

      // Create setup intent for future payments
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method: paymentMethodId,
        confirm: true,
        return_url: `${process.env.FRONTEND_URL}/payment/setup-complete`
      });

      return {
        success: true,
        setupIntent: {
          id: setupIntent.id,
          status: setupIntent.status,
          client_secret: setupIntent.client_secret
        }
      };

    } catch (error) {
      app.log.error('Payment method setup failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Payment method setup failed'
      });
    }
  });

  // Process automatic circle payout
  app.post('/payments/stripe/payout', async (req, reply) => {
    try {
      const { recipientAccountId, amount, currency, roundId } = req.body as {
        recipientAccountId: string;
        amount: number;
        currency: string;
        roundId: string;
      };

      // Create transfer to recipient's connected account or bank
      const transfer = await stripe.transfers.create({
        amount: currency === 'jmd' ? amount : amount * 100,
        currency: currency,
        destination: recipientAccountId,
        metadata: {
          roundId,
          type: 'circle_payout',
          platform: 'digital-pardna'
        }
      });

      // Record payout in database
      const payout = await prisma.payout.create({
        data: {
          id: transfer.id,
          round_id: roundId,
          recipient_account_id: recipientAccountId,
          amount: BigInt(amount),
          currency,
          status: 'completed',
          stripe_transfer_id: transfer.id,
          created_at: new Date()
        }
      });

      return {
        success: true,
        transfer: {
          id: transfer.id,
          amount: transfer.amount,
          status: 'completed'
        },
        payout: {
          id: payout.id,
          amount: Number(payout.amount),
          status: payout.status
        }
      };

    } catch (error) {
      app.log.error('Stripe payout failed:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Payout failed'
      });
    }
  });

  // Webhook handler for Stripe events
  app.post('/payments/stripe/webhook', async (req, reply) => {
    try {
      const sig = req.headers['stripe-signature'] as string;
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

      let event: Stripe.Event;

      try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } catch (err) {
        app.log.error('Webhook signature verification failed:', err);
        return reply.status(400).send('Webhook signature verification failed');
      }

      // Handle different event types
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          
          // Update payment status in database
          await prisma.payment.update({
            where: { stripe_payment_intent_id: paymentIntent.id },
            data: {
              status: 'succeeded',
              updated_at: new Date()
            }
          });

          // Check if circle round is fully funded
          const payment = await prisma.payment.findFirst({
            where: { stripe_payment_intent_id: paymentIntent.id },
            include: { circle: true }
          });

          if (payment?.circle_id) {
            await checkAndProcessCircleCompletion(payment.circle_id);
          }
          break;

        case 'payment_intent.payment_failed':
          const failedPayment = event.data.object as Stripe.PaymentIntent;
          
          await prisma.payment.update({
            where: { stripe_payment_intent_id: failedPayment.id },
            data: {
              status: 'failed',
              updated_at: new Date()
            }
          });
          break;

        case 'transfer.created':
          // Handle successful payout
          const transfer = event.data.object as Stripe.Transfer;
          app.log.info(`Payout completed: ${transfer.id}`);
          break;

        default:
          app.log.info(`Unhandled event type: ${event.type}`);
      }

      return { received: true };

    } catch (error) {
      app.log.error('Webhook processing failed:', error);
      return reply.status(500).send('Webhook processing failed');
    }
  });

  // Get payment methods for a customer
  app.get('/payments/stripe/payment-methods/:customerId', async (req, reply) => {
    try {
      const { customerId } = req.params as { customerId: string };

      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return {
        success: true,
        paymentMethods: paymentMethods.data.map(pm => ({
          id: pm.id,
          type: pm.type,
          card: pm.card ? {
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year
          } : null
        }))
      };

    } catch (error) {
      app.log.error('Failed to fetch payment methods:', error);
      return reply.status(400).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch payment methods'
      });
    }
  });

};

// Helper function to check if circle round is complete and trigger payout
async function checkAndProcessCircleCompletion(circleId: string) {
  const circle = await prisma.circle.findUnique({
    where: { id: circleId },
    include: {
      members: true,
      rounds: {
        where: { status: 'open' },
        include: { contributions: true }
      }
    }
  });

  if (!circle || circle.rounds.length === 0) return;

  const currentRound = circle.rounds[0];
  const expectedContributions = circle.members.length;
  const receivedContributions = currentRound.contributions.filter(c => c.status === 'succeeded').length;

  if (receivedContributions >= expectedContributions) {
    // Round is fully funded - trigger automatic payout
    await prisma.round.update({
      where: { id: currentRound.id },
      data: { status: 'funded' }
    });

    // TODO: Trigger automatic payout to round recipient
    // This would integrate with the payout endpoint above
  }
}

export default stripeRoutes;