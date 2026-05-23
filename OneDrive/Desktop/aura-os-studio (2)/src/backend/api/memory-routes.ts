/**
 * Memory API Endpoints
 * REST API for memory chunk management
 */

import express, { Router, Request, Response } from "express";
import { requireAuth } from "../security/middleware";
import { v4 as uuidv4 } from "uuid";
import { getMany, execute, getOne } from "../database/client";

const router = Router();

interface MemoryChunk {
  id: string;
  content: string;
  category: string;
  tags: string[];
  weight: number;
  ts: number;
  chars: number;
}

/**
 * GET /api/memory
 * List memory chunks
 */
router.get("/api/memory", requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const limit = parseInt(req.query.limit as string) || 1000;
    const userId = req.user?.userId;

    let sql = `
      SELECT id, content, category, tags, weight, created_at as ts, 
             (length(content)) as chars
      FROM memory_chunks
      WHERE user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (category) {
      sql += ` AND category = $${paramIndex}`;
      params.push(category);
      paramIndex++;
    }

    sql += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(limit);

    const rows = await getMany<any>(sql, params);
    const chunks: MemoryChunk[] = rows.map((row) => ({
      id: row.id,
      content: row.content,
      category: row.category,
      tags: row.tags || [],
      weight: row.weight || 1.0,
      ts: row.ts,
      chars: row.chars,
    }));

    res.json({ chunks, count: chunks.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/memory
 * Create a memory chunk
 */
router.post("/api/memory", requireAuth, async (req: Request, res: Response) => {
  try {
    const { content, category, tags, weight } = req.body;
    const userId = req.user?.userId;

    if (!content || !category) {
      return res.status(400).json({ error: "content and category are required" });
    }

    const id = uuidv4();
    const now = Date.now();

    await execute(
      `INSERT INTO memory_chunks (id, user_id, content, category, tags, weight, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, userId, content, category, tags || [], weight || 1.0, now, now]
    );

    const chunk: MemoryChunk = {
      id,
      content,
      category,
      tags: tags || [],
      weight: weight || 1.0,
      ts: now,
      chars: content.length,
    };

    res.status(201).json({ chunk });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/memory/bulk
 * Create multiple memory chunks
 */
router.post("/api/memory/bulk", requireAuth, async (req: Request, res: Response) => {
  try {
    const { chunks } = req.body;
    const userId = req.user?.userId;

    if (!Array.isArray(chunks) || chunks.length === 0) {
      return res.status(400).json({ error: "chunks array is required" });
    }

    const created: MemoryChunk[] = [];
    const now = Date.now();

    for (const chunk of chunks) {
      const { content, category, tags, weight } = chunk;

      if (!content || !category) {
        console.warn("Skipping invalid chunk:", chunk);
        continue;
      }

      const id = uuidv4();

      try {
        await execute(
          `INSERT INTO memory_chunks (id, user_id, content, category, tags, weight, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [id, userId, content, category, tags || [], weight || 1.0, now, now]
        );

        created.push({
          id,
          content,
          category,
          tags: tags || [],
          weight: weight || 1.0,
          ts: now,
          chars: content.length,
        });
      } catch (err) {
        console.error("Failed to create chunk:", err);
      }
    }

    res.status(201).json({ chunks: created, count: created.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/memory/:id
 * Update a memory chunk
 */
router.put("/api/memory/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { content, category, tags, weight } = req.body;
    const userId = req.user?.userId;
    const now = Date.now();

    // Verify ownership
    const existing = await getOne<any>(
      `SELECT id FROM memory_chunks WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (!existing) {
      return res.status(404).json({ error: "Memory chunk not found" });
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (content !== undefined) {
      updates.push(`content = $${paramIndex++}`);
      values.push(content);
    }
    if (category !== undefined) {
      updates.push(`category = $${paramIndex++}`);
      values.push(category);
    }
    if (tags !== undefined) {
      updates.push(`tags = $${paramIndex++}`);
      values.push(tags);
    }
    if (weight !== undefined) {
      updates.push(`weight = $${paramIndex++}`);
      values.push(weight);
    }

    updates.push(`updated_at = $${paramIndex++}`);
    values.push(now);

    values.push(id);
    values.push(userId);

    await execute(
      `UPDATE memory_chunks SET ${updates.join(", ")} WHERE id = $${paramIndex} AND user_id = $${paramIndex + 1}`,
      values
    );

    const updated = await getOne<any>(
      `SELECT id, content, category, tags, weight, created_at as ts,
              (length(content)) as chars
       FROM memory_chunks WHERE id = $1`,
      [id]
    );

    if (updated) {
      res.json({
        chunk: {
          id: updated.id,
          content: updated.content,
          category: updated.category,
          tags: updated.tags || [],
          weight: updated.weight || 1.0,
          ts: updated.ts,
          chars: updated.chars,
        },
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/memory/:id
 * Delete a memory chunk
 */
router.delete("/api/memory/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    const result = await execute(
      `DELETE FROM memory_chunks WHERE id = $1 AND user_id = $2`,
      [id, userId]
    );

    if (result === 0) {
      return res.status(404).json({ error: "Memory chunk not found" });
    }

    res.json({ message: "Memory chunk deleted" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/memory
 * Delete all memory chunks in a category
 */
router.delete("/api/memory", requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const userId = req.user?.userId;

    if (!category) {
      return res.status(400).json({ error: "category query parameter is required" });
    }

    const result = await execute(
      `DELETE FROM memory_chunks WHERE user_id = $1 AND category = $2`,
      [userId, category]
    );

    res.json({ message: `Deleted ${result} memory chunks`, count: result });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
