/**
 * Authentication & Authorization Types
 * JWT, API Keys, Service Tokens, Device Auth
 */

export type AuthTokenType = "jwt" | "api_key" | "device_cert" | "service_token";
export type UserRole = "admin" | "developer" | "service" | "device" | "user";

export interface JWTPayload {
  sub: string; // subject (user/service/device ID)
  iat: number; // issued at
  exp: number; // expires at
  iss: string; // issuer
  aud: string; // audience
  role: UserRole;
  scope: string[];
  metadata?: Record<string, any>;
}

export interface APIKey {
  id: string;
  key: string; // hashed
  keyPrefix: string; // first 8 chars for identification
  ownerId: string;
  ownerType: "user" | "service" | "device";
  name: string;
  scope: string[];
  active: boolean;
  createdAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
  rateLimit?: {
    requestsPerMinute: number;
    requestsPerHour: number;
  };
  metadata?: Record<string, any>;
}

export interface ServiceToken {
  id: string;
  service: string;
  token: string;
  issuedAt: number;
  expiresAt: number;
  scope: string[];
  trustedServices: string[];
}

export interface AuthContext {
  userId?: string;
  deviceId?: string;
  serviceId?: string;
  role: UserRole;
  scope: string[];
  tokenType: AuthTokenType;
  issuedAt: number;
  expiresAt: number;
}

export interface SessionToken {
  sessionId: string;
  userId: string;
  deviceId?: string;
  issuedAt: number;
  expiresAt: number;
  lastActivityAt: number;
  ipAddress?: string;
  userAgent?: string;
  active: boolean;
  metadata?: Record<string, any>;
}

export interface AuthAttempt {
  id: string;
  timestamp: number;
  userId?: string;
  deviceId?: string;
  method: "jwt" | "api_key" | "device_cert" | "password" | "oauth";
  success: boolean;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const AUTH_SCOPES = [
  "read:webhooks",
  "write:webhooks",
  "read:devices",
  "write:devices",
  "read:events",
  "write:events",
  "read:calls",
  "write:calls",
  "read:audit_logs",
  "write:audit_logs",
  "admin:settings",
] as const;
