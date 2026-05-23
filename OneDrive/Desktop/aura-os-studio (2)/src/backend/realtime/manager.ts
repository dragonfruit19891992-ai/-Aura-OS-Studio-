/**
 * Real-Time WebSocket Server
 * Live event streaming, device status, call notifications
 */

import { Server as SocketIOServer, Socket } from "socket.io";
import { Server as HTTPServer } from "http";
import { AuthService } from "../auth/service";
import { WebhookService } from "../webhooks/service";
import { DeviceRegistry } from "../devices/registry";

export class RealtimeManager {
  private static io: SocketIOServer | null = null;
  private static connectedClients = new Map<string, Set<string>>(); // userId -> Set of socket IDs

  /**
   * Initialize Socket.IO server
   */
  static initialize(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:3000",
        credentials: true,
      },
      transports: ["websocket", "polling"],
    });

    this.setupMiddleware();
    this.setupEventHandlers();

    console.log("[REALTIME] WebSocket server initialized");

    return this.io;
  }

  /**
   * Setup authentication middleware
   */
  private static setupMiddleware() {
    if (!this.io) return;

    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Missing authentication token"));
      }

      const jwtPayload = AuthService.verifyJWT(token);

      if (!jwtPayload) {
        return next(new Error("Invalid token"));
      }

      socket.data.userId = jwtPayload.sub;
      socket.data.role = jwtPayload.role;
      socket.data.scope = jwtPayload.scope;

      next();
    });
  }

  /**
   * Setup event handlers
   */
  private static setupEventHandlers() {
    if (!this.io) return;

    this.io.on("connection", (socket: Socket) => {
      const userId = socket.data.userId;

      console.log(`[REALTIME] User connected: ${userId} (${socket.id})`);

      // Track connected clients
      if (!this.connectedClients.has(userId)) {
        this.connectedClients.set(userId, new Set());
      }
      this.connectedClients.get(userId)!.add(socket.id);

      // User joined (for notifications)
      socket.on("join-user-room", (data) => {
        socket.join(`user:${userId}`);
        console.log(`[REALTIME] User ${userId} joined their room`);
      });

      // Subscribe to device status updates
      socket.on("subscribe-device", (deviceId: string) => {
        socket.join(`device:${deviceId}`);
        const device = DeviceRegistry.getDevice(deviceId);
        if (device) {
          socket.emit("device-info", device);
        }
      });

      // Subscribe to call events
      socket.on("subscribe-calls", () => {
        socket.join(`calls:${userId}`);
        console.log(`[REALTIME] User ${userId} subscribed to call events`);
      });

      // Subscribe to webhook events
      socket.on("subscribe-webhooks", () => {
        socket.join(`webhooks:${userId}`);
        console.log(`[REALTIME] User ${userId} subscribed to webhook events`);
      });

      // Handle disconnection
      socket.on("disconnect", () => {
        const sockets = this.connectedClients.get(userId);
        if (sockets) {
          sockets.delete(socket.id);
          if (sockets.size === 0) {
            this.connectedClients.delete(userId);
          }
        }

        console.log(`[REALTIME] User disconnected: ${userId} (${socket.id})`);
      });

      // Error handler
      socket.on("error", (error) => {
        console.error(`[REALTIME] Socket error for user ${userId}:`, error);
      });
    });
  }

  /**
   * Broadcast device status update
   */
  static broadcastDeviceStatus(
    deviceId: string,
    status: "online" | "offline" | "degraded",
    metadata?: any
  ) {
    if (!this.io) return;

    this.io.to(`device:${deviceId}`).emit("device-status", {
      deviceId,
      status,
      timestamp: Date.now(),
      ...metadata,
    });

    console.log(`[REALTIME] Device status: ${deviceId} -> ${status}`);
  }

  /**
   * Broadcast call event
   */
  static broadcastCallEvent(
    userId: string,
    eventType: "call_started" | "call_ended" | "call_missed" | "call_incoming",
    callData: any
  ) {
    if (!this.io) return;

    this.io.to(`calls:${userId}`).emit("call-event", {
      eventType,
      timestamp: Date.now(),
      ...callData,
    });

    console.log(`[REALTIME] Call event for ${userId}: ${eventType}`);
  }

  /**
   * Broadcast webhook delivery event
   */
  static broadcastWebhookEvent(
    userId: string,
    webhookId: string,
    eventType: string,
    payload: any
  ) {
    if (!this.io) return;

    this.io.to(`webhooks:${userId}`).emit("webhook-event", {
      webhookId,
      eventType,
      timestamp: Date.now(),
      payload,
    });

    console.log(`[REALTIME] Webhook event for ${userId}: ${webhookId}`);
  }

  /**
   * Notify user of node status
   */
  static notifyNodeStatus(userId: string, nodeId: string, status: string) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit("node-status", {
      nodeId,
      status,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast to specific user room
   */
  static notifyUser(userId: string, event: string, data: any) {
    if (!this.io) return;

    this.io.to(`user:${userId}`).emit(event, {
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Get connected users
   */
  static getConnectedUsers(): string[] {
    return Array.from(this.connectedClients.keys());
  }

  /**
   * Get user's socket connections
   */
  static getUserSockets(userId: string): string[] {
    return Array.from(this.connectedClients.get(userId) || new Set());
  }

  /**
   * Broadcast system-wide notification
   */
  static broadcastSystemEvent(event: string, data: any) {
    if (!this.io) return;

    this.io.emit(event, {
      ...data,
      timestamp: Date.now(),
    });
  }

  /**
   * Graceful shutdown
   */
  static async shutdown() {
    if (!this.io) return;

    await this.io.close();
    console.log("[REALTIME] WebSocket server shut down");
  }
}
