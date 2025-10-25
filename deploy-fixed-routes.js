// Quick route fix for EC2 deployment
const fastify = require('fastify')({ logger: true });

// Health endpoint
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// Circles endpoints
fastify.get('/v1/circles', async () => ({ circles: [] }));
fastify.post('/v1/circles', async (req, reply) => {
  reply.code(201).send({ id: 'test-circle-id', message: 'Circle created' });
});

// Members endpoints  
fastify.get('/v1/circles/:id/members', async (req) => ({ 
  circleId: req.params.id, 
  members: [] 
}));

// Payments endpoints
fastify.get('/v1/circles/:id/payments', async (req) => ({ 
  circleId: req.params.id, 
  payments: [] 
}));

// Start server
const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ PardnaLink API running on port 3001');
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();