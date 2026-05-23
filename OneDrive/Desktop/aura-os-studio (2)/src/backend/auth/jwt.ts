/**
 * JWT Authentication Module
 * Handles token generation, validation, and user context
 */

import jwt from "jsonwebtoken";
import crypto from "crypto";
import { Request, Response, NextFunction } from "express";

const JWT_SECRET = process.env.JWT_SECRET || crypto.randomBytes(32).toString("hex");
const JWT_EXPIRY = process.env.JWT_EXPIRY || "24h";
const REFRESH_TOKEN_EXPIRY = process.env.REFRESH_TOKEN_EXPIRY || "7d";

// User context attached to request
export interface AuthenticatedUser {
  userId: string;
  email: string;
  roles: string[];
  permissions: string[];
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      token?: string;
    }
  }
}

/**
 * Generate access token
 */
export function generateAccessToken(userId: string, email: string, roles: string[] = [], permissions: string[] = []): string {
  return jwt.sign(
    {
      userId,
      email,
      roles,
      permissions,
      type: "access",
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(userId: string): string {
  return jwt.sign(
    {
      userId,
      type: "refresh",
    },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
}

/**
 * Verify and decode token
 */
export function verifyToken(token: string): AuthenticatedUser | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== "access") {
      return null;
    }
    return decoded as AuthenticatedUser;
  } catch (error) {
    return null;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): { userId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type !== "refresh") {
      return null;
    }
    return { userId: decoded.userId };
  } catch (error) {
    return null;
  }
}

/**
 * Extract token from request (Bearer header or cookie)
 */
export function extractToken(req: Request): string | null {
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookies
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }

  return null;
}

/**
 * Middleware: Require authentication
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (!token) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Missing or invalid authentication token",
    });
  }

  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({
      error: "Unauthorized",
      message: "Invalid or expired token",
    });
  }

  req.user = user;
  req.token = token;
  next();
}

/**
 * Middleware: Optional authentication (attach user if present)
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const token = extractToken(req);

  if (token) {
    const user = verifyToken(token);
    if (user) {
      req.user = user;
      req.token = token;
    }
  }

  next();
}

/**
 * Middleware: Require specific role
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Required role(s): ${allowedRoles.join(", ")}`,
      });
    }

    next();
  };
}

/**
 * Middleware: Require specific permission
 */
export function requirePermission(...allowedPerms: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
    }

    const hasPerm = req.user.permissions.some((perm) => allowedPerms.includes(perm));
    if (!hasPerm) {
      return res.status(403).json({
        error: "Forbidden",
        message: `Required permission(s): ${allowedPerms.join(", ")}`,
      });
    }

    next();
  };
}
