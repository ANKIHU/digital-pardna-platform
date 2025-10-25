
import { FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
// import { PrismaClient } from '@prisma/client';
import circlesRoutes from './circles.js';
import membersRoutes from './members.js';
import paymentsRoutes from './payments.js';
import roundsRoutes from './rounds.js';
import stripeRoutes from './stripe.js';
import jamaicaBankingRoutes from './jamaica-banking.js';
import kycVerificationRoutes from './kyc-verification.js';
import regulatoryComplianceRoutes from './regulatory-compliance.js';
import communicationRoutes from './communication.js';
import bojComplianceRoutes from './boj-compliance.js';
import authRoutes from './auth.js';
// const prisma = new PrismaClient();

export const appRoutes: FastifyPluginAsync = async (app) => {
  app.get('/health', async () => ({ ok: true }));
  
  // Authentication routes
  await app.register(authRoutes, { prefix: '/v1' });
  
  // Core pardna system routes
  await app.register(circlesRoutes);
  await app.register(membersRoutes);
  await app.register(paymentsRoutes);
  await app.register(roundsRoutes);
  
  // Real API integrations
  await app.register(stripeRoutes, { prefix: '/stripe' });
  await app.register(jamaicaBankingRoutes, { prefix: '/banking' });
  await app.register(kycVerificationRoutes, { prefix: '/kyc' });
  await app.register(regulatoryComplianceRoutes, { prefix: '/compliance' });
  await app.register(communicationRoutes, { prefix: '/communication' });
  
  // BOJ Regulatory Compliance
  await app.register(bojComplianceRoutes, { prefix: '/v1/boj' });
};
