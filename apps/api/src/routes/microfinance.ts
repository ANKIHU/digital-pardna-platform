import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { prisma } from '../lib/db';

const loanApplicationSchema = z.object({
  amount: z.number().positive(),
  purpose: z.string().min(1),
  businessType: z.string().min(1),
  monthlyIncome: z.number().positive(),
  monthlyExpenses: z.number().positive(),
  collateralType: z.string().optional(),
  collateralValue: z.number().optional(),
  requestedTerm: z.number().int().min(6).max(36)
});

const microfinanceRoutes: FastifyPluginAsync = async (app) => {
  app.get('/microfinance/loans', async () => {
    // Mock data since loan schema not in current DB
    return {
      loans: [
        {
          id: '1',
          amount: 500000,
          purpose: 'Business Expansion',
          status: 'active',
          interestRate: 8.5,
          term: 24,
          monthlyPayment: 24500,
          remainingBalance: 380000,
          nextPaymentDate: '2025-11-01',
          creditScore: 720,
          appliedDate: '2025-08-15'
        }
      ]
    };
  });

  app.post('/microfinance/loans/apply', async (req, reply) => {
    try {
      const data = loanApplicationSchema.parse(req.body);
      
      // Calculate basic loan terms
      const monthlyRate = 0.085 / 12;
      const monthlyPayment = (data.amount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -data.requestedTerm));
      
      // Mock loan application processing
      const application = {
        id: Date.now().toString(),
        ...data,
        status: 'pending',
        monthlyPayment: Math.round(monthlyPayment),
        appliedDate: new Date().toISOString().split('T')[0]
      };

      reply.code(201).send({ success: true, application });
    } catch (error) {
      if (error instanceof z.ZodError) {
        reply.code(400).send({ error: 'Validation failed', details: error.errors });
      } else {
        reply.code(500).send({ error: 'Internal server error' });
      }
    }
  });
};

export default microfinanceRoutes;