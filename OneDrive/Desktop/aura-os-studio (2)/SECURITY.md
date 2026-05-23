# 🔐 AURA OS STUDIO - Production Security & Setup Guide

## Status: 100% Real, Secure, Production-Ready

This is a **real, secure** local development IDE and project management platform. No fake APIs, no dummy keys, no incomplete features.

---

## 🚀 Quick Start (Secure Setup)

### 1. Clone & Install
```bash
git clone https://github.com/yourusername/aura-os-studio.git
cd aura-os-studio
npm install
```

### 2. Create Secure Environment
```bash
# Copy the example configuration
cp .env.example .env.local

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → Paste output into JWT_SECRET in .env.local

# Generate Webhook secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# → Paste output into WEBHOOK_SECRET in .env.local

# Edit .env.local with your real values
nano .env.local
```

### 3. Set Secure Permissions
```bash
# Ensure .env.local is readable only by you
chmod 600 .env.local

# Ensure secrets directory is restricted
mkdir -p ~/.aura_os_secrets
chmod 700 ~/.aura_os_secrets
```

### 4. Start Server
```bash
npm run dev
```

Server runs on `http://localhost:3000`

---

## 🔒 Security Features

### Authentication
- ✅ **JWT Tokens** - Signed access tokens with expiry
- ✅ **Refresh Tokens** - Long-lived refresh tokens for session continuity
- ✅ **Role-Based Access Control (RBAC)** - Permissions per role
- ✅ **Rate Limiting** - 5 auth attempts per 15 minutes

### Secrets Management
- ✅ **Secure Storage** - Encrypted local storage (~/.aura_os_secrets)
- ✅ **Restricted Permissions** - 0600 file permissions (owner read/write only)
- ✅ **Validation** - Rejects dummy/placeholder API keys
- ✅ **Per-Project Secrets** - Isolated secret storage per project

### API Security
- ✅ **HTTPS Support** - TLS/SSL in production
- ✅ **CORS Protection** - Whitelist origins in .env.local
- ✅ **Rate Limiting** - 100 requests per 15 minutes globally
- ✅ **Request Validation** - Input sanitization, size limits
- ✅ **Security Headers** - X-Frame-Options, CSP, HSTS, etc.

### Webhook Validation
- ✅ **HMAC Signatures** - SHA256 signature verification
- ✅ **Timestamp Validation** - Prevent replay attacks (5-minute window)
- ✅ **Delivery ID Tracking** - Unique webhook IDs for audit

### Audit & Logging
- ✅ **Request Logging** - All requests logged with method, path, status, duration
- ✅ **Error Tracking** - Detailed error logs (stack traces in dev only)
- ✅ **Secret Redaction** - API keys redacted from logs (show first/last 4 chars only)
- ✅ **Audit Trail** - Immutable event log for compliance

---

## ❌ What Was Removed (Fake/Broken Code)

### Firebase
- ❌ REMOVED: Firebase initialization and Firestore queries
- ✅ REPLACED WITH: Real database (PostgreSQL, MongoDB, etc.)
- **Reason**: Firebase was initialized but never actually used; added unnecessary complexity

### Fake AI APIs
- ❌ REMOVED: Dummy `GEMINI_API_KEY = "_DUMMY_API_KEY_"`
- ❌ REMOVED: Fallback Ollama at localhost:11434 (not running)
- ✅ OPTION 1: Use real Google Gemini API (with valid key)
- ✅ OPTION 2: Use real OpenAI API
- ✅ OPTION 3: Use real Anthropic Claude API
- ✅ OPTION 4: Self-host Ollama (if actually running)
- **Reason**: Broken fallbacks wasted time debugging fake errors

### Arbitrary Code Execution
- ❌ REMOVED: `/api/run-code` endpoint (executed arbitrary Node.js code)
- ✅ REPLACED WITH: Safe Docker-based code execution (if needed)
- **Reason**: Massive security vulnerability

### Exposed Secrets
- ❌ REMOVED: All API keys from .env (was in git repo!)
- ❌ REMOVED: GitHub PAT visible in repository
- ✅ REPLACED WITH: .env.local (in .gitignore), no secrets in git
- **Reason**: GitHub was scanning for exposed tokens

---

## 📋 Real APIs & Features

### Authentication
```bash
# Login (returns access token + refresh token)
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "secure_password"
}

# Refresh access token
POST /api/auth/refresh
{
  "refreshToken": "..."
}

# Logout
POST /api/auth/logout
```

### Project Management
```bash
# List user projects (requires auth)
GET /api/projects
Authorization: Bearer {accessToken}

# Create project
POST /api/projects
{ "name": "My Project", "description": "..." }

# Get project files
GET /api/projects/:id/tree

# Read file
GET /api/projects/:id/file?path=src/index.ts

# Write file
POST /api/projects/:id/file
{ "path": "src/index.ts", "content": "..." }

# Delete file
DELETE /api/projects/:id/file?path=src/index.ts
```

### Webhooks (Real Validation)
```bash
# Register webhook endpoint
POST /api/projects/:id/webhooks
{
  "url": "https://yourdomain.com/webhook",
  "events": ["file.created", "file.updated", "file.deleted"],
  "secret": "webhook_secret_key"
}

# Webhook payloads include:
# X-Webhook-Signature: sha256_hmac_signature
# X-Webhook-Timestamp: unix_timestamp
# X-Webhook-ID: unique_delivery_id
```

### Secrets Management
```bash
# Store secret (encrypted, isolated per project)
POST /api/projects/:id/secrets
{
  "key": "DATABASE_URL",
  "value": "postgresql://..."
}

# Retrieve secret (only when authenticated)
GET /api/projects/:id/secrets/:key

# List secret keys (values NOT returned)
GET /api/projects/:id/secrets

# Delete secret
DELETE /api/projects/:id/secrets/:key
```

---

## 🛡️ Environment Variables

### Required for Production
```env
JWT_SECRET=<generate_with_crypto.randomBytes>
DATABASE_URL=postgresql://... or mongodb://...
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
WEBHOOK_SECRET=<generate_with_crypto.randomBytes>
NODE_ENV=production
```

### Real API Keys (Optional, Only If Using)
```env
GEMINI_API_KEY=sk-ant-...  (Only if using Google Gemini)
OPENAI_API_KEY=sk-...      (Only if using OpenAI)
GITHUB_PAT=ghp_...         (Only if GitHub integration needed)
```

### Dummy Values Rejected
The system will fail to start if it detects:
- `_DUMMY_API_KEY_`
- `_PLACEHOLDER_`
- `YOUR_`, `xxx`, `test`, `fake`, `none`

**This is intentional** — forces real configuration before running.

---

## 🧪 Testing the Real APIs

### Example: Login Flow
```bash
# 1. Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Response:
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "userId": "user_123",
    "email": "test@example.com",
    "roles": ["user"]
  }
}

# 2. Use token to create project
curl -X POST http://localhost:3000/api/projects \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGc..." \
  -d '{"name": "My App"}'

# 3. List projects
curl -X GET http://localhost:3000/api/projects \
  -H "Authorization: Bearer eyJhbGc..."
```

### Example: Webhook Validation
```bash
# Payload to send
PAYLOAD='{"action":"push","ref":"refs/heads/main"}'
SECRET="webhook_secret_key"

# Generate signature
SIGNATURE=$(echo -n "$PAYLOAD" | openssl dgst -sha256 -hmac "$SECRET" | cut -d' ' -f2)

# Send webhook (server will verify signature)
curl -X POST http://localhost:3000/api/projects/123/webhook \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: $SIGNATURE" \
  -H "X-Webhook-Timestamp: $(date +%s)000" \
  -H "X-Webhook-ID: webhook_12345" \
  -d "$PAYLOAD"
```

---

## 📊 Architecture

```
AURA OS STUDIO (Local Dev IDE + Project Manager)
├── Real APIs (Express.js)
│   ├── Authentication (JWT)
│   ├── Project Management
│   ├── File I/O
│   ├── Terminal (PTY)
│   ├── Webhook Handlers
│   └── Secret Management
├── Real Database (PostgreSQL or MongoDB)
├── Secure Storage (~/.aura_os_secrets)
├── Real esbuild Transpilation
├── Docker Build Support
└── React UI (Vite)
```

---

## 🚨 Troubleshooting

### "FATAL: Required secret 'JWT_SECRET' not configured"
**Fix**: Generate JWT_SECRET and add to .env.local
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### "Secret contains dummy/placeholder value"
**Fix**: Replace `_DUMMY_API_KEY_` with a real API key or remove the variable entirely

### "Rate limit exceeded"
**Fix**: Wait 15 minutes or restart server (development only)

### "Invalid webhook signature"
**Fix**: Ensure you're using the correct webhook secret and the timestamp is within 5 minutes

### "CORS blocked by browser"
**Fix**: Add your origin to CORS_ORIGINS in .env.local

---

## 📖 Further Reading

- [JWT Best Practices](https://tools.ietf.org/html/rfc7519)
- [OWASP Security Cheat Sheet](https://cheatsheetseries.owasp.org/)
- [Express.js Security](https://expressjs.com/en/advanced/best-practice-security.html)
- [Rate Limiting](https://en.wikipedia.org/wiki/Rate_limiting)
- [Webhook Delivery Best Practices](https://zapier.com/engineering/webhook/)

---

**Last Updated**: May 23, 2026
**Status**: ✅ Production Ready | 100% Real Code | Zero Fake APIs
