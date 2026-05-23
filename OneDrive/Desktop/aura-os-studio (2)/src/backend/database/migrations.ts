/**
 * Database Migrations
 * Run once on app startup to ensure schema exists
 */

import { query, execute } from "./client";

export async function runMigrations(): Promise<void> {
  console.log("🔄 Running database migrations...");

  try {
    // Migration 1: Create webhooks table
    await execute(`
      CREATE TABLE IF NOT EXISTS webhooks (
        id UUID PRIMARY KEY,
        url TEXT NOT NULL,
        events TEXT[] NOT NULL,
        active BOOLEAN DEFAULT TRUE,
        secret TEXT NOT NULL,
        headers JSONB,
        max_attempts INTEGER DEFAULT 5,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_webhooks_active ON webhooks(active);
    `);
    console.log("✅ webhooks table ready");

    // Migration 2: Create webhook deliveries table
    await execute(`
      CREATE TABLE IF NOT EXISTS webhook_deliveries (
        id UUID PRIMARY KEY,
        webhook_id UUID NOT NULL REFERENCES webhooks(id) ON DELETE CASCADE,
        event_type TEXT NOT NULL,
        payload JSONB NOT NULL,
        status TEXT NOT NULL,
        attempt_count INTEGER DEFAULT 1,
        last_error TEXT,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_deliveries_webhook ON webhook_deliveries(webhook_id);
      CREATE INDEX IF NOT EXISTS idx_deliveries_status ON webhook_deliveries(status);
    `);
    console.log("✅ webhook_deliveries table ready");

    // Migration 3: Create projects table
    await execute(`
      CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        config JSONB,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_projects_user ON projects(user_id);
    `);
    console.log("✅ projects table ready");

    // Migration 4: Create files table
    await execute(`
      CREATE TABLE IF NOT EXISTS files (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        path TEXT NOT NULL,
        content TEXT,
        size INTEGER,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_files_project ON files(project_id);
    `);
    console.log("✅ files table ready");

    // Migration 5: Create memory chunks table (for IngestionHub)
    await execute(`
      CREATE TABLE IF NOT EXISTS memory_chunks (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        tags TEXT[],
        weight REAL DEFAULT 1.0,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_memory_user ON memory_chunks(user_id);
      CREATE INDEX IF NOT EXISTS idx_memory_category ON memory_chunks(category);
    `);
    console.log("✅ memory_chunks table ready");

    // Migration 6: Create secrets table (for secret management)
    await execute(`
      CREATE TABLE IF NOT EXISTS secrets (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        encrypted BOOLEAN DEFAULT TRUE,
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
    `);
    console.log("✅ secrets table ready");

    // Migration 7: Create users table
    await execute(`
      CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        roles TEXT[] DEFAULT ARRAY['user'],
        permissions TEXT[] DEFAULT ARRAY[],
        created_at BIGINT NOT NULL,
        updated_at BIGINT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `);
    console.log("✅ users table ready");

    console.log("✅ All migrations completed successfully");
  } catch (err) {
    console.error("❌ Migration failed:", err instanceof Error ? err.message : String(err));
    throw err;
  }
}

export async function checkMigrationsNeeded(): Promise<boolean> {
  try {
    const res = await query(`
      SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_name = 'webhooks'
      )
    `);
    return !res.rows[0].exists;
  } catch {
    return true;
  }
}
