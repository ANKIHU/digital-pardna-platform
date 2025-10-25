// Fixed server with /api routes (not /v1)
const fastify = require('fastify')({ logger: true });

// BigInt serialization
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

// API routes (using /api prefix)
fastify.get('/api/circles', async () => ({ circles: [] }));
fastify.post('/api/circles', async (req, reply) => {
  reply.code(201).send({ id: 'circle-' + Date.now(), ...req.body, status: 'planned' });
});

fastify.get('/api/users', async () => ({ users: [] }));
fastify.post('/api/users', async (req, reply) => {
  reply.code(201).send({ id: 'user-' + Date.now(), ...req.body, createdAt: new Date().toISOString() });
});

fastify.get('/api/payments', async () => ({ payments: [] }));
fastify.post('/api/payments', async (req, reply) => {
  reply.code(201).send({ id: 'payment-' + Date.now(), ...req.body, status: 'succeeded' });
});

fastify.get('/api/transactions', async () => ({ transactions: [] }));
fastify.post('/api/transactions', async (req, reply) => {
  reply.code(201).send({ id: 'transaction-' + Date.now(), ...req.body, status: 'completed' });
});

// Auth routes
fastify.post('/api/auth/register', async (req, reply) => {
  reply.code(201).send({ 
    id: 'user-' + Date.now(), 
    ...req.body, 
    token: 'jwt-token-' + Date.now(),
    message: 'User registered successfully' 
  });
});

fastify.post('/api/auth/login', async (req, reply) => {
  reply.send({ 
    token: 'jwt-token-' + Date.now(),
    user: { id: 'user-123', email: req.body.email },
    message: 'Login successful' 
  });
});

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ PardnaLink API with /api routes running on port 3001');
    console.log('📋 Available endpoints:');
    console.log('  GET  /health');
    console.log('  GET  /api/circles');
    console.log('  GET  /api/users');
    console.log('  GET  /api/payments');
    console.log('  GET  /api/transactions');
    console.log('  POST /api/auth/register');
    console.log('  POST /api/auth/login');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();