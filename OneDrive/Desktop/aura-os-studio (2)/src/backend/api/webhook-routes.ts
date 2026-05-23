/**
 * Webhook API Endpoints
 * REST API for webhook management and event handling
 */

import express, { Router, Request, Response } from "express";
import {
  verifyWebhookMiddleware,
  requireAuth,
  validateRequestBody,
} from "../security/middleware";
import { WebhookService } from "../webhooks/service";
import { QueueManager } from "../queues/manager";
import { EventType } from "../types/webhook";

const router = Router();

/**
 * POST /api/webhooks
 * Register a new webhook
 */
router.post("/api/webhooks", requireAuth, async (req: Request, res: Response) => {
  try {
    const { url, events, headers, maxAttempts } = req.body;

    if (!url || !events || !Array.isArray(events)) {
      return res.status(400).json({
        error: "Missing or invalid url, events array required",
      });
    }

    const webhook = await WebhookService.registerWebhook(url, events, {
      headers,
      maxAttempts,
    });

    res.status(201).json({
      webhook,
      message: "Webhook registered successfully",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/webhooks
 * List all active webhooks
 */
router.get("/api/webhooks", requireAuth, async (req: Request, res: Response) => {
  try {
    const webhooks = await WebhookService.listWebhooks();
    res.json({ webhooks, count: webhooks.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/webhooks/:id
 * Get specific webhook
 */
router.get("/api/webhooks/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const webhook = await WebhookService.getWebhook(req.params.id);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    res.json({ webhook });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * PUT /api/webhooks/:id
 * Update webhook
 */
router.put("/api/webhooks/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const webhook = await WebhookService.updateWebhook(req.params.id, req.body);
    if (!webhook) {
      return res.status(404).json({ error: "Webhook not found" });
    }
    res.json({ webhook, message: "Webhook updated" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/webhooks/:id
 * Deactivate webhook
 */
router.delete(
  "/api/webhooks/:id",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const success = await WebhookService.deactivateWebhook(req.params.id);
      if (!success) {
        return res.status(404).json({ error: "Webhook not found" });
      }
      res.json({ message: "Webhook deactivated" });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * POST /api/webhooks/:id/rotate-secret
 * Rotate webhook secret
 */
router.post(
  "/api/webhooks/:id/rotate-secret",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const newSecret = await WebhookService.rotateWebhookSecret(req.params.id);
      res.json({
        secret: newSecret,
        message: "Webhook secret rotated",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * POST /api/events
 * Record a new event (internal only)
 */
router.post("/api/events", requireAuth, async (req: Request, res: Response) => {
  try {
    const { eventType, source, payload, metadata } = req.body;

    if (!eventType || !source || !payload) {
      return res.status(400).json({
        error: "Missing eventType, source, or payload",
      });
    }

    const event = await WebhookService.recordEvent({
      eventType: eventType as EventType,
      timestamp: Date.now(),
      source,
      payload,
      metadata,
    });

    res.status(201).json({
      event,
      message: "Event recorded and webhooks queued for delivery",
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/events
 * Get event log
 */
router.get("/api/events", requireAuth, (req: Request, res: Response) => {
  try {
    const { eventType, limit, since } = req.query;

    const events = WebhookService.getEventLog({
      eventType: eventType as EventType | undefined,
      limit: limit ? parseInt(limit as string) : 100,
      since: since ? parseInt(since as string) : undefined,
    });

    res.json({ events, count: events.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/deliveries/:id
 * Get delivery status
 */
router.get(
  "/api/deliveries/:id",
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const delivery = WebhookService.getDeliveryStatus(req.params.id);
      if (!delivery) {
        return res.status(404).json({ error: "Delivery not found" });
      }
      res.json({ delivery });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /api/deliveries/failed
 * Get failed deliveries (dead letter queue)
 */
router.get(
  "/api/deliveries/failed",
  requireAuth,
  (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const failed = WebhookService.getFailedDeliveries(limit);
      res.json({ failed, count: failed.length });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * GET /api/queue/stats
 * Get queue statistics
 */
router.get("/api/queue/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    const stats = await QueueManager.getQueueStats();
    res.json({ stats });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/webhooks/incoming/:webhookId
 * Generic incoming webhook receiver (for external services)
 */
router.post(
  "/api/webhooks/incoming/:webhookId",
  verifyWebhookMiddleware,
  validateRequestBody,
  async (req: Request, res: Response) => {
    try {
      const { webhookId } = req.params;
      const eventId = (req as any).eventId;

      // Record the event
      const event = await WebhookService.recordEvent({
        eventType: "WEBHOOK_DELIVERY_SUCCESS",
        timestamp: Date.now(),
        source: { serviceId: webhookId },
        payload: req.body,
        metadata: { eventId },
      });

      res.json({
        success: true,
        eventId: event.id,
        message: "Webhook received and processed",
      });
    } catch (err: any) {
      res.status(500).json({
        success: false,
        error: err.message,
      });
    }
  }
);

/**
 * POST /api/test-webhook
 * Test webhook delivery with mock data
 */
router.post(
  "/api/test-webhook",
  requireAuth,
  async (req: Request, res: Response) => {
    try {
      const { webhookId } = req.body;

      if (!webhookId) {
        return res.status(400).json({ error: "webhookId required" });
      }

      const webhook = WebhookService.getWebhook(webhookId);
      if (!webhook) {
        return res.status(404).json({ error: "Webhook not found" });
      }

      // Create a test event
      const testEvent = await WebhookService.recordEvent({
        eventType: "MESSAGE_SENT",
        timestamp: Date.now(),
        source: { userId: "test-user" },
        payload: {
          messageId: "test-msg-123",
          content: "This is a test webhook delivery",
          status: "sent",
        },
        metadata: { isTest: true },
      });

      res.json({
        success: true,
        message: "Test webhook sent",
        eventId: testEvent.id,
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
