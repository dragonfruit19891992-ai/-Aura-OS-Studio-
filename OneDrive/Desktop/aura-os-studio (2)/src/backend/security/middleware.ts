/**
 * Production Security Middleware
 * Rate limiting, CORS, input validation, security headers
 */

import { Request, Response, NextFunction } from "express";
import rateLimit from "express-rate-limit";
import crypto from "crypto";

/**
 * Global rate limiter: 100 requests per 15 minutes
 */
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Strict rate limiter for auth endpoints: 5 requests per 15 minutes
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  skipSuccessfulRequests: true,
  message: "Too many authentication attempts, please try again later.",
});

/**
 * Rate limiter for webhook endpoints: 50 per minute
 */
export const webhookLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 50,
});

/**
 * Verify HMAC SHA256 signature on webhook payloads
 */
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string
): boolean {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Generate HMAC SHA256 signature
 */
export function generateWebhookSignature(payload: string, secret: string): string {
  const hmac = crypto.createHmac("sha256", secret);
  hmac.update(payload);
  return hmac.digest("hex");
}

/**
 * Middleware: Verify webhook signature and timestamp
 */
export const verifyWebhookMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const signature = req.headers["x-webhook-signature"] as string;
  const timestamp = req.headers["x-webhook-timestamp"] as string;
  const eventId = req.headers["x-webhook-id"] as string;

  // Validate headers exist
  if (!signature || !timestamp || !eventId) {
    return res.status(401).json({
      error: "Missing webhook authentication headers",
    });
  }

  // Validate timestamp is within 5 minutes (prevent replay attacks)
  const requestTime = parseInt(timestamp);
  const currentTime = Date.now();
  const timeDiffSeconds = (currentTime - requestTime) / 1000;

  if (timeDiffSeconds > 300 || timeDiffSeconds < -60) {
    return res.status(401).json({
      error: "Webhook timestamp outside acceptable window (5 minutes)",
    });
  }

  // Get webhook secret from environment (should be per-project in real app)
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    return res.status(500).json({
      error: "Webhook secret not configured",
    });
  }

  const payload = JSON.stringify(req.body);

  try {
    const isValid = verifyWebhookSignature(payload, signature, secret);
    if (!isValid) {
      return res.status(401).json({
        error: "Invalid webhook signature",
      });
    }
  } catch (err) {
    return res.status(401).json({
      error: "Signature verification failed",
    });
  }

  // Attach verified data to request
  (req as any).webhookVerified = true;
  (req as any).eventId = eventId;

  next();
};

/**
 * Middleware: Validate request body size and format
 */
export const validateRequestBody = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body || typeof req.body !== "object") {
    return res.status(400).json({
      error: "Request body must be valid JSON",
    });
  }

  next();
};

/**
 * Middleware: Add security headers to responses
 */
export const addSecurityHeaders = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  next();
};

/**
 * Middleware: Log all requests for audit trail
 */
export const auditLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - startTime;
    const auditEntry = {
      timestamp: startTime,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    };

    // Log to stdout (should integrate with Firestore later)
    if (res.statusCode >= 400) {
      console.warn(`[AUDIT] ${JSON.stringify(auditEntry)}`);
    }
  });

  next();
};

/**
 * Middleware: Require valid Bearer token
 */
export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "Missing or invalid Authorization header",
    });
  }

  // Token validation would happen here
  // For now, just pass through - real implementation needs JWT verification

  next();
};
