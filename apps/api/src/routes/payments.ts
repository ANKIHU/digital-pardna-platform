import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db.js';

const paymentSchema = z.object({
  membershipId: z.string().uuid(),
  amountMinor: z.number().int().positive(),
  roundIndex: z.number().int().min(0),
  paymentRef: z.string().optional()
});

const updatePaymentSchema = z.object({
  status: z.enum(['pending', 'succeeded', 'failed']).optional(),
  paymentRef: z.string().optional()
});

const paymentsRoutes: FastifyPluginAsync = async (app) => {
  // GET /circles/:id/payments
  app.get('/circles/:id/payments', async (req) => {
    const { id } = req.params as { id: string };
    const contributions = await prisma.contribution.findMany({
      where: {
        round: { circle_id: id }
      },
      include: {
        membership: { include: { user: true } },
        round: true
      },
      orderBy: { paid_at: 'desc' }
    });
    
    const payments = contributions.map(c => ({
      id: c.id,
      roundId: c.round_id,
      membershipId: c.membership_id,
      amount: Number(c.amount),
      status: c.status,
      paidAt: c.paid_at?.toISOString(),
      paymentRef: c.payment_ref,
      member: c.membership.user.name,
      roundIndex: c.round.index_num
    }));
    
    return { circleId: id, payments };
  });

  // POST /circles/:id/payments
  app.post('/circles/:id/payments', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = paymentSchema.parse(req.body);
      
      const round = await prisma.round.findUnique({
        where: {
          circle_id_index_num: {
            circle_id: id,
            index_num: data.roundIndex
          }
        }
      });
      
      if (!round) {
        return reply.code(404).send({ error: 'Round not found' });
      }
      
      const payment = await prisma.contribution.create({
        data: {
          round_id: round.id,
          membership_id: data.membershipId,
          amount: BigInt(data.amountMinor),
          status: 'succeeded',
          paid_at: new Date(),
          payment_ref: data.paymentRef || `PAY-${Date.now()}`
        },
        include: {
          membership: { include: { user: true } },
          round: true
        }
      });
      
      reply.code(201).send({
        id: payment.id,
        roundId: payment.round_id,
        membershipId: payment.membership_id,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paid_at?.toISOString(),
        paymentRef: payment.payment_ref,
        member: payment.membership.user.name
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // GET /payments/:id
  app.get('/payments/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const payment = await prisma.contribution.findUnique({
      where: { id },
      include: {
        membership: { include: { user: true } },
        round: { include: { circle: true } }
      }
    });
    
    if (!payment) {
      return reply.code(404).send({ error: 'Payment not found' });
    }
    
    return {
      id: payment.id,
      roundId: payment.round_id,
      membershipId: payment.membership_id,
      amount: Number(payment.amount),
      status: payment.status,
      paidAt: payment.paid_at?.toISOString(),
      paymentRef: payment.payment_ref,
      member: payment.membership.user.name,
      circle: {
        id: payment.round.circle.id,
        name: payment.round.circle.name,
        currency: payment.round.circle.currency
      },
      round: {
        id: payment.round.id,
        index: payment.round.index_num,
        dueAt: payment.round.due_at.toISOString()
      }
    };
  });

  // PUT /payments/:id
  app.put('/payments/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = updatePaymentSchema.parse(req.body);
      
      const payment = await prisma.contribution.update({
        where: { id },
        data: {
          status: data.status,
          payment_ref: data.paymentRef
        },
        include: {
          membership: { include: { user: true } },
          round: { include: { circle: true } }
        }
      });
      
      reply.send({
        id: payment.id,
        roundId: payment.round_id,
        membershipId: payment.membership_id,
        amount: Number(payment.amount),
        status: payment.status,
        paidAt: payment.paid_at?.toISOString(),
        paymentRef: payment.payment_ref,
        member: payment.membership.user.name,
        updatedAt: new Date().toISOString()
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
};

export default paymentsRoutes;