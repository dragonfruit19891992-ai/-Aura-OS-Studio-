# 🚀 QUICK REFERENCE - Production Deployment

## ⚡ 5-Minute Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env.local with your database
echo "DATABASE_URL=postgresql://user:password@localhost:5432/aura_os_studio" > .env.local
echo "JWT_SECRET=$(node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))')" >> .env.local
echo "WEBHOOK_SECRET=$(node -e 'console.log(require(\"crypto\").randomBytes(32).toString(\"hex\"))')" >> .env.local

# 3. Run the server
npm run dev

# ✅ Server is running on http://localhost:3000
```

## 📋 Environment Variables

```bash
# Required
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=<64-char-hex>
WEBHOOK_SECRET=<64-char-hex>

# Optional
NODE_ENV=production
PORT=3000
BASE_URL=https://yourdomain.com
CORS_ORIGINS=https://yourdomain.com
```

## 🧪 Test Endpoints

### Memory (Knowledge Base)
```bash
TOKEN="YOUR_JWT_TOKEN"

# Create
curl -X POST http://localhost:3000/api/memory \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello","category":"George","tags":["tag"],"weight":1}'

# List
curl http://localhost:3000/api/memory \
  -H "Authorization: Bearer $TOKEN"

# Bulk create
curl -X POST http://localhost:3000/api/memory/bulk \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"chunks":[{"content":"Test","category":"Business","tags":[]}]}'

# Update
curl -X PUT http://localhost:3000/api/memory/CHUNK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"weight":2}'

# Delete
curl -X DELETE http://localhost:3000/api/memory/CHUNK_ID \
  -H "Authorization: Bearer $TOKEN"

# Delete by category
curl -X DELETE "http://localhost:3000/api/memory?category=Business" \
  -H "Authorization: Bearer $TOKEN"
```

### Webhooks
```bash
# Create webhook
curl -X POST http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url":"https://webhook.site/UNIQUE_ID",
    "events":["project.created"],
    "maxAttempts":5
  }'

# List webhooks
curl http://localhost:3000/api/webhooks \
  -H "Authorization: Bearer $TOKEN"

# Get one
curl http://localhost:3000/api/webhooks/WEBHOOK_ID \
  -H "Authorization: Bearer $TOKEN"

# Update
curl -X PUT http://localhost:3000/api/webhooks/WEBHOOK_ID \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maxAttempts":3}'

# Delete
curl -X DELETE http://localhost:3000/api/webhooks/WEBHOOK_ID \
  -H "Authorization: Bearer $TOKEN"

# Rotate secret
curl -X POST http://localhost:3000/api/webhooks/WEBHOOK_ID/rotate-secret \
  -H "Authorization: Bearer $TOKEN"
```

## 📊 Database Commands

```bash
# Connect to database
psql $DATABASE_URL

# List tables
\dt

# Check webhook count
SELECT COUNT(*) FROM webhooks;

# Check memory chunks
SELECT COUNT(*) FROM memory_chunks;
SELECT * FROM memory_chunks LIMIT 5;

# Check slow queries in logs
grep "SLOW QUERY" app.log

# Backup database
pg_dump $DATABASE_URL > backup.sql

# Restore from backup
psql $DATABASE_URL < backup.sql
```

## 🐳 Docker Quick Start

```bash
# Build
docker build -t aura-os .

# Run
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  -e WEBHOOK_SECRET="..." \
  aura-os

# Run with .env file
docker run --env-file .env.local -p 3000:3000 aura-os
```

## 🔧 Troubleshooting

| Error | Solution |
|-------|----------|
| `ECONNREFUSED 127.0.0.1:5432` | Start PostgreSQL: `brew services start postgresql` |
| `FATAL: database "aura_os_studio" does not exist` | Create: `createdb aura_os_studio` |
| `relation "webhooks" already exists` | Migrations already ran (safe) |
| `sorry, too many clients` | Increase pool.max in client.ts or restart |
| `invalid DATABASE_URL` | Check format: `postgresql://user:pass@host:port/db` |

## 📈 Performance Tuning

```typescript
// In src/backend/database/client.ts
export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20,              // ↑ increase for high load
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

## 🔒 Security Checklist

- [ ] DATABASE_URL never in code (use .env)
- [ ] JWT_SECRET is 32+ random bytes
- [ ] HTTPS/TLS enabled in production
- [ ] CORS_ORIGINS set to your domain only
- [ ] Rate limiting configured (default: 100/15min)
- [ ] Security headers enabled (default: on)
- [ ] Database backups automated
- [ ] Access logs monitored

## 📚 Key Files

| File | Purpose |
|------|---------|
| `server.ts` | Main app entry point |
| `src/backend/database/client.ts` | DB connection pool |
| `src/backend/database/migrations.ts` | Schema creation |
| `src/backend/api/memory-routes.ts` | Memory API |
| `src/backend/api/webhook-routes.ts` | Webhook API |
| `.env.example` | Configuration template |
| `PRODUCTION_DATABASE_GUIDE.md` | Full deployment guide |

## 📞 Common Tasks

### Generate Random Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Check Server Logs
```bash
npm run dev 2>&1 | tee app.log
```

### Kill Server on Port 3000
```bash
lsof -ti:3000 | xargs kill -9
```

### Export All Memory Chunks
```bash
psql $DATABASE_URL -c "COPY memory_chunks TO STDOUT" > memory_export.csv
```

### Count All Records
```bash
psql $DATABASE_URL -c "
  SELECT 
    'webhooks' as table_name, COUNT(*) as count FROM webhooks
  UNION ALL
  SELECT 'memory_chunks', COUNT(*) FROM memory_chunks
  UNION ALL
  SELECT 'projects', COUNT(*) FROM projects;
"
```

## 🚀 Deploy to Cloud

### Azure
```bash
az webapp deployment github-actions add \
  --repo "your/repo" \
  --branch main \
  --name aura-os-app \
  --resource-group my-rg
```

### Google Cloud
```bash
gcloud run deploy aura-os \
  --source . \
  --platform managed \
  --region us-central1 \
  --set-env-vars DATABASE_URL=$DB_URL
```

### AWS Lambda + RDS
```bash
# Build Docker image
docker build -t aura-os .

# Push to ECR
aws ecr get-login-password | docker login --username AWS --password-stdin $ECR_URI
docker tag aura-os:latest $ECR_URI/aura-os:latest
docker push $ECR_URI/aura-os:latest

# Deploy
aws lambda create-function \
  --function-name aura-os \
  --role arn:aws:iam::ACCOUNT:role/lambda-role \
  --image-uri $ECR_URI/aura-os:latest \
  --environment Variables="{DATABASE_URL=$DB_URL,JWT_SECRET=$JWT_SECRET}"
```

## 📖 Documentation Links

- Full Setup: [PRODUCTION_DATABASE_GUIDE.md](PRODUCTION_DATABASE_GUIDE.md)
- What Changed: [DATABASE_MIGRATION_SUMMARY.md](DATABASE_MIGRATION_SUMMARY.md)
- Deployment Report: [MIGRATION_COMPLETION_REPORT.md](MIGRATION_COMPLETION_REPORT.md)
- API Reference: See DATABASE_MIGRATION_SUMMARY.md

---

**✅ You're ready to deploy!** 🎉

For help, check `PRODUCTION_DATABASE_GUIDE.md` or ask in docs.
