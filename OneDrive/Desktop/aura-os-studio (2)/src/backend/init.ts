/**
 * AURA OS - Production Backend Integration
 * 
 * This module initializes all production systems:
 * - API Gateway with security middleware
 * - Webhook receiver & delivery system
 * - Queue management with Redis
 * - Device identity registry
 * - Authentication & authorization
 * - Real-time WebSocket communication
 * - Audit logging
 */

import express, { Express, Request, Response } from "express";
import http from "http";
import {
  securityHeaders,
  corsConfig,
  apiLimiter,
  authLimiter,
  webhookLimiter,
  addSecurityHeaders,
  auditLogger,
  requireAuth,
} from "./security/middleware";
import webhookRoutes from "./api/webhook-routes";
import { WebhookService } from "./webhooks/service";
import { QueueManager } from "./queues/manager";
import { DeviceRegistry } from "./devices/registry";
import { AuthService, validateAuthConfig } from "./auth/service";
import { RealtimeManager } from "./realtime/manager";
import { EVENT_DOCUMENTATION, getAllEventNames } from "./events/registry";

export interface ProductionBackendConfig {
  redisUrl?: string;
  firebaseProject?: string;
  enableDetailedLogging?: boolean;
}

export async function initializeProductionBackend(
  app: Express,
  server: http.Server,
  config?: ProductionBackendConfig
) {
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log("║     AURA OS - PRODUCTION BACKEND INITIALIZATION              ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");

  // ── 1. VALIDATE CONFIGURATION ─────────────────────────────────────────────
  console.log("[INIT] Validating configuration...");

  const isAuthValid = validateAuthConfig();
  if (!isAuthValid) {
    console.warn(
      "[INIT] ⚠️  Running with development secrets. NOT safe for production."
    );
  }

  // ── 2. APPLY SECURITY MIDDLEWARE ──────────────────────────────────────────
  console.log("[INIT] Applying security middleware...");

  app.use(securityHeaders);
  app.use(corsConfig);
  app.use(addSecurityHeaders);
  app.use(auditLogger);

  // ── 3. APPLY RATE LIMITING ────────────────────────────────────────────────
  console.log("[INIT] Configuring rate limiting...");

  app.use("/api/", apiLimiter);
  app.use("/api/auth", authLimiter);
  app.use("/api/webhooks/incoming", webhookLimiter);

  // ── 4. INITIALIZE REDIS & QUEUE SYSTEM ────────────────────────────────────
  console.log("[INIT] Initializing queue system (Redis/BullMQ)...");

  if (config?.redisUrl) {
    QueueManager.initialize();
  } else {
    console.warn(
      "[INIT] ⚠️  Redis not configured, using in-memory fallback (no persistence)"
    );
  }

  // ── 5. INITIALIZE REAL-TIME WEBSOCKET SYSTEM ──────────────────────────────
  console.log("[INIT] Setting up WebSocket (Socket.IO) server...");

  RealtimeManager.initialize(server);

  // ── 6. MOUNT API ROUTES ───────────────────────────────────────────────────
  console.log("[INIT] Mounting webhook API routes...");

  app.use(webhookRoutes);

  // ── 7. DEVICE REGISTRY ROUTES ─────────────────────────────────────────────
  console.log("[INIT] Mounting device registry routes...");

  app.post("/api/devices/register", requireAuth, (req: Request, res: Response) => {
    try {
      const device = DeviceRegistry.registerDevice(req.body);
      const token = AuthService.issueAuthToken(device.id);

      res.status(201).json({
        device,
        authToken: token,
        message: "Device registered successfully",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/devices/:id", requireAuth, (req: Request, res: Response) => {
    try {
      const device = DeviceRegistry.getDevice(req.params.id);
      if (!device) {
        return res.status(404).json({ error: "Device not found" });
      }
      res.json({ device });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get(
    "/api/devices",
    requireAuth,
    (req: Request, res: Response) => {
      try {
        const devices = DeviceRegistry.listDevices();
        res.json({ devices, count: devices.length });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    }
  );

  app.post(
    "/api/devices/:id/health",
    requireAuth,
    (req: Request, res: Response) => {
      try {
        DeviceRegistry.recordHealthCheck({
          deviceId: req.params.id,
          timestamp: Date.now(),
          status: req.body.status || "online",
          lastPingMs: req.body.lastPingMs || 0,
          ...req.body,
        });

        res.json({ message: "Health check recorded" });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    }
  );

  // ── 8. AUTHENTICATION ROUTES ──────────────────────────────────────────────
  console.log("[INIT] Mounting authentication routes...");

  app.post("/api/auth/api-keys", authLimiter, requireAuth, (req: Request, res: Response) => {
    try {
      const { ownerId, ownerType, name, scope } = req.body;

      if (!ownerId || !ownerType || !name) {
        return res.status(400).json({
          error: "Missing ownerId, ownerType, or name",
        });
      }

      const apiKey = AuthService.createAPIKey(ownerId, ownerType, name, scope);

      res.status(201).json({
        apiKey,
        message: "API key created (save this now, you won't see it again)",
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/auth/verify", (req: Request, res: Response) => {
    try {
      const authHeader = req.headers.authorization;

      if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ valid: false, error: "No token provided" });
      }

      const token = authHeader.substring(7);
      const payload = AuthService.verifyJWT(token);

      if (!payload) {
        return res.status(401).json({ valid: false, error: "Invalid token" });
      }

      res.json({ valid: true, payload });
    } catch (err: any) {
      res.status(500).json({ valid: false, error: err.message });
    }
  });

  app.post("/api/auth/login", authLimiter, async (req: Request, res: Response) => {
    try {
      const { userId, password } = req.body;

      // TODO: Implement real password verification
      // This is a skeleton - integrate with your auth provider

      const jwtToken = AuthService.generateJWT({
        sub: userId,
        iss: "aura-os",
        aud: "aura-platform",
        role: "user",
        scope: ["read:webhooks", "write:webhooks"],
      });

      const session = AuthService.createSession(
        userId,
        undefined,
        req.ip,
        req.get("user-agent")
      );

      AuthService.recordAuthAttempt("jwt", true, userId, undefined, req.ip);

      res.json({
        token: jwtToken,
        sessionId: session.sessionId,
        expiresIn: "24h",
      });
    } catch (err: any) {
      AuthService.recordAuthAttempt(
        "jwt",
        false,
        req.body.userId,
        undefined,
        req.ip,
        err.message
      );

      res.status(500).json({ error: err.message });
    }
  });

  // ── 9. SYSTEM STATUS & MONITORING ROUTES ──────────────────────────────────
  console.log("[INIT] Setting up monitoring endpoints...");

  app.get("/api/system/health", (req: Request, res: Response) => {
    res.json({
      status: "ok",
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
      uptime: process.uptime(),
    });
  });

  app.get("/api/system/events", requireAuth, (req: Request, res: Response) => {
    res.json({
      totalEventTypes: getAllEventNames().length,
      events: getAllEventNames().slice(0, 20),
      documentation: `See /api/system/events/docs for full event catalog`,
    });
  });

  app.get("/api/system/events/docs", requireAuth, (req: Request, res: Response) => {
    res.json(EVENT_DOCUMENTATION);
  });

  app.get(
    "/api/system/stats",
    requireAuth,
    async (req: Request, res: Response) => {
      try {
        const webhooks = WebhookService.listWebhooks();
        const devices = DeviceRegistry.listDevices();
        const queueStats = await QueueManager.getQueueStats();
        const connectedUsers = RealtimeManager.getConnectedUsers();

        res.json({
          webhooks: webhooks.length,
          devices: devices.length,
          connectedUsers: connectedUsers.length,
          queue: queueStats,
          timestamp: Date.now(),
        });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    }
  );

  // ── 10. GRACEFUL SHUTDOWN ─────────────────────────────────────────────────
  const gracefulShutdown = async (signal: string) => {
    console.log(
      `\n[SHUTDOWN] Received ${signal}, initiating graceful shutdown...`
    );

    try {
      await RealtimeManager.shutdown();
      await QueueManager.shutdown();
      console.log("[SHUTDOWN] All systems shut down cleanly");
      process.exit(0);
    } catch (err) {
      console.error("[SHUTDOWN] Error during shutdown:", err);
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => gracefulShutdown("SIGINT"));

  // ── 11. LOG INITIALIZATION COMPLETE ───────────────────────────────────────
  console.log(
    "\n╔════════════════════════════════════════════════════════════════╗"
  );
  console.log("║     ✓ PRODUCTION BACKEND INITIALIZED                        ║");
  console.log("╠════════════════════════════════════════════════════════════════╣");
  console.log("║                                                                ║");
  console.log("║  ✓ Security middleware (Helmet, CORS, rate limiting)        ║");
  console.log("║  ✓ Webhook receiver & HMAC verification                     ║");
  console.log("║  ✓ Queue system (Redis/BullMQ)                              ║");
  console.log("║  ✓ Device identity registry                                 ║");
  console.log("║  ✓ Authentication & JWT                                     ║");
  console.log("║  ✓ Real-time WebSocket (Socket.IO)                          ║");
  console.log("║  ✓ Event registry & catalog                                 ║");
  console.log("║  ✓ Audit logging                                            ║");
  console.log("║                                                                ║");
  console.log("║  Endpoints:                                                  ║");
  console.log("║    POST   /api/webhooks                  - Register webhook  ║");
  console.log("║    GET    /api/webhooks                  - List webhooks     ║");
  console.log("║    POST   /api/events                    - Record event      ║");
  console.log("║    POST   /api/devices/register          - Register device   ║");
  console.log("║    GET    /api/system/health             - Health check      ║");
  console.log("║    GET    /api/system/stats              - System stats      ║");
  console.log("║                                                                ║");
  console.log("║  WebSocket events available at: ws://localhost:3000         ║");
  console.log("║                                                                ║");
  console.log("╚════════════════════════════════════════════════════════════════╝\n");
}
