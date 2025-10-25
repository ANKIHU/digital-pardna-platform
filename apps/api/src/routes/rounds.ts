import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db.js';

const createRoundSchema = z.object({
  roundNumber: z.number().int().min(1),
  startDate: z.string(),
  endDate: z.string(),
  winnerId: z.string().uuid().optional()
});

const updateRoundSchema = z.object({
  status: z.enum(['active', 'completed', 'cancelled']).optional(),
  winnerId: z.string().uuid().optional(),
  endDate: z.string().optional()
});

const roundsRoutes: FastifyPluginAsync = async (app) => {
  // GET /circles/:id/rounds - List all rounds for a circle
  app.get('/circles/:id/rounds', async (req) => {
    const { id } = req.params as { id: string };
    const rounds = await prisma.round.findMany({
      where: { circle_id: id },
      include: { 
        contributions: true,
        payouts: { include: { membership: { include: { user: true } } } }
      },
      orderBy: { index_num: 'asc' }
    });
    
    const formattedRounds = rounds.map(round => ({
      roundId: round.id,
      circleId: round.circle_id,
      roundNumber: round.index_num + 1,
      startDate: round.due_at.toISOString(),
      endDate: new Date(round.due_at.getTime() + 86400000).toISOString(),
      status: round.status === 'open' ? 'active' : round.status === 'payed' ? 'completed' : round.status,
      winnerId: round.payouts[0]?.membership?.user_id || null,
      contributions: round.contributions.length,
      totalAmount: round.contributions.reduce((sum, c) => sum + Number(c.amount), 0)
    }));
    
    return { circleId: id, rounds: formattedRounds };
  });

  // POST /circles/:id/rounds - Create new round
  app.post('/circles/:id/rounds', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = createRoundSchema.parse(req.body);
      
      const circle = await prisma.circle.findUnique({ where: { id } });
      if (!circle) {
        return reply.code(404).send({ error: 'Circle not found' });
      }
      
      const round = await prisma.round.create({
        data: {
          circle_id: id,
          index_num: data.roundNumber - 1,
          due_at: new Date(data.startDate),
          status: 'open'
        }
      });
      
      reply.code(201).send({
        roundId: round.id,
        circleId: round.circle_id,
        roundNumber: data.roundNumber,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'active',
        winnerId: data.winnerId || null
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // GET /rounds/:id - Get specific round details
  app.get('/rounds/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const round = await prisma.round.findUnique({
      where: { id },
      include: {
        circle: true,
        contributions: { include: { membership: { include: { user: true } } } },
        payouts: { include: { membership: { include: { user: true } } } }
      }
    });
    
    if (!round) {
      return reply.code(404).send({ error: 'Round not found' });
    }
    
    return {
      roundId: round.id,
      circleId: round.circle_id,
      roundNumber: round.index_num + 1,
      startDate: round.due_at.toISOString(),
      endDate: new Date(round.due_at.getTime() + 86400000).toISOString(),
      status: round.status === 'open' ? 'active' : round.status === 'payed' ? 'completed' : round.status,
      winnerId: round.payouts[0]?.membership?.user_id || null,
      circle: {
        name: round.circle.name,
        handAmount: Number(round.circle.hand_amount),
        currency: round.circle.currency
      },
      contributions: round.contributions.map(c => ({
        id: c.id,
        amount: Number(c.amount),
        status: c.status,
        paidAt: c.paid_at?.toISOString(),
        member: c.membership.user.name
      })),
      payout: round.payouts[0] ? {
        amount: Number(round.payouts[0].amount),
        winner: round.payouts[0].membership?.user.name,
        paidAt: round.payouts[0].paid_at?.toISOString()
      } : null
    };
  });

  // PUT /rounds/:id - Update round
  app.put('/rounds/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = updateRoundSchema.parse(req.body);
      
      const updateData: any = {};
      if (data.status) {
        updateData.status = data.status === 'active' ? 'open' : 
                           data.status === 'completed' ? 'payed' : data.status;
      }
      
      const round = await prisma.round.update({
        where: { id },
        data: updateData,
        include: {
          payouts: { include: { membership: { include: { user: true } } } }
        }
      });
      
      reply.send({
        roundId: round.id,
        circleId: round.circle_id,
        roundNumber: round.index_num + 1,
        status: round.status === 'open' ? 'active' : round.status === 'payed' ? 'completed' : round.status,
        winnerId: round.payouts[0]?.membership?.user_id || data.winnerId || null,
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

  // DELETE /rounds/:id - Delete round
  app.delete('/rounds/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    try {
      await prisma.round.delete({ where: { id } });
      reply.code(204).send();
    } catch (error) {
      reply.code(404).send({ error: 'Round not found' });
    }
  });
};

export default roundsRoutes;