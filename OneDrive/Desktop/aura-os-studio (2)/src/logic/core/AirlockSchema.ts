export enum SealMode {
  OPEN = "OPEN",
  SOFT_SEAL = "SOFT_SEAL", // Traffic throttled, slow responses
  HARD_SEAL = "HARD_SEAL", // Route completely blocked, fast 503 fallback
  QUARANTINE = "QUARANTINE", // Route active but heavily monitored, responses inspected
  READ_ONLY = "READ_ONLY" // POST/PUT/DELETE blocked, GET allowed
}

export interface CompartmentHealth {
  cpuUsage: number;
  memoryUsage: number;
  errorRate: number;
  threatScore: number; // 0 to 100 (100 = healthy, 0 = isolate)
}

export interface RequestTrace {
  traceId: string;
  timestamp: string;
  compartmentId: string;
  sourceIp: string;
  path: string;
  method: string;
  capabilityToken?: string;
  status: "ALLOWED" | "DENIED" | "THROTTLED" | "FALLBACK";
  sealModeAtTimeOfRequest: SealMode;
  executionTimeMs?: number;
}

export interface CompartmentPolicy {
  compartmentId: string;
  allowedZones: string[];
  maxMemoryBytes: number;
  maxRequestsPerMinute: number;
  currentSealMode: SealMode;
}
