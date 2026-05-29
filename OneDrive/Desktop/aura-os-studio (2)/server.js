const express = require('express');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
// Serve all static files from the root directory
app.use(express.static(__dirname));

// Secure local-only filter
function requireLocalhost(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress;
  if (ip === '::1' || ip === '127.0.0.1' || ip.includes('127.0.0.1') || ip === '::ffff:127.0.0.1') {
    next();
  } else {
    res.status(403).send("Forbidden: Sovereign System API is restricted to localhost sandbox.");
  }
}

// 1. Directory Mapping Endpoint
app.get('/api/studio/files', requireLocalhost, (req, res) => {
  try {
    const rootDir = __dirname;
    const files = getFilesRecursive(rootDir, rootDir);
    res.json(files);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

function getFilesRecursive(dir, root) {
  const results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    if (file === 'node_modules' || file === '.git' || file === '.firebase' || file === '.firebaserc') return;
    
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const relPath = path.relative(root, filePath).replace(/\\/g, '/');
    
    if (stat.isDirectory()) {
      results.push({
        name: file,
        path: relPath,
        isDir: true,
        children: getFilesRecursive(filePath, root)
      });
    } else {
      results.push({
        name: file,
        path: relPath,
        isDir: false,
        size: stat.size
      });
    }
  });
  return results;
}

// 2. Read File Content Endpoint
app.get('/api/studio/file', requireLocalhost, (req, res) => {
  const filePath = req.query.path;
  if (!filePath) return res.status(400).send("Missing path parameter");
  
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fullPath.startsWith(__dirname)) {
      return res.status(403).send("Access Denied: Path escapes directory boundaries.");
    }
    
    const content = fs.readFileSync(fullPath, 'utf8');
    res.send(content);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 3. Save File Content Endpoint
app.post('/api/studio/save', requireLocalhost, (req, res) => {
  const { path: filePath, content } = req.body;
  if (!filePath || content === undefined) return res.status(400).send("Missing parameters");
  
  try {
    const fullPath = path.join(__dirname, filePath);
    if (!fullPath.startsWith(__dirname)) {
      return res.status(403).send("Access Denied: Path escapes directory boundaries.");
    }
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`[STUDIO] Saved file: ${filePath}`);
    res.send("Success");
  } catch (err) {
    res.status(500).send(err.message);
  }
});

// 4. Command Execution Endpoint
app.post('/api/studio/terminal', requireLocalhost, (req, res) => {
  const { command } = req.body;
  if (!command) return res.status(400).send("Missing command");
  
  console.log(`[STUDIO] Running local command: ${command}`);
  
  const forbiddenKeywords = ['rm -rf', 'del /s', 'format', 'mkfs', 'shutdown'];
  if (forbiddenKeywords.some(kw => command.toLowerCase().includes(kw))) {
    return res.status(400).send("Access Denied: Destructive operations locked.");
  }

  exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
    res.json({
      stdout: stdout || "",
      stderr: stderr || "",
      code: error ? error.code : 0
    });
  });
});

// Sovereign Portals routing for local developer experience
app.get('/mycodes', (req, res) => { res.sendFile(path.join(__dirname, 'portal/mycodes/dashboard/index.html')); });
app.get('/mycodes/*', (req, res) => { res.sendFile(path.join(__dirname, 'portal/mycodes/dashboard/index.html')); });
app.get('/pebble', (req, res) => { res.sendFile(path.join(__dirname, 'portal/pebble/dashboard/index.html')); });
app.get('/rent', (req, res) => { res.sendFile(path.join(__dirname, 'portal/rent/index.html')); });
app.get('/chat', (req, res) => { res.sendFile(path.join(__dirname, 'portal/chat/index.html')); });
app.get('/me', (req, res) => { res.sendFile(path.join(__dirname, 'portal/me/index.html')); });
app.get('/console', (req, res) => { res.sendFile(path.join(__dirname, 'portal/console/index.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'login/index.html')); });

// Catch-all route to direct unmatched browser queries back to index.html (supports client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Aura OS Sovereign Portal running dynamically on port ${PORT}`);
});
