# 🚀 Aura OS Studio - Production-Ready

**Status:** ✅ **PRODUCTION-READY** (May 23, 2026)

This is a fully production-ready AI Studio application with:
- ✅ PostgreSQL database persistence
- ✅ JWT authentication & security
- ✅ Rate limiting & security headers
- ✅ Webhook management system
- ✅ Memory/knowledge base API
- ✅ Docker-ready deployment

## 🎯 Key Features

| Feature | Status |
|---------|--------|
| Database Persistence | ✅ PostgreSQL |
| Authentication | ✅ JWT Tokens |
| Webhooks | ✅ Production-Grade |
| Memory Management | ✅ Full API |
| Security | ✅ HMAC, Rate Limiting, Headers |
| Scalability | ✅ Multi-instance Ready |

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 12+ (local or remote)

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Database
Create `.env.local`:
```bash
# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/aura_os_studio

# JWT Secrets (generate: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-random-32-byte-hex-string
WEBHOOK_SECRET=your-random-32-byte-hex-string

# App Config
NODE_ENV=development
PORT=3000
```

### 3. Run Locally
```bash
npm run dev
```

The app will:
1. ✅ Connect to PostgreSQL
2. ✅ Run migrations automatically
3. ✅ Create all tables (webhooks, memory, projects, etc.)
4. ✅ Start server on port 3000

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| [PRODUCTION_DATABASE_GUIDE.md](PRODUCTION_DATABASE_GUIDE.md) | Complete setup, deployment, and troubleshooting |
| [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md) | What changed, API reference, checklist |
| [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) | Pre-launch verification |
| [.env.example](.env.example) | Environment configuration template |

## 🧪 Testing the API

### Memory Chunks (IngestionHub)
```bash
# Create a memory chunk
curl -X POST http://localhost:3000/api/memory \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "content": "Your knowledge here",
    "category": "George",
    "tags": ["tag1", "tag2"],
    "weight": 1.5
  }'

# List memory chunks
curl http://localhost:3000/api/memory \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Webhooks
```bash
# Create a webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "url": "https://webhook.site/your-id",
    "events": ["project.created", "file.modified"],
    "maxAttempts": 5
  }'

# List webhooks
curl http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## 🐳 Docker Deployment

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.cjs"]
```

Build and run:
```bash
docker build -t aura-os-studio .
docker run -p 3000:3000 \
  -e DATABASE_URL=postgresql://... \
  -e JWT_SECRET=... \
  aura-os-studio
```

## 📊 Database Schema

Automatically created on startup:

```
webhooks              - Webhook registrations (id, url, events, secret)
webhook_deliveries   - Delivery attempts (webhook_id, status, payload)
memory_chunks        - Knowledge base (user_id, content, category, tags)
projects             - Project metadata
files                - File storage
secrets              - Encrypted secrets
users                - User records with RBAC
```

## 🔐 Security Features

- ✅ **JWT Authentication** - All endpoints require token
- ✅ **Rate Limiting** - 100 requests per 15 minutes
- ✅ **Security Headers** - X-Frame-Options, CSP, etc.
- ✅ **Input Validation** - Sanitization on all inputs
- ✅ **HMAC Signatures** - Webhook signature verification
- ✅ **User Isolation** - Database-level per-user access
- ✅ **Encryption** - Secrets stored encrypted
- ✅ **Fail Fast** - Dummy secrets rejected at startup

## ⚙️ Configuration

All configuration via `.env.local` (never commit!):

```bash
# Database (Required)
DATABASE_URL=postgresql://...

# Secrets (Generate 32-byte hex strings)
JWT_SECRET=...
WEBHOOK_SECRET=...

# Optional Features
GEMINI_API_KEY=sk-...
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000

# Logging
LOG_LEVEL=info
ENABLE_METRICS=true
```

See [.env.example](.env.example) for all options.

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] Database URL configured
- [ ] JWT_SECRET and WEBHOOK_SECRET generated
- [ ] PostgreSQL backups configured
- [ ] HTTPS/TLS certificates installed
- [ ] CORS_ORIGINS updated to your domain
- [ ] Rate limiting tested and tuned
- [ ] Monitoring/alerting set up
- [ ] Load testing completed
- [ ] All endpoints tested with real JWT tokens
- [ ] Data migration plan (if applicable)

See [PRODUCTION_CHECKLIST.md](PRODUCTION_CHECKLIST.md) for details.

## 🆘 Troubleshooting

### "connect ECONNREFUSED"
PostgreSQL not running or DATABASE_URL incorrect.

```bash
# Check if PostgreSQL is running
pg_isready

# Create database if missing
createdb aura_os_studio
```

### "relation 'webhooks' already exists"
Migrations already ran or database partially initialized.

```bash
# Reset (development only!)
dropdb aura_os_studio
createdb aura_os_studio
npm run dev  # Migrations will run again
```

For more help, see [PRODUCTION_DATABASE_GUIDE.md](PRODUCTION_DATABASE_GUIDE.md#-troubleshooting).

## 📈 Performance

- **Connection pooling** - 20 connections (configurable)
- **Query logging** - Slow queries (>1000ms) logged
- **Batch operations** - 50+ memory chunks in single request
- **User isolation** - No cross-tenant data access
- **Caching ready** - Add Redis for distributed caching

## 🔗 API Endpoints

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/memory` | JWT | List memory chunks |
| POST | `/api/memory` | JWT | Create chunk |
| POST | `/api/memory/bulk` | JWT | Bulk create |
| PUT | `/api/memory/:id` | JWT | Update chunk |
| DELETE | `/api/memory/:id` | JWT | Delete chunk |
| GET | `/api/webhooks` | JWT | List webhooks |
| POST | `/api/webhooks` | JWT | Create webhook |
| DELETE | `/api/webhooks/:id` | JWT | Deactivate webhook |

Full API reference: [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md#-api-reference)

## 📝 What Changed (May 23, 2026)

✅ **Removed:**
- Firebase (complete)
- In-memory storage
- All unused dependencies

✅ **Added:**
- PostgreSQL integration
- Database migrations
- Memory/knowledge base API
- Webhook persistence
- User isolation

See [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md) for full details.

## 📚 Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Node.js PostgreSQL Driver](https://node-postgres.com/)
- [JWT.io](https://jwt.io/)
- [Express.js Guide](https://expressjs.com/)

## 🎯 Next Steps

1. **Run Locally:** `npm run dev`
2. **Test Endpoints:** Use curl examples above
3. **Configure Database:** Production DATABASE_URL
4. **Set Up Backups:** Daily or more frequent
5. **Deploy:** Docker/Kubernetes/Cloud Run
6. **Monitor:** Logs, metrics, alerts

## 📄 License

MIT

---

**🎉 Ready for production! Deploy with confidence.** 🚀
