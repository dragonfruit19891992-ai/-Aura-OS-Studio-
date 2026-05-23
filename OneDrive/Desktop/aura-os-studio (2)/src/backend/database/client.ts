/**
 * PostgreSQL Database Client
 * Connection pooling and query helpers for production database
 */

import { Pool, Client, QueryResult } from "pg";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL && process.env.NODE_ENV === "production") {
  throw new Error("DATABASE_URL environment variable is required for production");
}

// Create connection pool
export const pool = new Pool({
  connectionString: DATABASE_URL,
  max: 20, // Maximum number of connections in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Error handling for the pool
pool.on("error", (err: Error) => {
  console.error("Unexpected error on idle client", err);
  process.exit(-1);
});

/**
 * Query wrapper with error handling
 */
export async function query<T = any>(
  text: string,
  params?: any[]
): Promise<QueryResult<T>> {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (duration > 1000) {
      console.warn(`[SLOW QUERY] ${duration}ms: ${text.substring(0, 80)}`);
    }
    return res;
  } catch (err) {
    console.error("Database query error:", {
      query: text.substring(0, 100),
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
}

/**
 * Get a single row
 */
export async function getOne<T = any>(
  text: string,
  params?: any[]
): Promise<T | null> {
  const res = await query<T>(text, params);
  return res.rows[0] || null;
}

/**
 * Get multiple rows
 */
export async function getMany<T = any>(
  text: string,
  params?: any[]
): Promise<T[]> {
  const res = await query<T>(text, params);
  return res.rows;
}

/**
 * Execute a command (INSERT, UPDATE, DELETE)
 */
export async function execute(
  text: string,
  params?: any[]
): Promise<number> {
  const res = await query(text, params);
  return res.rowCount || 0;
}

/**
 * Transaction helper
 */
export async function transaction<T>(
  callback: (client: Client) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Close the pool (call on app shutdown)
 */
export async function closePool(): Promise<void> {
  await pool.end();
}

export default {
  query,
  getOne,
  getMany,
  execute,
  transaction,
  pool,
  closePool,
};
