/**
 * Event Registry & Catalog
 * Standardized event types and schemas for entire platform
 */

export const EVENT_REGISTRY = {
  // Call Events
  CALL_STARTED: {
    name: "CALL_STARTED",
    description: "Outgoing or incoming call has started",
    category: "calls",
    schema: {
      callId: "string",
      initiator: "string",
      participants: "string[]",
      duration: "number",
      protocol: "string",
    },
  },

  CALL_ENDED: {
    name: "CALL_ENDED",
    description: "Call has ended",
    category: "calls",
    schema: {
      callId: "string",
      duration: "number",
      endReason: "string",
    },
  },

  CALL_MISSED: {
    name: "CALL_MISSED",
    description: "Incoming call was not answered",
    category: "calls",
    schema: {
      callId: "string",
      from: "string",
      timestamp: "number",
    },
  },

  // Node Events
  NODE_ONLINE: {
    name: "NODE_ONLINE",
    description: "Node came online",
    category: "nodes",
    schema: {
      nodeId: "string",
      location: "string",
      capabilities: "string[]",
    },
  },

  NODE_OFFLINE: {
    name: "NODE_OFFLINE",
    description: "Node went offline",
    category: "nodes",
    schema: {
      nodeId: "string",
      reason: "string",
      lastSeen: "number",
    },
  },

  // Messaging Events
  MESSAGE_SENT: {
    name: "MESSAGE_SENT",
    description: "Message was sent successfully",
    category: "messaging",
    schema: {
      messageId: "string",
      from: "string",
      to: "string",
      type: "string",
      encrypted: "boolean",
    },
  },

  MESSAGE_RECEIVED: {
    name: "MESSAGE_RECEIVED",
    description: "Message was received",
    category: "messaging",
    schema: {
      messageId: "string",
      from: "string",
      to: "string",
      content: "string",
    },
  },

  // Signal Events
  SIGNAL_WEAK: {
    name: "SIGNAL_WEAK",
    description: "Wireless signal strength degraded",
    category: "signals",
    schema: {
      deviceId: "string",
      signalStrength: "number",
      frequency: "string",
    },
  },

  SIGNAL_STRONG: {
    name: "SIGNAL_STRONG",
    description: "Wireless signal strength improved",
    category: "signals",
    schema: {
      deviceId: "string",
      signalStrength: "number",
    },
  },

  // Device Events
  DEVICE_ATTACHED: {
    name: "DEVICE_ATTACHED",
    description: "New device connected to ecosystem",
    category: "devices",
    schema: {
      deviceId: "string",
      deviceType: "string",
      macAddress: "string",
    },
  },

  DEVICE_DETACHED: {
    name: "DEVICE_DETACHED",
    description: "Device disconnected from ecosystem",
    category: "devices",
    schema: {
      deviceId: "string",
      reason: "string",
    },
  },

  // Dock Events
  SIM_DOCK_CONNECTED: {
    name: "SIM_DOCK_CONNECTED",
    description: "SIM dock connected to portal",
    category: "dock",
    schema: {
      dockId: "string",
      dockType: "string",
      carrier: "string",
    },
  },

  SIM_DOCK_DISCONNECTED: {
    name: "SIM_DOCK_DISCONNECTED",
    description: "SIM dock disconnected from portal",
    category: "dock",
    schema: {
      dockId: "string",
      reason: "string",
    },
  },

  // Butterfly/AI Events
  BUTTERFLY_BOUND: {
    name: "BUTTERFLY_BOUND",
    description: "AI butterfly tag bound to orb",
    category: "butterfly",
    schema: {
      butterflyTagId: "string",
      aiName: "string",
      orbId: "string",
    },
  },

  BUTTERFLY_UNBOUND: {
    name: "BUTTERFLY_UNBOUND",
    description: "AI butterfly tag unbound from orb",
    category: "butterfly",
    schema: {
      butterflyTagId: "string",
      reason: "string",
    },
  },

  // Carrier Events
  CARRIER_STATUS_CHANGE: {
    name: "CARRIER_STATUS_CHANGE",
    description: "Carrier network status changed",
    category: "carrier",
    schema: {
      carrier: "string",
      status: "string",
      coverage: "number",
    },
  },

  // Governance Events
  GOVERNANCE_VIOLATION: {
    name: "GOVERNANCE_VIOLATION",
    description: "Architectural governance rule violation detected",
    category: "governance",
    schema: {
      ruleId: "string",
      severity: "string",
      affectedPath: "string",
      violation: "string",
    },
  },

  GOVERNANCE_OVERRIDE: {
    name: "GOVERNANCE_OVERRIDE",
    description: "Governance rule override applied",
    category: "governance",
    schema: {
      ruleId: "string",
      overrideId: "string",
      expiresAt: "number",
      reason: "string",
    },
  },

  // Auth Events
  AUTH_SUCCESS: {
    name: "AUTH_SUCCESS",
    description: "Authentication successful",
    category: "auth",
    schema: {
      userId: "string",
      method: "string",
      deviceId: "string",
    },
  },

  AUTH_FAILURE: {
    name: "AUTH_FAILURE",
    description: "Authentication failed",
    category: "auth",
    schema: {
      userId: "string",
      method: "string",
      reason: "string",
    },
  },

  // Webhook Events
  WEBHOOK_DELIVERY_SUCCESS: {
    name: "WEBHOOK_DELIVERY_SUCCESS",
    description: "Webhook was delivered successfully",
    category: "webhooks",
    schema: {
      webhookId: "string",
      deliveryId: "string",
      statusCode: "number",
    },
  },

  WEBHOOK_DELIVERY_FAILED: {
    name: "WEBHOOK_DELIVERY_FAILED",
    description: "Webhook delivery failed after retries",
    category: "webhooks",
    schema: {
      webhookId: "string",
      deliveryId: "string",
      attempts: "number",
      error: "string",
    },
  },
} as const;

/**
 * Get event registry entry
 */
export function getEventSchema(eventName: string) {
  return (EVENT_REGISTRY as any)[eventName] || null;
}

/**
 * Get all events by category
 */
export function getEventsByCategory(category: string) {
  return Object.values(EVENT_REGISTRY).filter((e) => e.category === category);
}

/**
 * Validate event against schema
 */
export function validateEventSchema(eventName: string, payload: any): boolean {
  const schema = getEventSchema(eventName);
  if (!schema) return false;

  const requiredKeys = Object.keys(schema.schema);
  return requiredKeys.every((key) => key in payload);
}

/**
 * Get all available event names
 */
export function getAllEventNames(): string[] {
  return Object.keys(EVENT_REGISTRY);
}

/**
 * Get all available categories
 */
export function getAllCategories(): string[] {
  const categories = new Set<string>();
  Object.values(EVENT_REGISTRY).forEach((e) => {
    categories.add(e.category);
  });
  return Array.from(categories);
}

/**
 * Export list of all events (for documentation)
 */
export const EVENT_DOCUMENTATION = {
  totalEvents: Object.keys(EVENT_REGISTRY).length,
  categories: getAllCategories(),
  events: EVENT_REGISTRY,
};
