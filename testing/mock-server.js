const http = require('http');

const mockResponses = {
  '/v1/health': { status: 'ok', message: 'PardnaLink API running' },
  '/v1/users/register': { success: true, message: 'User registered', userId: 'user123' },
  '/v1/auth/login': { success: true, token: 'mock-jwt-token-123', user: { id: 'user123', email: 'test@test.com' } },
  '/v1/users/profile': { id: 'user123', email: 'test@test.com', firstName: 'Test', lastName: 'User', kycStatus: 'verified' },
  '/v1/circles': { success: true, circleId: 'circle123', message: 'Circle created' },
  '/v1/kyc/status': { status: 'verified', completedAt: '2024-01-01T00:00:00Z' },
  '/v1/payments/methods': { methods: ['card', 'bank'], default: 'card' }
};

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const response = mockResponses[req.url] || { error: 'Endpoint not mocked', url: req.url };
  res.writeHead(200);
  res.end(JSON.stringify(response));
});

server.listen(3001, () => {
  console.log('🧪 Mock PardnaLink server running on port 3001');
  console.log('✅ Run your tests now');
});