import { FastifyPluginAsync } from 'fastify';
import { prisma } from '../lib/db';

const walletRoutes: FastifyPluginAsync = async (app) => {
  app.get('/wallet/:userId', async (req) => {
    const { userId } = req.params as { userId: string };
    
    const wallet = await prisma.wallet.findFirst({
      where: { user_id: userId },
      include: { user: true }
    });

    if (!wallet) {
      return { balance: 0, currency: 'JMD' };
    }

    return {
      id: wallet.id,
      balance: Number(wallet.balance_minor),
      currency: wallet.currency,
      user: wallet.user.name
    };
  });

  app.get('/wallet/:userId/transactions', async (req) => {
    const { userId } = req.params as { userId: string };
    
    const wallet = await prisma.wallet.findFirst({
      where: { user_id: userId }
    });

    if (!wallet) {
      return { transactions: [] };
    }

    const transactions = await prisma.transaction.findMany({
      where: { wallet_id: wallet.id },
      orderBy: { created_at: 'desc' },
      take: 50
    });

    return {
      transactions: transactions.map(t => ({
        id: t.id,
        type: t.type,
        amount: Number(t.amount),
        status: t.status,
        date: t.created_at.toISOString(),
        reference: t.payout_ref
      }))
    };
  });
};

export default walletRoutes;