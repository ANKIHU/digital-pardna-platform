import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db.js';

const memberSchema = z.object({
  userId: z.string().uuid(),
  payoutPosition: z.number().int().min(0),
  role: z.enum(['member', 'admin']).default('member')
});

const updateMemberSchema = z.object({
  payoutPosition: z.number().int().min(0).optional(),
  role: z.enum(['member', 'admin']).optional()
});

const membersRoutes: FastifyPluginAsync = async (app) => {
  // GET /circles/:id/members
  app.get('/circles/:id/members', async (req) => {
    const { id } = req.params as { id: string };
    const members = await prisma.membership.findMany({
      where: { circle_id: id },
      include: { user: true }
    });
    return { circleId: id, members };
  });

  // POST /circles/:id/members
  app.post('/circles/:id/members', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = memberSchema.parse(req.body);
      
      const member = await prisma.membership.create({
        data: {
          circle_id: id,
          user_id: data.userId,
          payout_position: data.payoutPosition,
          role: data.role
        }
      });
      
      reply.code(201).send(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });

  // DELETE /circles/:id/members
  app.delete('/circles/:id/members', async (req, reply) => {
    const { id } = req.params as { id: string };
    const { userId } = req.query as { userId: string };
    if (!userId) {
      return reply.code(400).send({ error: 'userId query parameter required' });
    }
    
    await prisma.membership.delete({
      where: {
        circle_id_user_id: {
          circle_id: id,
          user_id: userId
        }
      }
    });
    reply.code(204).send();
  });

  // GET /members/:id
  app.get('/members/:id', async (req, reply) => {
    const { id } = req.params as { id: string };
    const member = await prisma.membership.findUnique({
      where: { id },
      include: { user: true, circle: true }
    });
    
    if (!member) {
      return reply.code(404).send({ error: 'Member not found' });
    }
    
    return member;
  });

  // PUT /members/:id
  app.put('/members/:id', async (req, reply) => {
    try {
      const { id } = req.params as { id: string };
      const data = updateMemberSchema.parse(req.body);
      
      const member = await prisma.membership.update({
        where: { id },
        data: {
          payout_position: data.payoutPosition,
          role: data.role
        }
      });
      
      reply.send(member);
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
};

export default membersRoutes;