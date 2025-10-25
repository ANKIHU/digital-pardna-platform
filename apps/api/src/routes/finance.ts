import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/db';

const financeRoutes: FastifyPluginAsync = async (app) => {
  app.get('/finance/overview', async () => {
    const [totalContributions, totalPayouts, activeCircles] = await Promise.all([
      prisma.contribution.aggregate({ _sum: { amount: true }, where: { status: 'succeeded' } }),
      prisma.payout.aggregate({ _sum: { amount: true }, where: { status: 'succeeded' } }),
      prisma.circle.count({ where: { status: 'active' } })
    ]);

    const recentTransactions = await prisma.transaction.findMany({
      take: 10,
      orderBy: { created_at: 'desc' },
      include: { wallet: { include: { user: true } } }
    });

    return {
      totalValue: Number(totalContributions._sum.amount || 0),
      activeCircles,
      monthlyFlow: Number(totalContributions._sum.amount || 0) - Number(totalPayouts._sum.amount || 0),
      portfolioGrowth: 12.5,
      savingsRate: 8.2,
      investmentReturn: 6.8,
      recentTransactions: recentTransactions.map(t => ({
        id: t.id,
        type: t.type === 'credit' ? 'credit' : 'debit',
        amount: Number(t.amount),
        description: `${t.type} - ${t.wallet.user.name}`,
        date: t.created_at.toISOString().split('T')[0],
        status: t.status
      }))
    };
  });
};

export default financeRoutes;