import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/db';

const usersRoutes: FastifyPluginAsync = async (app) => {
  // GET /users/profile
  app.get('/users/profile', async (req, reply) => {
    try {
      // Mock authentication - in real app, extract from JWT
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      // Extract user ID from mock token
      const token = authHeader.split(' ')[1];
      const userId = token.replace('jwt-token-', '');
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      reply.send({
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        kycStatus: user.kyc_status,
        createdAt: user.created_at
      });
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });

  // POST /users/register (alias for auth/register)
  app.post('/users/register', async (req, reply) => {
    // Forward to auth route
    return app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: req.body
    });
  });
};

export default usersRoutes;