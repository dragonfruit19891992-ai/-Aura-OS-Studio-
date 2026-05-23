/**
 * Governance Event Bus
 * The pub/sub system that makes governance observability possible.
 */

export enum GovernanceEventType {
  OVERRIDE_CREATED = 'OVERRIDE_CREATED',
  RULE_SUPERSEDED = 'RULE_SUPERSEDED',
  DRIFT_THRESHOLD_EXCEEDED = 'DRIFT_THRESHOLD_EXCEEDED',
  SECURITY_POLICY_BLOCKED = 'SECURITY_POLICY_BLOCKED',
  TEMP_OVERRIDE_EXPIRED = 'TEMP_OVERRIDE_EXPIRED',
  ARCHITECTURE_REVIEW_REQUIRED = 'ARCHITECTURE_REVIEW_REQUIRED'
}

export interface GovernanceEvent {
  type: GovernanceEventType;
  timestamp: number;
  payload: any;
}

type EventCallback = (event: GovernanceEvent) => void;

export class GovernanceEventBus {
  private static instance: GovernanceEventBus;
  private listeners: Map<GovernanceEventType, EventCallback[]> = new Map();

  private constructor() {}

  public static getInstance(): GovernanceEventBus {
    if (!GovernanceEventBus.instance) {
      GovernanceEventBus.instance = new GovernanceEventBus();
    }
    return GovernanceEventBus.instance;
  }

  public subscribe(eventType: GovernanceEventType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType)!.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(eventType);
      if (callbacks) {
        this.listeners.set(eventType, callbacks.filter(cb => cb !== callback));
      }
    };
  }

  public publish(event: GovernanceEvent): void {
    console.log(`[GovernanceEventBus] Published ${event.type}`);
    const callbacks = this.listeners.get(event.type);
    if (callbacks) {
      callbacks.forEach(cb => {
        try {
          cb(event);
        } catch (err) {
          console.error(`[GovernanceEventBus] Error in listener for ${event.type}`, err);
        }
      });
    }
  }
}

export const eventBus = GovernanceEventBus.getInstance();
