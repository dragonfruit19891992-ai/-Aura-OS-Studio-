import { Request, Response, NextFunction } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import { SealMode, CompartmentPolicy, RequestTrace } from "./AirlockSchema";
import { BlackBox } from "./BlackBoxRecorder";
import { Runtime } from "./RuntimeManager";

/**
 * AirlockGateway
 * The single entry point for all compartment traffic.
 * Implements route sealing, fallback rendering, and threat scoring hooks.
 */
export function generateAuraFallbackHTML(title: string, message: string, source: string, compartmentId: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <style>
    body {
      background: #000;
      color: #fff;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      margin: 0;
      background-image: radial-gradient(circle at 50% 50%, rgba(30,30,50,0.5) 0%, #000 100%);
      overflow: hidden;
    }
    .container {
      background: rgba(20, 20, 25, 0.8);
      border: 1px solid rgba(255, 255, 255, 0.05);
      border-radius: 24px;
      padding: 48px;
      max-width: 480px;
      text-align: center;
      box-shadow: 0 20px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05);
      backdrop-filter: blur(20px);
    }
    .icon {
      font-size: 48px;
      margin-bottom: 24px;
      animation: float 6s ease-in-out infinite;
    }
    .title {
      font-size: 24px;
      font-weight: 600;
      margin: 0 0 16px;
      background: linear-gradient(135deg, #fff, #888);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .message {
      font-size: 14px;
      color: #888;
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(255,255,255,0.03);
      border: 1px solid rgba(255,255,255,0.05);
      border-radius: 99px;
      font-size: 11px;
      color: #666;
      font-family: monospace;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #f43f5e;
      box-shadow: 0 0 10px #f43f5e;
    }
    .dot.blue {
      background: #3b82f6;
      box-shadow: 0 0 10px #3b82f6;
    }
    @keyframes float {
      0%, 100% { transform: translateY(0); }
      50% { transform: translateY(-10px); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="icon">${title === 'No UI Interface' ? '🖥️' : '🛸'}</div>
    <h1 class="title">${title}</h1>
    <p class="message">${message}</p>
    <div class="badge">
      <div class="dot ${title === 'No UI Interface' ? 'blue' : ''}"></div>
      ${source}
    </div>
  </div>
</body>
</html>`;
}

export class AirlockGateway {
  // In-memory policy map for compartments
  private policies: Map<string, CompartmentPolicy> = new Map();

  constructor() {
    // We could initialize default policies from Governance Ledger here
  }

  public registerCompartment(compartmentId: string, allowedZones: string[]) {
    this.policies.set(compartmentId, {
      compartmentId,
      allowedZones,
      maxMemoryBytes: 500 * 1024 * 1024, // 500MB default
      maxRequestsPerMinute: 1000,
      currentSealMode: SealMode.OPEN,
    });
  }

  public getPolicy(compartmentId: string): CompartmentPolicy | undefined {
    return this.policies.get(compartmentId);
  }

  public sealCompartment(compartmentId: string, mode: SealMode, reason: string) {
    const policy = this.policies.get(compartmentId);
    if (!policy) return;

    const prevMode = policy.currentSealMode;
    policy.currentSealMode = mode;
    this.policies.set(compartmentId, policy);

    BlackBox.logRouteSeal(compartmentId, prevMode, mode, reason);
  }

  // Fallback Renderer
  private renderFallback(req: Request, res: Response, compartmentId: string, mode: SealMode) {
    const message = mode === SealMode.QUARANTINE 
      ? `Compartment [${compartmentId}] is in Quarantine Mode for inspection.`
      : mode === SealMode.SOFT_SEAL
      ? `Compartment [${compartmentId}] is Soft-Sealed. Traffic throttled.`
      : `Compartment [${compartmentId}] is currently Isolated for Recovery.`;

    if (req.accepts('html')) {
      return res.status(503).send(generateAuraFallbackHTML("Compartment Sealed", message, "Airlock Gateway", compartmentId));
    }

    res.status(503).json({
      error: "COMPARTMENT_SEALED",
      compartmentId,
      status: mode,
      message,
      action: "Please wait for AI Captain to resolve the isolation.",
    });
  }

  // The Express Middleware
  public middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const startMs = Date.now();
      
      // Extract compartment ID from route. Example: /api/gateway/phone-service/auth
      // If we are intercepting other routes, we need to map them to compartments.
      // For now, let's assume URL starts with /api/gateway/:compartmentId
      const match = req.path.match(/^\/api\/gateway\/([^\/]+)/);
      const compartmentId = match ? match[1] : "system";

      // If it's a known compartment, enforce policy
      let policy = this.policies.get(compartmentId);
      
      // Auto-register dynamically for testing if not found (in prod, strict deny)
      if (!policy && compartmentId !== "system") {
        this.registerCompartment(compartmentId, ["public"]);
        policy = this.policies.get(compartmentId);
      }

      if (policy) {
        // Enforce Read-Only Mode
        if (policy.currentSealMode === SealMode.READ_ONLY && req.method !== "GET") {
          BlackBox.logRequestTrace({
            traceId: `req_${Math.random().toString(36).substring(2)}`,
            timestamp: new Date().toISOString(),
            compartmentId,
            sourceIp: req.ip || "unknown",
            path: req.path,
            method: req.method,
            status: "DENIED",
            sealModeAtTimeOfRequest: policy.currentSealMode,
          });
          return this.renderFallback(req, res, compartmentId, policy.currentSealMode);
        }

        // Enforce Hard Seal
        if (policy.currentSealMode === SealMode.HARD_SEAL) {
          BlackBox.logRequestTrace({
            traceId: `req_${Math.random().toString(36).substring(2)}`,
            timestamp: new Date().toISOString(),
            compartmentId,
            sourceIp: req.ip || "unknown",
            path: req.path,
            method: req.method,
            status: "FALLBACK",
            sealModeAtTimeOfRequest: policy.currentSealMode,
          });
          return this.renderFallback(req, res, compartmentId, policy.currentSealMode);
        }
      }

      // If allowed and running in isolated runtime, proxy it
      const runtimeStatus = Runtime.getStatus(compartmentId);
      if (runtimeStatus && runtimeStatus.status === "RUNNING") {
        const proxy = createProxyMiddleware({
          target: `http://localhost:${runtimeStatus.port}`,
          changeOrigin: true,
          pathRewrite: {
            [`^/api/gateway/${compartmentId}`]: '', 
          },
          onProxyRes: (proxyRes, req, res) => {
            const executionTimeMs = Date.now() - startMs;
            BlackBox.logRequestTrace({
              traceId: `req_${Math.random().toString(36).substring(2)}`,
              timestamp: new Date().toISOString(),
              compartmentId,
              sourceIp: req.ip || "unknown",
              path: req.url || req.path,
              method: req.method || "GET",
              status: "ALLOWED",
              sealModeAtTimeOfRequest: policy?.currentSealMode || SealMode.OPEN,
              executionTimeMs,
            });
            if (proxyRes.statusCode && proxyRes.statusCode >= 500) {
               // ThreatScore drops
            }
          },
          onError: (err, req, res) => {
             BlackBox.logRecoveryEvent(compartmentId, `Proxy Error: ${err.message}`, false);
             if (!res.headersSent) {
            if (req.accepts('html')) {
             res.status(502).send(generateAuraFallbackHTML("Gateway Error", "Isolated Compartment is unreachable: " + err.message, "Airlock Gateway", compartmentId));
          } else {
             res.status(502).json({ error: "BAD_GATEWAY", message: "Isolated Compartment is unreachable." });
          }
             }
          }
        });
        
        // Return here because proxy middleware handles the response completely
        return proxy(req, res, next);
      } else {
        // If the route explicitly targeted the gateway but the compartment isn't running,
        // DO NOT fall through to Vite (which causes infinite iframe loops). 
        // Return 502 Bad Gateway.
        if (req.path.startsWith('/api/gateway/')) {
          if (req.accepts('html')) {
            return res.status(502).send(generateAuraFallbackHTML("Compartment Offline", `Compartment [${compartmentId}] is currently offline or still booting up.`, "Airlock Gateway", compartmentId));
          }
          return res.status(502).json({ 
            error: "COMPARTMENT_OFFLINE", 
            message: `Compartment [${compartmentId}] is not running or crashed.` 
          });
        }
      }

      // Capture response completion for tracing (if falling through to main Vite thread)
      res.on("finish", () => {
        const executionTimeMs = Date.now() - startMs;
        BlackBox.logRequestTrace({
          traceId: `req_${Math.random().toString(36).substring(2)}`,
          timestamp: new Date().toISOString(),
          compartmentId,
          sourceIp: req.ip || "unknown",
          path: req.path,
          method: req.method,
          status: "ALLOWED",
          sealModeAtTimeOfRequest: policy?.currentSealMode || SealMode.OPEN,
          executionTimeMs,
        });

        // Threat Scoring Hooks: If execution time is insane or error status returned, we can emit events here
        if (res.statusCode >= 500) {
           // Emitting an anomaly event (future AI Captain will catch this)
           // ThreatScore drops
        }
      });

      next();
    };
  }
}

export const Gateway = new AirlockGateway();
