/**
 * Secret Key Namespace (SKN) System
 * Centralized secret management with versioning
 */

export enum SecretKeyNamespace {
  DEVICE_CORE = "SKN_DEVICE_CORE",
  WEBHOOK_GITHUB = "SKN_WEBHOOK_GITHUB",
  WEBHOOK_STRIPE = "SKN_WEBHOOK_STRIPE",
  WEBHOOK_FIREBASE = "SKN_WEBHOOK_FIREBASE",
  SIM_CARRIER = "SKN_SIM_CARRIER",
  NODE_ALPHA = "SKN_NODE_ALPHA",
  NODE_BETA = "SKN_NODE_BETA",
  API_INTERNAL = "SKN_API_INTERNAL",
  JWT_SIGNING = "SKN_JWT_SIGNING",
  ENCRYPTION_MASTER = "SKN_ENCRYPTION_MASTER",
  DATABASE_CONNECTION = "SKN_DATABASE_CONNECTION",
  REDIS_CONNECTION = "SKN_REDIS_CONNECTION",
  FIREBASE_ADMIN = "SKN_FIREBASE_ADMIN",
}

export interface SecretKeyEntry {
  namespace: SecretKeyNamespace;
  version: number;
  secret: string;
  createdAt: number;
  rotatedAt?: number;
  expiresAt?: number;
  isActive: boolean;
  algorithm?: string;
  metadata?: {
    description?: string;
    environment?: "development" | "staging" | "production";
    rotationPolicy?: "weekly" | "monthly" | "quarterly" | "on-demand";
    lastRotatedBy?: string;
  };
}

export interface SKNConfig {
  namespace: SecretKeyNamespace;
  secret: string;
  rotationIntervalDays?: number;
  maxVersions?: number; // keep old versions for rollback
  autoRotate?: boolean;
  alertBeforeExpiration?: number; // days
}

export interface SecretKeyRotation {
  id: string;
  namespace: SecretKeyNamespace;
  oldVersion: number;
  newVersion: number;
  rotatedAt: number;
  rotatedBy: string;
  reason?: string;
  status: "pending" | "completed" | "failed" | "rolled_back";
  metadata?: Record<string, any>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action:
    | "secret_created"
    | "secret_rotated"
    | "secret_accessed"
    | "secret_deleted"
    | "auth_success"
    | "auth_failure"
    | "webhook_delivered"
    | "webhook_failed"
    | "device_registered"
    | "device_removed";
  actor: {
    userId?: string;
    deviceId?: string;
    serviceId?: string;
  };
  resource: {
    type: string;
    id: string;
  };
  details?: Record<string, any>;
  result: "success" | "failure";
  ipAddress?: string;
}

/**
 * Load SKN config from environment variables
 * Pattern: AURA_<NAMESPACE>=<secret_value>
 */
export function loadSKNFromEnv(namespace: SecretKeyNamespace): SKNConfig | null {
  const envKey = `AURA_${namespace}`;
  const secret = process.env[envKey];

  if (!secret) {
    console.warn(`Missing secret for namespace: ${namespace}`);
    return null;
  }

  return {
    namespace,
    secret,
    autoRotate: process.env.SKN_AUTO_ROTATE === "true",
    rotationIntervalDays: parseInt(
      process.env.SKN_ROTATION_INTERVAL_DAYS || "90"
    ),
  };
}

/**
 * Get all loaded secrets from environment
 */
export function getAllSKNsFromEnv(): Record<SecretKeyNamespace, string> {
  const secrets: Record<string, string> = {};

  Object.values(SecretKeyNamespace).forEach((namespace) => {
    const envKey = `AURA_${namespace}`;
    if (process.env[envKey]) {
      secrets[namespace] = process.env[envKey]!;
    }
  });

  return secrets as Record<SecretKeyNamespace, string>;
}
