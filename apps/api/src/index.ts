import 'dotenv/config';
import Fastify from 'fastify';
import { appRoutes } from './routes/index.js';
import errorHandlerPlugin from './lib/error-handler.js';

const app = Fastify({ logger: true });

// Register error handling first
await app.register(errorHandlerPlugin);

// CORS configuration
app.addHook('preHandler', (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Request-ID');
  
  if (req.method === 'OPTIONS') {
    reply.status(200).send();
    return;
  }
  
  done();
});

// BigInt serialization
app.addHook('preSerialization', async (request, reply, payload) => {
  return JSON.parse(JSON.stringify(payload, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
});

// Register application routes
await app.register(appRoutes, { prefix: '/v1' });

const port = Number(process.env.PORT || 4000);
app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`🚀 Digital Pardna API running at http://localhost:${port}`);
  app.log.info(`📊 Health check: http://localhost:${port}/v1/health`);
}).catch(e => {
  app.log.error(e);
  process.exit(1);
});
