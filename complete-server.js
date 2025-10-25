const fastify = require('fastify')({ logger: true });

// BigInt serialization fix
fastify.addHook('preSerialization', async (request, reply, payload) => {
  return JSON.parse(JSON.stringify(payload, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
});

// CORS
fastify.addHook('preHandler', (req, reply, done) => {
  reply.header('Access-Control-Allow-Origin', '*');
  reply.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE');
  reply.header('Access-Control-Allow-Headers', 'Content-Type,Authorization');
  done();
});

// Health endpoints
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));
fastify.get('/v1/health', async () => ({ ok: true }));

// Circles endpoints
fastify.get('/v1/circles', async () => ({ circles: [] }));
fastify.post('/v1/circles', async (req, reply) => {
  const circle = { id: 'circle-' + Date.now(), ...req.body, status: 'planned' };
  reply.code(201).send(circle);
});
fastify.get('/v1/circles/:id', async (req) => ({ id: req.params.id, name: 'Test Circle' }));
fastify.put('/v1/circles/:id', async (req) => ({ id: req.params.id, ...req.body, updated: true }));
fastify.delete('/v1/circles/:id', async (req, reply) => { reply.code(204).send(); });

// Members endpoints
fastify.get('/v1/circles/:id/members', async (req) => ({ circleId: req.params.id, members: [] }));
fastify.post('/v1/circles/:id/members', async (req, reply) => {
  const member = { id: 'member-' + Date.now(), circleId: req.params.id, ...req.body };
  reply.code(201).send(member);
});

// Payments endpoints
fastify.get('/v1/circles/:id/payments', async (req) => ({ circleId: req.params.id, payments: [] }));
fastify.post('/v1/circles/:id/payments', async (req, reply) => {
  const payment = { id: 'payment-' + Date.now(), circleId: req.params.id, ...req.body, status: 'succeeded' };
  reply.code(201).send(payment);
});
fastify.get('/v1/payments/:id', async (req) => ({ id: req.params.id, status: 'succeeded' }));

// Rounds endpoints
fastify.get('/v1/circles/:id/rounds', async (req) => ({ circleId: req.params.id, rounds: [] }));
fastify.post('/v1/circles/:id/rounds', async (req, reply) => {
  const round = { id: 'round-' + Date.now(), circleId: req.params.id, ...req.body, status: 'active' };
  reply.code(201).send(round);
});
fastify.get('/v1/rounds/:id', async (req) => ({ id: req.params.id, status: 'active' }));

// Users endpoints
fastify.post('/v1/users', async (req, reply) => {
  const user = { id: 'user-' + Date.now(), ...req.body, createdAt: new Date().toISOString() };
  reply.code(201).send(user);
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ Complete PardnaLink API running on port 3001');
    console.log('📋 Available endpoints:');
    console.log('  GET  /health');
    console.log('  GET  /v1/health');
    console.log('  GET  /v1/circles');
    console.log('  POST /v1/circles');
    console.log('  GET  /v1/circles/:id/members');
    console.log('  GET  /v1/circles/:id/payments');
    console.log('  GET  /v1/circles/:id/rounds');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();