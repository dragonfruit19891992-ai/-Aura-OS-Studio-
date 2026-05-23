import { Worker } from "worker_threads";
import path from "path";
import { EventEmitter } from "events";
import { BlackBox } from "./BlackBoxRecorder";

export interface CompartmentStatus {
  id: string;
  port: number;
  status: "STARTING" | "RUNNING" | "CRASHED" | "STOPPED";
  memoryUsageMb: number;
}

/**
 * RuntimeManager
 * Phase 2: Service Isolation.
 * Spawns isolated worker threads for each compartment to physically separate 
 * memory, prevent shared flood channels, and prevent main thread crashing.
 */
export class RuntimeManager extends EventEmitter {
  private workers: Map<string, Worker> = new Map();
  private statuses: Map<string, CompartmentStatus> = new Map();
  private basePort = 10000;

  constructor() {
    super();
  }

  public getStatus(compartmentId: string): CompartmentStatus | undefined {
    return this.statuses.get(compartmentId);
  }

  public async startCompartment(compartmentId: string, zipsDir: string): Promise<number> {
    if (this.workers.has(compartmentId)) {
      return this.statuses.get(compartmentId)!.port;
    }

    const port = this.basePort++;
    this.statuses.set(compartmentId, {
      id: compartmentId,
      port,
      status: "STARTING",
      memoryUsageMb: 0,
    });

    const workerPath = path.join(process.cwd(), "src/logic/core/CompartmentWorker.js");

    return new Promise((resolve, reject) => {
      const worker = new Worker(workerPath, {
        workerData: { compartmentId, port, zipsDir }
      });

      worker.on("message", (msg) => {
        if (msg.type === "STARTED") {
          const status = this.statuses.get(compartmentId)!;
          status.status = "RUNNING";
          this.workers.set(compartmentId, worker);
          resolve(port);
        } else if (msg.type === "TELEMETRY") {
          const status = this.statuses.get(compartmentId)!;
          status.memoryUsageMb = msg.memory;
          this.emit("telemetry", compartmentId, msg.memory);
        } else if (msg.type === "CRASH") {
          this.handleCrash(compartmentId, msg.error);
        }
      });

      worker.on("error", (err) => {
        this.handleCrash(compartmentId, err.message);
        reject(err);
      });

      worker.on("exit", (code) => {
        if (code !== 0) {
          this.handleCrash(compartmentId, `Exited with code ${code}`);
        }
      });
    });
  }

  private handleCrash(compartmentId: string, error: string) {
    BlackBox.logRecoveryEvent(compartmentId, `Process Crashed: ${error}`, false);
    const status = this.statuses.get(compartmentId);
    if (status) {
      status.status = "CRASHED";
      this.statuses.set(compartmentId, status);
    }
    this.workers.delete(compartmentId);
    this.emit("crash", compartmentId, error);
  }

  public stopCompartment(compartmentId: string) {
    const worker = this.workers.get(compartmentId);
    if (worker) {
      worker.terminate();
      this.workers.delete(compartmentId);
      const status = this.statuses.get(compartmentId);
      if (status) {
        status.status = "STOPPED";
      }
    }
  }
}

export const Runtime = new RuntimeManager();
