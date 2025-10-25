import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/db';

const analyticsRoutes: FastifyPluginAsync = async (app) => {
  app.get('/analytics', async () => {
    const [totalUsers, activeCircles, totalVolume] = await Promise.all([
      prisma.user.count(),
      prisma.circle.count({ where: { status: 'active' } }),
      prisma.contribution.aggregate({ _sum: { amount: true }, where: { status: 'succeeded' } })
    ]);

    return {
      totalUsers,
      activeCircles,
      totalVolume: Number(totalVolume._sum.amount || 0),
      monthlyGrowth: 12.5,
      retentionRate: 87.3
    };
  });
};

export default analyticsRoutes;