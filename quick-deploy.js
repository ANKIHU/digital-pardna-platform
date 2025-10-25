// Quick deployment script - run this on EC2
const fs = require('fs');
const { exec } = require('child_process');

console.log('🔧 Quick deploying routes...');

// Create a simple server with all routes
const serverCode = `
const fastify = require('fastify')({ logger: true });

// Add BigInt serialization
fastify.addHook('preSerialization', async (request, reply, payload) => {
  return JSON.parse(JSON.stringify(payload, (key, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ));
});

// Health endpoint
fastify.get('/health', async () => ({ status: 'ok', timestamp: new Date().toISOString() }));

// V1 routes
fastify.get('/v1/health', async () => ({ ok: true }));
fastify.get('/v1/circles', async () => ({ circles: [] }));
fastify.post('/v1/circles', async (req, reply) => {
  reply.code(201).send({ id: 'circle-' + Date.now() });
});
fastify.get('/v1/circles/:id/members', async (req) => ({ 
  circleId: req.params.id, members: [] 
}));
fastify.get('/v1/circles/:id/payments', async (req) => ({ 
  circleId: req.params.id, payments: [] 
}));
fastify.get('/v1/circles/:id/rounds', async (req) => ({ 
  circleId: req.params.id, rounds: [] 
}));

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
    console.log('✅ PardnaLink API with all routes running on port 3001');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
`;

fs.writeFileSync('/tmp/pardnalink-server.js', serverCode);
console.log('✅ Server file created at /tmp/pardnalink-server.js');
console.log('📋 Run: node /tmp/pardnalink-server.js');