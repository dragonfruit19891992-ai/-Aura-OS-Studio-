/**
 * Authentication Service
 * Handles JWT, API keys, device auth, service tokens
 */

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import {
  JWTPayload,
  APIKey,
  ServiceToken,
  AuthContext,
  SessionToken,
  AuthAttempt,
  UserRole,
} from "../types/auth";
import { getAllSKNsFromEnv, SecretKeyNamespace } from "../types/skn";

// In-memory storage (replace with Firestore)
const apiKeys = new Map<string, APIKey>();
const serviceTokens = new Map<string, ServiceToken>();
const sessions = new Map<string, SessionToken>();
const authAttempts: AuthAttempt[] = [];

const JWT_SECRET =
  process.env.AURA_JWT_SIGNING ||
  "dev-secret-change-in-production";
const JWT_EXPIRY = "24h";

export class AuthService {
  /**
   * Generate JWT token
   */
  static generateJWT(payload: Omit<JWTPayload, "iat" | "exp">): string {
    try {
      return jwt.sign(payload, JWT_SECRET, {
        expiresIn: JWT_EXPIRY,
        algorithm: "HS256",
      });
    } catch (err) {
      throw new Error(`Failed to generate JWT: ${err}`);
    }
  }

  /**
   * Verify JWT token
   */
  static verifyJWT(token: string): JWTPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET, {
        algorithms: ["HS256"],
      }) as JWTPayload;

      return decoded;
    } catch (err) {
      console.error(`[AUTH] JWT verification failed:`, err);
      return null;
    }
  }

  /**
   * Create API key
   */
  static createAPIKey(
    ownerId: string,
    ownerType: "user" | "service" | "device",
    name: string,
    scope: string[] = ["read:webhooks"]
  ): APIKey {
    const id = uuidv4();
    const key = `aura_${uuidv4().replace(/-/g, "").substring(0, 32)}`;
    const keyHash = crypto.createHash("sha256").update(key).digest("hex");

    const apiKey: APIKey = {
      id,
      key: keyHash,
      keyPrefix: key.substring(0, 8),
      ownerId,
      ownerType,
      name,
      scope,
      active: true,
      createdAt: Date.now(),
      rateLimit: {
        requestsPerMinute: 60,
        requestsPerHour: 1000,
      },
    };

    apiKeys.set(id, apiKey);

    console.log(`[AUTH] Created API key: ${apiKey.keyPrefix}... for ${ownerId}`);

    // Return unhashed key only on creation
    return { ...apiKey, key };
  }

  /**
   * Verify API key
   */
  static verifyAPIKey(key: string): APIKey | null {
    const keyHash = crypto.createHash("sha256").update(key).digest("hex");

    for (const [_, apiKey] of apiKeys) {
      if (apiKey.active && crypto.timingSafeEqual(
        Buffer.from(apiKey.key),
        Buffer.from(keyHash)
      )) {
        apiKey.lastUsedAt = Date.now();
        return apiKey;
      }
    }

    return null;
  }

  /**
   * List API keys for owner
   */
  static listAPIKeys(ownerId: string): APIKey[] {
    return Array.from(apiKeys.values())
      .filter((k) => k.ownerId === ownerId)
      .map((k) => ({
        ...k,
        key: `${k.keyPrefix}...`,
      })); // Don't expose full key
  }

  /**
   * Revoke API key
   */
  static revokeAPIKey(keyId: string): boolean {
    const apiKey = apiKeys.get(keyId);
    if (!apiKey) return false;

    apiKey.active = false;
    apiKeys.set(keyId, apiKey);

    console.log(`[AUTH] Revoked API key: ${apiKey.keyPrefix}...`);

    return true;
  }

  /**
   * Create service token (for internal services)
   */
  static createServiceToken(
    service: string,
    trustedServices: string[] = []
  ): ServiceToken {
    const id = uuidv4();
    const token = uuidv4().replace(/-/g, "");
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 365 * 24 * 60 * 60 * 1000; // 1 year

    const serviceToken: ServiceToken = {
      id,
      service,
      token,
      issuedAt,
      expiresAt,
      scope: ["read:*", "write:*"],
      trustedServices,
    };

    serviceTokens.set(id, serviceToken);

    console.log(`[AUTH] Created service token for: ${service}`);

    return serviceToken;
  }

  /**
   * Verify service token
   */
  static verifyServiceToken(token: string): ServiceToken | null {
    for (const [_, sToken] of serviceTokens) {
      if (sToken.token === token && sToken.expiresAt > Date.now()) {
        return sToken;
      }
    }

    return null;
  }

  /**
   * Create session
   */
  static createSession(
    userId: string,
    deviceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): SessionToken {
    const sessionId = uuidv4();
    const now = Date.now();

    const session: SessionToken = {
      sessionId,
      userId,
      deviceId,
      issuedAt: now,
      expiresAt: now + 24 * 60 * 60 * 1000, // 24 hours
      lastActivityAt: now,
      ipAddress,
      userAgent,
      active: true,
    };

    sessions.set(sessionId, session);

    console.log(
      `[AUTH] Created session ${sessionId} for user ${userId}`
    );

    return session;
  }

  /**
   * Verify session
   */
  static verifySession(sessionId: string): SessionToken | null {
    const session = sessions.get(sessionId);

    if (!session || !session.active || session.expiresAt < Date.now()) {
      return null;
    }

    session.lastActivityAt = Date.now();
    return session;
  }

  /**
   * Revoke session
   */
  static revokeSession(sessionId: string): boolean {
    const session = sessions.get(sessionId);
    if (!session) return false;

    session.active = false;
    sessions.set(sessionId, session);

    return true;
  }

  /**
   * Record auth attempt for audit trail
   */
  static recordAuthAttempt(
    method: "jwt" | "api_key" | "device_cert" | "password" | "oauth",
    success: boolean,
    userId?: string,
    deviceId?: string,
    ipAddress?: string,
    reason?: string
  ): void {
    const attempt: AuthAttempt = {
      id: uuidv4(),
      timestamp: Date.now(),
      userId,
      deviceId,
      method,
      success,
      reason,
      ipAddress,
      userAgent: process.env.USER_AGENT,
    };

    authAttempts.push(attempt);

    const level = success ? "info" : "warn";
    console.log(
      `[AUTH] ${level.toUpperCase()} - ${method} auth ${
        success ? "success" : "failed"
      }: ${userId || deviceId || ipAddress}`
    );

    // Keep only last 10000 attempts
    if (authAttempts.length > 10000) {
      authAttempts.shift();
    }
  }

  /**
   * Get auth audit log
   */
  static getAuthLog(filter?: {
    userId?: string;
    deviceId?: string;
    success?: boolean;
    limit?: number;
  }): AuthAttempt[] {
    let results = [...authAttempts];

    if (filter?.userId) {
      results = results.filter((a) => a.userId === filter.userId);
    }

    if (filter?.deviceId) {
      results = results.filter((a) => a.deviceId === filter.deviceId);
    }

    if (filter?.success !== undefined) {
      results = results.filter((a) => a.success === filter.success);
    }

    if (filter?.limit) {
      results = results.slice(-filter.limit);
    }

    return results;
  }

  /**
   * Build auth context from token
   */
  static buildAuthContext(
    userId: string,
    role: UserRole,
    scope: string[]
  ): AuthContext {
    return {
      userId,
      role,
      scope,
      tokenType: "jwt",
      issuedAt: Date.now(),
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    };
  }

  /**
   * Get failed login attempts (for rate limiting)
   */
  static getFailedAttempts(
    userId: string,
    windowMinutes: number = 15
  ): number {
    const window = Date.now() - windowMinutes * 60 * 1000;

    return authAttempts.filter(
      (a) => a.userId === userId && !a.success && a.timestamp > window
    ).length;
  }

  /**
   * Check if user/device is locked due to too many failed attempts
   */
  static isLocked(userId: string, maxAttempts: number = 5): boolean {
    return this.getFailedAttempts(userId) >= maxAttempts;
  }
}

// Export helper to check JWT secret is configured
export function validateAuthConfig(): boolean {
  if (JWT_SECRET === "dev-secret-change-in-production") {
    console.warn(
      "[AUTH] ⚠️  Using development JWT secret. Set AURA_JWT_SIGNING in production!"
    );
    return false;
  }

  return true;
}
