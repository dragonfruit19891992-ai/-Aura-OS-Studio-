import fs from "fs";
import path from "path";
import { RequestTrace } from "./AirlockSchema";

/**
 * BlackBoxRecorder
 * An immutable append-only logging system for the Titanic Architecture.
 * Records route seals, policy violations, recovery events, and request traces.
 */
export class BlackBoxRecorder {
  private logDirectory: string;

  constructor(logDirectory: string = path.join(process.cwd(), ".george", "memory", "blackbox")) {
    this.logDirectory = logDirectory;
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, { recursive: true });
    }
  }

  private getLogFilePath(type: "traces" | "events" | "violations"): string {
    const date = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    return path.join(this.logDirectory, `${type}_${date}.log`);
  }

  private appendLog(type: "traces" | "events" | "violations", data: any) {
    const filePath = this.getLogFilePath(type);
    const logEntry = JSON.stringify({
      timestamp: new Date().toISOString(),
      ...data,
    }) + "\n";

    // Synchronous append for absolute guarantee (in a production setting we'd stream, but this is fine for OS core)
    fs.appendFileSync(filePath, logEntry, "utf-8");
  }

  public logRequestTrace(trace: RequestTrace) {
    this.appendLog("traces", trace);
  }

  public logRouteSeal(compartmentId: string, previousMode: string, newMode: string, reason: string) {
    this.appendLog("events", {
      event: "ROUTE_SEALED",
      compartmentId,
      previousMode,
      newMode,
      reason,
    });
  }

  public logPolicyViolation(compartmentId: string, requestedZone: string, token: string) {
    this.appendLog("violations", {
      event: "POLICY_VIOLATION",
      compartmentId,
      requestedZone,
      token,
      actionTaken: "HARD_SEAL",
    });
  }

  public logRecoveryEvent(compartmentId: string, action: string, success: boolean) {
    this.appendLog("events", {
      event: "RECOVERY_ACTION",
      compartmentId,
      action,
      success,
    });
  }
}

// Singleton instance for the backend
export const BlackBox = new BlackBoxRecorder();
