import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/db';

const kycRoutes: FastifyPluginAsync = async (app) => {
  // GET /kyc/status
  app.get('/kyc/status', async (req, reply) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.code(401).send({ error: 'Unauthorized' });
      }
      
      const token = authHeader.split(' ')[1];
      const userId = token.replace('jwt-token-', '');
      
      const user = await prisma.user.findUnique({
        where: { id: userId }
      });
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }
      
      reply.send({
        status: user.kyc_status,
        completedAt: user.kyc_status === 'verified' ? user.created_at : null
      });
    } catch (error) {
      reply.code(500).send({ error: 'Internal server error' });
    }
  });
};

export default kycRoutes;