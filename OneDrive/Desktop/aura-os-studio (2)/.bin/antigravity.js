const http = require('http');

const prompt = process.argv.slice(2).join(' ');
if (!prompt) {
  console.log("Usage: antigravity <prompt>");
  console.log("Example: antigravity 'Read Hacker News, summarize the top 10 stories...'");
  process.exit(1);
}

console.log(`\n\x1b[36m[Antigravity Deep Research Agent]\x1b[0m Booting up preview-05-2026...`);
console.log(`\x1b[90m> Query: "${prompt}"\x1b[0m\n`);

const data = JSON.stringify({ prompt });

const options = {
  hostname: '127.0.0.1',
  port: 3000,
  path: '/api/agent/research',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = http.request(options, (res) => {
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => {
    try {
      const parsed = JSON.parse(body);
      if (parsed.error) {
        console.error(`\x1b[31m[Error]\x1b[0m ${parsed.error}`);
      } else {
        console.log(`\x1b[32m[Result]\x1b[0m\n${parsed.result}`);
      }
    } catch (e) {
      console.log(`\x1b[32m[Result]\x1b[0m\n${body}`);
    }
  });
});

req.on('error', (e) => {
  console.error(`\x1b[31m[Agent Communication Error]\x1b[0m Could not connect to Aura OS backend. ${e.message}`);
});

req.write(data);
req.end();
