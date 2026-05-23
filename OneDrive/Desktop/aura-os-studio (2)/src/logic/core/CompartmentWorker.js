import http from 'http';
import { parentPort, workerData } from 'worker_threads';

const { compartmentId, port, zipsDir } = workerData;

// Proxy server to fetch real UI/UX from main server's ESBuild engine
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ memory: process.memoryUsage().heapUsed / 1024 / 1024 }));
    return;
  }

  // Route back to main server's raw ESBuild endpoint
  const targetUrl = `http://127.0.0.1:3000/api/zips/${compartmentId}/raw${req.url === '/' ? '/index.html' : req.url}`;
  
  http.get(targetUrl, (proxyRes) => {
    const contentType = proxyRes.headers['content-type'] || '';
    
    if (contentType.includes('text/html')) {
      let body = '';
      proxyRes.on('data', chunk => body += chunk);
      proxyRes.on('end', () => {
        if (!body.includes('<base ')) {
          // Inject base tag to fix all absolute and relative asset paths inside the isolated sandbox
          body = body.replace('<head>', `<head>\\n  <base href="/api/gateway/${compartmentId}/" />`);
        }
        
        const newHeaders = { ...proxyRes.headers };
        delete newHeaders['content-length'];
        
        res.writeHead(proxyRes.statusCode || 200, newHeaders);
        res.end(body);
      });
    } else {
      res.writeHead(proxyRes.statusCode || 200, proxyRes.headers);
      proxyRes.pipe(res, { end: true });
    }
  }).on('error', (err) => {
    res.writeHead(502, { 'Content-Type': 'text/plain' });
    res.end('Compartment Gateway Error: ' + err.message);
  });
});

server.listen(port, () => {
  parentPort.postMessage({ type: 'STARTED', port });
});

// Simulate heartbeat & telemetry
setInterval(() => {
  parentPort.postMessage({ type: 'TELEMETRY', memory: process.memoryUsage().heapUsed / 1024 / 1024 });
}, 5000);

process.on('uncaughtException', (err) => {
  parentPort.postMessage({ type: 'CRASH', error: err.message });
  process.exit(1);
});
