/**
 * Webhook Repository & Delivery Service
 * Handles incoming webhook registration, event routing, delivery
 * NOW USING POSTGRESQL FOR PRODUCTION
 */

import { v4 as uuidv4 } from "uuid";
import {
  WebhookEvent,
  WebhookRegistration,
  WebhookDelivery,
  EventType,
} from "../types/webhook";
import { generateWebhookSignature } from "./middleware";
import { query, execute, getOne, getMany } from "../database/client";

export class WebhookService {
  /**
   * Register a new webhook endpoint
   */
  static async registerWebhook(
    url: string,
    events: EventType[],
    options?: {
      headers?: Record<string, string>;
      maxAttempts?: number;
    }
  ): Promise<WebhookRegistration> {
    const id = uuidv4();
    const secret = uuidv4().replace(/-/g, "");
    const now = Date.now();

    const webhook: WebhookRegistration = {
      id,
      url,
      events,
      active: true,
      secret,
      headers: options?.headers || {},
      createdAt: now,
      updatedAt: now,
      retryPolicy: {
        maxAttempts: options?.maxAttempts || 5,
        initialDelayMs: 5000,
        backoffMultiplier: 2,
      },
    };

    await execute(
      `INSERT INTO webhooks (id, url, events, active, secret, headers, max_attempts, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [id, url, events, true, secret, JSON.stringify(options?.headers || {}), options?.maxAttempts || 5, now, now]
    );

    return webhook;
  }

  /**
   * Get webhook by ID
   */
  static async getWebhook(id: string): Promise<WebhookRegistration | null> {
    const row = await getOne<any>(
      `SELECT * FROM webhooks WHERE id = $1`,
      [id]
    );

    if (!row) return null;

    return {
      id: row.id,
      url: row.url,
      events: row.events,
      active: row.active,
      secret: row.secret,
      headers: row.headers || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      retryPolicy: {
        maxAttempts: row.max_attempts || 5,
        initialDelayMs: 5000,
        backoffMultiplier: 2,
      },
    };
  }

  /**
   * List all webhooks
   */
  static async listWebhooks(): Promise<WebhookRegistration[]> {
    const rows = await getMany<any>(
      `SELECT * FROM webhooks WHERE active = true ORDER BY created_at DESC`
    );

    return rows.map((row) => ({
      id: row.id,
      url: row.url,
      events: row.events,
      active: row.active,
      secret: row.secret,
      headers: row.headers || {},
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      retryPolicy: {
        maxAttempts: row.max_attempts || 5,
        initialDelayMs: 5000,
        backoffMultiplier: 2,
      },
    }));
  }

  /**
   * Update webhook
   */
  static async updateWebhook(
    id: string,
    updates: Partial<WebhookRegistration>
  ): Promise<WebhookRegistration | null> {
    const now = Date.now();
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.url) {
      updateFields.push(`url = $${paramIndex++}`);
      values.push(updates.url);
    }
    if (updates.events) {
      updateFields.push(`events = $${paramIndex++}`);
      values.push(updates.events);
    }
    if (updates.headers) {
      updateFields.push(`headers = $${paramIndex++}`);
      values.push(JSON.stringify(updates.headers));
    }

    updateFields.push(`updated_at = $${paramIndex++}`);
    values.push(now);
    values.push(id);

    if (updateFields.length === 1) return this.getWebhook(id); // No updates

    await execute(
      `UPDATE webhooks SET ${updateFields.join(", ")} WHERE id = $${paramIndex}`,
      values
    );

    return this.getWebhook(id);
  }

  /**
   * Deactivate webhook
   */
  static async deactivateWebhook(id: string): Promise<boolean> {
    const result = await execute(
      `UPDATE webhooks SET active = false, updated_at = $1 WHERE id = $2`,
      [Date.now(), id]
    );
    return result > 0;
  }

  /**
   * Record an event (this triggers webhook deliveries)
   */
  static async recordEvent(event: Omit<WebhookEvent, "id">): Promise<WebhookEvent> {
    const fullEvent: WebhookEvent = {
      ...event,
      id: uuidv4(),
    };

    // Find matching webhooks and queue deliveries
    const matchingWebhooks = await getMany<any>(
      `SELECT * FROM webhooks WHERE active = true AND $1 = ANY(events)`,
      [event.eventType]
    );

    for (const webhook of matchingWebhooks) {
      await this.queueDelivery(
        {
          id: webhook.id,
          url: webhook.url,
          events: webhook.events,
          active: webhook.active,
          secret: webhook.secret,
          headers: webhook.headers || {},
          createdAt: webhook.created_at,
          updatedAt: webhook.updated_at,
          retryPolicy: {
            maxAttempts: webhook.max_attempts || 5,
            initialDelayMs: 5000,
            backoffMultiplier: 2,
          },
        },
        fullEvent
      );
    }

    return fullEvent;
  }

  /**
   * Queue a delivery for a webhook
   */
  static async queueDelivery(
    webhook: WebhookRegistration,
    event: WebhookEvent
  ): Promise<string> {
    const deliveryId = uuidv4();
    const payload = JSON.stringify(event);
    const now = Date.now();

    await execute(
      `INSERT INTO webhook_deliveries (id, webhook_id, event_type, payload, status, attempt_count, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [deliveryId, webhook.id, event.eventType, payload, "pending", 1, now, now]
    );

    console.log(`[WEBHOOK] Queued delivery: ${deliveryId} -> ${webhook.url}`);
    return deliveryId;
  }

  /**
   * Record a delivery attempt
   */
  static async recordDeliveryAttempt(
    deliveryId: string,
    attemptNumber: number,
    statusCode?: number,
    responseBody?: string,
    error?: string
  ): Promise<void> {
    let status = "pending";
    if (statusCode === 200 || statusCode === 201) {
      status = "delivered";
    } else if (error) {
      status = "pending"; // Will retry
    }

    await execute(
      `UPDATE webhook_deliveries 
       SET status = $1, attempt_count = $2, last_error = $3, updated_at = $4
       WHERE id = $5`,
      [status, attemptNumber, error || null, Date.now(), deliveryId]
    );
  }

  /**
   * Get delivery status
   */
  static async getDeliveryStatus(deliveryId: string): Promise<WebhookDelivery | null> {
    const row = await getOne<any>(
      `SELECT * FROM webhook_deliveries WHERE id = $1`,
      [deliveryId]
    );

    if (!row) return null;

    return {
      id: row.id,
      webhookId: row.webhook_id,
      eventId: "", // Not stored, derived from event_type
      url: "",
      payload: row.payload,
      signature: "",
      timestamp: row.created_at,
      attempts: [],
      status: row.status,
    };
  }

  /**
   * Get event log (for debugging)
   */
  static async getEventLog(filter?: {
    eventType?: EventType;
    limit?: number;
    since?: number;
  }): Promise<WebhookEvent[]> {
    const limit = filter?.limit || 100;
    const since = filter?.since || Date.now() - 24 * 60 * 60 * 1000; // Last 24 hours

    let sql = `SELECT * FROM webhook_deliveries WHERE created_at > $1`;
    const params: any[] = [since];

    if (filter?.eventType) {
      sql += ` AND event_type = $${params.length + 1}`;
      params.push(filter.eventType);
    }

    sql += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const rows = await getMany<any>(sql, params);
    return rows.map((row) => ({
      id: row.id,
      eventType: row.event_type as EventType,
      webhookId: row.webhook_id,
      timestamp: row.created_at,
      payload: JSON.parse(row.payload),
    }));
  }

  /**
   * Get failed deliveries for manual inspection
   */
  static async getFailedDeliveries(limit: number = 100): Promise<WebhookDelivery[]> {
    const rows = await getMany<any>(
      `SELECT * FROM webhook_deliveries WHERE status IN ('failed', 'dead_letter') 
       ORDER BY created_at DESC LIMIT $1`,
      [limit]
    );

    return rows.map((row) => ({
      id: row.id,
      webhookId: row.webhook_id,
      eventId: "",
      url: "",
      payload: row.payload,
      signature: "",
      timestamp: row.created_at,
      attempts: [],
      status: row.status,
    }));
  }

  /**
   * Get pending retries
   */
  static async getPendingRetries(): Promise<WebhookDelivery[]> {
    const rows = await getMany<any>(
      `SELECT * FROM webhook_deliveries WHERE status = 'pending' ORDER BY created_at ASC`
    );

    return rows.map((row) => ({
      id: row.id,
      webhookId: row.webhook_id,
      eventId: "",
      url: "",
      payload: row.payload,
      signature: "",
      timestamp: row.created_at,
      attempts: [],
      status: row.status,
    }));
  }

  /**
   * Rotate webhook secret
   */
  static async rotateWebhookSecret(webhookId: string): Promise<string> {
    const newSecret = uuidv4().replace(/-/g, "");
    
    await execute(
      `UPDATE webhooks SET secret = $1, updated_at = $2 WHERE id = $3`,
      [newSecret, Date.now(), webhookId]
    );

    return newSecret;
  }
}
