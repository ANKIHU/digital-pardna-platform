import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db.js';

const circleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  handAmountMinor: z.number().int().positive(),
  currency: z.enum(['JMD', 'USD']),
  intervalSeconds: z.number().int().min(3600),
  startAtISO: z.string(),
  members: z.array(z.object({
    userId: z.string().uuid(),
    payoutPosition: z.number().int().min(0)
  }))
});

const updateCircleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  handAmountMinor: z.number().int().positive().optional(),
  intervalSeconds: z.number().int().min(3600).optional(),
  startAtISO: z.string().optional()
});

const circlesRoutes: FastifyPluginAsync = async (app) => {
  // GET /circles
  app.get('/circles', async () => {
    const circles = await prisma.circle.findMany({
      include: { members: true }
    });
    return { circles };
  });

  // POST /circles
  app.post('/circles', async (req, reply) => {
    try {
      const data = circleSchema.parse(req.body);
      const circle = await prisma.circle.create({
        data: {
          name: data.name,
          hand_amount: BigInt(data.handAmountMinor),
          currency: data.currency,
          interval_seconds: data.intervalSeconds,
          start_at: new Date(data.startAtISO),
          status: 'planned'
        }
      });
      
      await prisma.$transaction(
        data.members.map(m => 
          prisma.membership.create({
            data: {
              circle_id: circle.id,
              user_id: m.userId,
              payout_position: m.payoutPosition
            }
          })
        )
      );
      
      reply.code(201).send({ id: circle.id });
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // PUT /circles/:id
  app.put('/circles/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = updateCircleSchema.parse(req.body);
      
      const circle = await prisma.circle.update({
        where: { id },
        data: {
          name: data.name,
          hand_amount: data.handAmountMinor ? BigInt(data.handAmountMinor) : undefined,
          interval_seconds: data.intervalSeconds,
          start_at: data.startAtISO ? new Date(data.startAtISO) : undefined
        }
      });
      
      reply.send(circle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /circles/:id
  app.delete('/circles/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    
    await prisma.circle.delete({ where: { id } });
    reply.code(204).send();
  });
};

export default circlesRoutes;