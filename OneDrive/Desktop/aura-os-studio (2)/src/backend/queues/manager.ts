/**
 * Queue Worker Service
 * Handles webhook delivery retries with exponential backoff
 */

import { Queue, Worker, QueueScheduler } from "bullmq";
import axios from "axios";
import { WebhookDelivery } from "../types/webhook";
import { WebhookService } from "../webhooks/service";
import { WEBHOOK_HEADERS } from "../types/webhook";

let redisConnection: any;

// Initialize Redis connection (would come from config)
export function initializeRedis(redisUrl?: string) {
  const connection = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    ...(process.env.REDIS_PASSWORD && { password: process.env.REDIS_PASSWORD }),
  };

  redisConnection = connection;
  return connection;
}

export class QueueManager {
  static webhookQueue: Queue | null = null;
  static eventQueue: Queue | null = null;
  static retryQueue: Queue | null = null;

  static initialize() {
    if (!redisConnection) {
      console.warn(
        "[QUEUE] Redis not connected, using in-memory queue simulation"
      );
      return;
    }

    try {
      this.webhookQueue = new Queue("webhooks", { connection: redisConnection });
      this.eventQueue = new Queue("events", { connection: redisConnection });
      this.retryQueue = new Queue("retries", { connection: redisConnection });

      // Start queue schedulers for delayed jobs
      new QueueScheduler("webhooks", { connection: redisConnection });
      new QueueScheduler("retries", { connection: redisConnection });

      console.log("[QUEUE] Queue system initialized");

      this.setupWorkers();
    } catch (err) {
      console.error("[QUEUE] Failed to initialize Redis:", err);
    }
  }

  private static setupWorkers() {
    if (!this.webhookQueue) return;

    // Worker for webhook deliveries
    const webhookWorker = new Worker(
      "webhooks",
      async (job) => {
        return await this.handleWebhookDelivery(job.data);
      },
      { connection: redisConnection, concurrency: 10 }
    );

    webhookWorker.on("completed", (job) => {
      console.log(`[WORKER] Webhook delivery completed: ${job.id}`);
    });

    webhookWorker.on("failed", (job, err) => {
      console.error(`[WORKER] Webhook delivery failed: ${job?.id}`, err.message);

      if (job) {
        this.scheduleRetry(job.data, job.attemptsMade || 0);
      }
    });

    // Worker for event processing
    const eventWorker = new Worker(
      "events",
      async (job) => {
        console.log(`[WORKER] Processing event: ${job.data.eventType}`);
        return job.data;
      },
      { connection: redisConnection, concurrency: 20 }
    );

    eventWorker.on("failed", (job, err) => {
      console.error(`[WORKER] Event processing failed:`, err.message);
    });
  }

  /**
   * Queue a webhook delivery
   */
  static async queueWebhookDelivery(delivery: WebhookDelivery) {
    if (!this.webhookQueue) {
      // Fallback: process immediately
      console.log(`[QUEUE] No Redis, delivering synchronously to ${delivery.url}`);
      await this.handleWebhookDelivery(delivery);
      return;
    }

    await this.webhookQueue.add(
      "deliver",
      delivery,
      {
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
        removeOnComplete: true,
        removeOnFail: true,
      }
    );
  }

  /**
   * Queue an event for processing
   */
  static async queueEvent(eventData: any) {
    if (!this.eventQueue) {
      console.log(`[QUEUE] Event queued (no Redis)`);
      return;
    }

    await this.eventQueue.add("process", eventData, {
      removeOnComplete: true,
    });
  }

  /**
   * Handle actual webhook delivery
   */
  private static async handleWebhookDelivery(
    delivery: WebhookDelivery
  ): Promise<any> {
    const attemptNumber = (delivery.attempts?.length || 0) + 1;

    try {
      const response = await axios.post(delivery.url, JSON.parse(delivery.payload), {
        headers: {
          "Content-Type": "application/json",
          [WEBHOOK_HEADERS.SIGNATURE]: delivery.signature,
          [WEBHOOK_HEADERS.TIMESTAMP]: Date.now().toString(),
          [WEBHOOK_HEADERS.EVENT_ID]: delivery.eventId,
          [WEBHOOK_HEADERS.DELIVERY_ID]: delivery.id,
        },
        timeout: 30000, // 30 second timeout
      });

      // Record successful delivery
      WebhookService.recordDeliveryAttempt(
        delivery.id,
        attemptNumber,
        response.status,
        JSON.stringify(response.data)
      );

      return { success: true, statusCode: response.status };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const errorMessage = error.message;

      // Record failed attempt
      WebhookService.recordDeliveryAttempt(
        delivery.id,
        attemptNumber,
        statusCode,
        undefined,
        errorMessage
      );

      // Determine if we should retry
      if (this.isRetryableError(statusCode) && attemptNumber < 5) {
        throw error; // BullMQ will handle retry
      }

      return { success: false, statusCode, error: errorMessage };
    }
  }

  /**
   * Schedule a retry with exponential backoff
   */
  private static async scheduleRetry(delivery: WebhookDelivery, attempts: number) {
    if (!this.retryQueue || attempts >= 5) {
      console.log(`[QUEUE] Giving up on delivery ${delivery.id} after ${attempts} attempts`);
      return;
    }

    const delayMs = Math.pow(2, attempts) * 5000; // Exponential backoff

    await this.retryQueue.add(
      "retry",
      delivery,
      {
        delay: delayMs,
        removeOnComplete: true,
      }
    );

    console.log(
      `[QUEUE] Scheduled retry for ${delivery.id} in ${delayMs}ms (attempt ${attempts + 1})`
    );
  }

  /**
   * Determine if error is retryable
   */
  private static isRetryableError(statusCode?: number): boolean {
    // Retry on server errors (5xx) and timeouts
    // Don't retry on 4xx client errors
    if (!statusCode) return true; // Network errors are retryable
    return statusCode >= 500 || statusCode === 408 || statusCode === 429;
  }

  /**
   * Get queue stats
   */
  static async getQueueStats() {
    if (!this.webhookQueue) {
      return { status: "no_redis", message: "Redis not available" };
    }

    const counts = await this.webhookQueue.getJobCounts();
    return {
      webhooks: counts,
      events: await this.eventQueue?.getJobCounts(),
      retries: await this.retryQueue?.getJobCounts(),
    };
  }

  /**
   * Graceful shutdown
   */
  static async shutdown() {
    await this.webhookQueue?.close();
    await this.eventQueue?.close();
    await this.retryQueue?.close();
    console.log("[QUEUE] Queue system shut down");
  }
}
