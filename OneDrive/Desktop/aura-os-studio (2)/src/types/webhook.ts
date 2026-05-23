/**
 * Production Webhook Types
 * Standardized event interface for entire platform
 */

export type EventType =
  | "CALL_STARTED"
  | "CALL_ENDED"
  | "CALL_MISSED"
  | "NODE_ONLINE"
  | "NODE_OFFLINE"
  | "MESSAGE_SENT"
  | "MESSAGE_RECEIVED"
  | "SIGNAL_WEAK"
  | "SIGNAL_STRONG"
  | "DEVICE_ATTACHED"
  | "DEVICE_DETACHED"
  | "SIM_DOCK_CONNECTED"
  | "SIM_DOCK_DISCONNECTED"
  | "BUTTERFLY_BOUND"
  | "BUTTERFLY_UNBOUND"
  | "CARRIER_STATUS_CHANGE"
  | "GOVERNANCE_VIOLATION"
  | "GOVERNANCE_OVERRIDE"
  | "AUTH_SUCCESS"
  | "AUTH_FAILURE"
  | "WEBHOOK_DELIVERY_FAILED"
  | "WEBHOOK_DELIVERY_SUCCESS";

export interface WebhookEvent {
  id: string;
  eventType: EventType;
  timestamp: number; // milliseconds
  source: {
    deviceId?: string;
    nodeId?: string;
    serviceId?: string;
    userId?: string;
  };
  payload: Record<string, any>;
  metadata?: {
    priority?: "low" | "normal" | "high" | "critical";
    retryable?: boolean;
    tags?: string[];
  };
}

export interface WebhookRegistration {
  id: string;
  url: string;
  events: EventType[];
  active: boolean;
  secret: string; // HMAC signing secret
  headers?: Record<string, string>;
  createdAt: number;
  updatedAt: number;
  retryPolicy?: {
    maxAttempts: number;
    initialDelayMs: number;
    backoffMultiplier: number;
  };
  metadata?: Record<string, any>;
}

export interface WebhookDelivery {
  id: string;
  webhookId: string;
  eventId: string;
  url: string;
  payload: string; // JSON stringified
  signature: string; // HMAC SHA256
  timestamp: number;
  attempts: WebhookDeliveryAttempt[];
  status: "pending" | "delivered" | "failed" | "dead_letter";
}

export interface WebhookDeliveryAttempt {
  attemptNumber: number;
  timestamp: number;
  statusCode?: number;
  responseBody?: string;
  error?: string;
}

export interface WebhookSignatureData {
  timestamp: number;
  eventId: string;
  payload: string;
}

export const WEBHOOK_HEADERS = {
  SIGNATURE: "X-Webhook-Signature",
  TIMESTAMP: "X-Webhook-Timestamp",
  EVENT_ID: "X-Webhook-Event-Id",
  EVENT_TYPE: "X-Webhook-Event-Type",
  DELIVERY_ID: "X-Webhook-Delivery-Id",
} as const;
