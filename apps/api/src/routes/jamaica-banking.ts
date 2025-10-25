import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import crypto from 'crypto';
import { prisma } from '../lib/db';

// Schema for bank API requests
const bankTransferSchema = z.object({
  fromAccount: z.string(),
  toAccount: z.string(),
  amount: z.number().positive(),
  currency: z.enum(['JMD', 'USD']).default('JMD'),
  reference: z.string(),
  description: z.string().optional()
});

const bankVerificationSchema = z.object({
  accountNumber: z.string(),
  routingNumber: z.string().optional(),
  bankCode: z.string()
});

const jamaicaBankingRoutes: FastifyPluginAsync = async (app) => {

  // NCB (National Commercial Bank) Integration
  app.register(async function(app) {
    const NCB_API_BASE = process.env.NCB_API_BASE || 'https://api.ncbonline.com';
    const NCB_CLIENT_ID = process.env.NCB_CLIENT_ID;
    const NCB_CLIENT_SECRET = process.env.NCB_CLIENT_SECRET;

    // Generate NCB OAuth token
    async function getNcbAccessToken() {
      try {
        const response = await fetch(`${NCB_API_BASE}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${NCB_CLIENT_ID}:${NCB_CLIENT_SECRET}`).toString('base64')}`
          },
          body: 'grant_type=client_credentials&scope=payments accounts'
        });

        if (!response.ok) {
          throw new Error(`NCB OAuth failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
      } catch (error) {
        app.log.error('NCB OAuth failed:', error);
        throw error;
      }
    }

    // NCB Account Verification
    app.post('/banking/ncb/verify-account', async (req, reply) => {
      try {
        const { accountNumber, routingNumber, bankCode } = bankVerificationSchema.parse(req.body);
        const accessToken = await getNcbAccessToken();

        const response = await fetch(`${NCB_API_BASE}/v1/accounts/verify`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID()
          },
          body: JSON.stringify({
            accountNumber,
            routingNumber,
            bankCode
          })
        });

        if (!response.ok) {
          throw new Error(`NCB verification failed: ${response.statusText}`);
        }

        const verificationData = await response.json();

        return {
          success: true,
          verified: verificationData.valid,
          accountHolder: verificationData.accountName,
          accountType: verificationData.accountType,
          bank: 'NCB',
          verificationId: verificationData.verificationId
        };

      } catch (error) {
        app.log.error('NCB account verification failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Account verification failed'
        });
      }
    });

    // NCB Bank Transfer
    app.post('/banking/ncb/transfer', async (req, reply) => {
      try {
        const { fromAccount, toAccount, amount, currency, reference, description } = 
          bankTransferSchema.parse(req.body);
        
        const accessToken = await getNcbAccessToken();

        const transferRequest = {
          fromAccount,
          toAccount,
          amount: amount * 100, // Convert to cents
          currency,
          reference,
          description: description || 'Digital Pardna Transfer',
          requestId: crypto.randomUUID(),
          timestamp: new Date().toISOString()
        };

        const response = await fetch(`${NCB_API_BASE}/v1/transfers`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Request-ID': transferRequest.requestId
          },
          body: JSON.stringify(transferRequest)
        });

        if (!response.ok) {
          throw new Error(`NCB transfer failed: ${response.statusText}`);
        }

        const transferData = await response.json();

        // Record transfer in database
        const transfer = await prisma.bankTransfer.create({
          data: {
            id: transferData.transferId,
            from_account: fromAccount,
            to_account: toAccount,
            amount: BigInt(amount * 100),
            currency,
            reference,
            status: transferData.status,
            bank_provider: 'NCB',
            external_id: transferData.transferId,
            created_at: new Date()
          }
        });

        return {
          success: true,
          transferId: transferData.transferId,
          status: transferData.status,
          amount: amount,
          currency,
          reference,
          estimatedCompletion: transferData.estimatedCompletion
        };

      } catch (error) {
        app.log.error('NCB transfer failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Transfer failed'
        });
      }
    });

    // NCB Balance Inquiry
    app.get('/banking/ncb/balance/:accountNumber', async (req, reply) => {
      try {
        const { accountNumber } = req.params as { accountNumber: string };
        const accessToken = await getNcbAccessToken();

        const response = await fetch(`${NCB_API_BASE}/v1/accounts/${accountNumber}/balance`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'X-Request-ID': crypto.randomUUID()
          }
        });

        if (!response.ok) {
          throw new Error(`NCB balance inquiry failed: ${response.statusText}`);
        }

        const balanceData = await response.json();

        return {
          success: true,
          accountNumber,
          availableBalance: balanceData.availableBalance / 100,
          currentBalance: balanceData.currentBalance / 100,
          currency: balanceData.currency,
          lastUpdated: balanceData.lastUpdated
        };

      } catch (error) {
        app.log.error('NCB balance inquiry failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Balance inquiry failed'
        });
      }
    });

  }, { prefix: '/ncb' });

  // Scotiabank Jamaica Integration
  app.register(async function(app) {
    const SCOTIA_API_BASE = process.env.SCOTIA_API_BASE || 'https://api.scotiabank.com.jm';
    const SCOTIA_CLIENT_ID = process.env.SCOTIA_CLIENT_ID;
    const SCOTIA_CLIENT_SECRET = process.env.SCOTIA_CLIENT_SECRET;

    // Generate Scotiabank OAuth token
    async function getScotiaAccessToken() {
      try {
        const response = await fetch(`${SCOTIA_API_BASE}/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${SCOTIA_CLIENT_ID}:${SCOTIA_CLIENT_SECRET}`).toString('base64')}`
          },
          body: 'grant_type=client_credentials&scope=accounts payments'
        });

        if (!response.ok) {
          throw new Error(`Scotia OAuth failed: ${response.statusText}`);
        }

        const data = await response.json();
        return data.access_token;
      } catch (error) {
        app.log.error('Scotia OAuth failed:', error);
        throw error;
      }
    }

    // Scotiabank Account Verification
    app.post('/banking/scotia/verify-account', async (req, reply) => {
      try {
        const { accountNumber, bankCode } = bankVerificationSchema.parse(req.body);
        const accessToken = await getScotiaAccessToken();

        const response = await fetch(`${SCOTIA_API_BASE}/v1/account-verification`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Correlation-ID': crypto.randomUUID()
          },
          body: JSON.stringify({
            accountNumber,
            institutionCode: bankCode
          })
        });

        if (!response.ok) {
          throw new Error(`Scotia verification failed: ${response.statusText}`);
        }

        const verificationData = await response.json();

        return {
          success: true,
          verified: verificationData.accountValid,
          accountHolder: verificationData.accountHolderName,
          accountType: verificationData.productType,
          bank: 'Scotiabank',
          verificationReference: verificationData.verificationReference
        };

      } catch (error) {
        app.log.error('Scotia account verification failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Account verification failed'
        });
      }
    });

    // Scotiabank Interac e-Transfer (for card processing)
    app.post('/banking/scotia/card-payment', async (req, reply) => {
      try {
        const { cardNumber, expiryDate, cvv, amount, currency, cardholderName } = req.body as {
          cardNumber: string;
          expiryDate: string;
          cvv: string;
          amount: number;
          currency: string;
          cardholderName: string;
        };

        const accessToken = await getScotiaAccessToken();

        const paymentRequest = {
          card: {
            number: cardNumber,
            expiryMonth: expiryDate.split('/')[0],
            expiryYear: expiryDate.split('/')[1],
            cvv,
            holderName: cardholderName
          },
          amount: amount * 100,
          currency,
          merchantId: process.env.SCOTIA_MERCHANT_ID,
          transactionId: crypto.randomUUID(),
          description: 'Digital Pardna Payment'
        };

        const response = await fetch(`${SCOTIA_API_BASE}/v1/card-payments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
            'X-Correlation-ID': crypto.randomUUID()
          },
          body: JSON.stringify(paymentRequest)
        });

        if (!response.ok) {
          throw new Error(`Scotia card payment failed: ${response.statusText}`);
        }

        const paymentData = await response.json();

        return {
          success: true,
          transactionId: paymentData.transactionId,
          status: paymentData.status,
          amount: amount,
          currency,
          authorizationCode: paymentData.authorizationCode,
          receipt: paymentData.receiptNumber
        };

      } catch (error) {
        app.log.error('Scotia card payment failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Card payment failed'
        });
      }
    });

  }, { prefix: '/scotia' });

  // LYNK Mobile Money Integration
  app.register(async function(app) {
    const LYNK_API_BASE = process.env.LYNK_API_BASE || 'https://api.lynk.com.jm';
    const LYNK_MERCHANT_ID = process.env.LYNK_MERCHANT_ID;
    const LYNK_API_KEY = process.env.LYNK_API_KEY;

    // LYNK Payment Request
    app.post('/banking/lynk/payment', async (req, reply) => {
      try {
        const { phoneNumber, amount, currency, reference } = req.body as {
          phoneNumber: string;
          amount: number;
          currency: string;
          reference: string;
        };

        const paymentRequest = {
          merchantId: LYNK_MERCHANT_ID,
          phoneNumber: phoneNumber.replace(/\D/g, ''), // Remove non-digits
          amount: amount * 100,
          currency,
          reference,
          callbackUrl: `${process.env.API_BASE_URL}/banking/lynk/callback`,
          description: 'Digital Pardna Circle Payment'
        };

        const response = await fetch(`${LYNK_API_BASE}/v1/payments`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LYNK_API_KEY}`,
            'Content-Type': 'application/json',
            'X-Request-ID': crypto.randomUUID()
          },
          body: JSON.stringify(paymentRequest)
        });

        if (!response.ok) {
          throw new Error(`LYNK payment failed: ${response.statusText}`);
        }

        const paymentData = await response.json();

        return {
          success: true,
          paymentId: paymentData.paymentId,
          status: paymentData.status,
          amount: amount,
          phoneNumber,
          reference,
          ussdCode: paymentData.ussdCode // User dials this to complete payment
        };

      } catch (error) {
        app.log.error('LYNK payment failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'LYNK payment failed'
        });
      }
    });

    // LYNK Payment Status Check
    app.get('/banking/lynk/status/:paymentId', async (req, reply) => {
      try {
        const { paymentId } = req.params as { paymentId: string };

        const response = await fetch(`${LYNK_API_BASE}/v1/payments/${paymentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${LYNK_API_KEY}`,
            'X-Request-ID': crypto.randomUUID()
          }
        });

        if (!response.ok) {
          throw new Error(`LYNK status check failed: ${response.statusText}`);
        }

        const statusData = await response.json();

        return {
          success: true,
          paymentId,
          status: statusData.status,
          amount: statusData.amount / 100,
          completedAt: statusData.completedAt
        };

      } catch (error) {
        app.log.error('LYNK status check failed:', error);
        return reply.status(400).send({
          success: false,
          error: error instanceof Error ? error.message : 'Status check failed'
        });
      }
    });

    // LYNK Webhook for payment notifications
    app.post('/banking/lynk/callback', async (req, reply) => {
      try {
        const { paymentId, status, amount, phoneNumber } = req.body;

        // Update payment status in database
        await prisma.payment.updateMany({
          where: { 
            external_payment_id: paymentId,
            payment_method: 'lynk_mobile'
          },
          data: {
            status: status === 'completed' ? 'succeeded' : 'failed',
            updated_at: new Date()
          }
        });

        return { success: true };

      } catch (error) {
        app.log.error('LYNK callback processing failed:', error);
        return reply.status(500).send({ success: false });
      }
    });

  }, { prefix: '/lynk' });

};

export default jamaicaBankingRoutes;