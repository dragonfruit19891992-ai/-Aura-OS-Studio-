/**
 * Device Identity & Registration Types
 * For SIM-less distributed device ecosystem
 */

export type DeviceAuthType = "api_key" | "device_certificate" | "jwt" | "service_token";

export interface DeviceIdentity {
  id: string; // UUID
  deviceType:
    | "phone_dock"
    | "portal"
    | "smartphone"
    | "headphones"
    | "smartwatch"
    | "drone"
    | "mirror"
    | "speaker"
    | "tv"
    | "vehicle"
    | "wearable"
    | "iot_device"
    | "beacon_node"
    | "carrier_node";
  publicKey: string; // PEM format
  privateKeyThumbprint: string; // SHA256 of private key
  macAddress: string;
  serialNumber: string;
  firmwareVersion: string;
  trustLevel: "unverified" | "verified" | "trusted" | "restricted";
  createdAt: number;
  lastSeenAt: number;
  metadata?: {
    nickname?: string;
    location?: string;
    owner?: string;
    tags?: string[];
  };
}

export interface DeviceAuthToken {
  token: string;
  type: DeviceAuthType;
  deviceId: string;
  issuedAt: number;
  expiresAt: number;
  scope: string[]; // permissions
  rotationSchedule?: "weekly" | "monthly" | "quarterly";
  previousTokenThumbprints?: string[];
}

export interface DeviceCapability {
  voiceInput: boolean;
  voiceOutput: boolean;
  camera: boolean;
  microphone: boolean;
  screen: boolean;
  haptic: boolean;
  thermal: boolean;
  depthSensing: boolean;
  gps: boolean;
  offlineMode: boolean;
  encryption: "none" | "tls" | "e2e";
  meshRelay: boolean;
}

export interface DeviceRegistrationRequest {
  deviceType: string;
  publicKey: string;
  macAddress: string;
  serialNumber: string;
  firmwareVersion: string;
  capabilities: DeviceCapability;
  metadata?: Record<string, any>;
}

export interface TrustChain {
  deviceId: string;
  certificateChain: string[];
  signedAt: number;
  expiresAt: number;
  issuer: string;
  metadata?: Record<string, any>;
}

export interface RotatingCredential {
  secret: string;
  rotatedAt: number;
  expiresAt: number;
  nextRotationTime: number;
  isActive: boolean;
  previousHash?: string;
}

export interface DeviceHealthCheck {
  deviceId: string;
  timestamp: number;
  status: "online" | "offline" | "degraded" | "unreachable";
  lastPingMs: number;
  signalStrength?: number; // 0-100
  batteryLevel?: number; // 0-100
  memoryUsage?: number; // bytes
  cpuUsage?: number; // 0-100
  networkLatency?: number; // ms
  errorCount?: number;
}
