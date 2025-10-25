const http = require('http');

const server = http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  if (req.url === '/v1/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'ok', message: 'Local test server running' }));
  } else if (req.url.startsWith('/v1/')) {
    res.writeHead(200);
    res.end(JSON.stringify({ message: 'Test endpoint', url: req.url, method: req.method }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(3001, () => {
  console.log('🧪 Local test server running on http://localhost:3001');
  console.log('✅ Ready for testing - run ./run-all-tests.sh');
});