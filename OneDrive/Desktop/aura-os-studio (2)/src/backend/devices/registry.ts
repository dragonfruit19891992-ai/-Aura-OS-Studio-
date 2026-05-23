/**
 * Device Identity Registry
 * Manages device registration, trust chain, and cryptographic identity
 */

import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";
import {
  DeviceIdentity,
  DeviceRegistrationRequest,
  DeviceAuthToken,
  DeviceCapability,
  TrustChain,
  RotatingCredential,
  DeviceHealthCheck,
} from "../types/device";

// In-memory storage (replace with Firestore)
const devices = new Map<string, DeviceIdentity>();
const authTokens = new Map<string, DeviceAuthToken>();
const trustChains = new Map<string, TrustChain>();
const healthChecks = new Map<string, DeviceHealthCheck>();

export class DeviceRegistry {
  /**
   * Register a new device
   */
  static registerDevice(request: DeviceRegistrationRequest): DeviceIdentity {
    const deviceId = uuidv4();
    const privateKeyHash = crypto
      .createHash("sha256")
      .update(request.publicKey)
      .digest("hex");

    const device: DeviceIdentity = {
      id: deviceId,
      deviceType: request.deviceType as any,
      publicKey: request.publicKey,
      privateKeyThumbprint: privateKeyHash,
      macAddress: request.macAddress,
      serialNumber: request.serialNumber,
      firmwareVersion: request.firmwareVersion,
      trustLevel: "unverified",
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      metadata: request.metadata,
    };

    devices.set(deviceId, device);

    console.log(`[DEVICE] Registered device: ${deviceId} (${request.deviceType})`);

    return device;
  }

  /**
   * Get device by ID
   */
  static getDevice(deviceId: string): DeviceIdentity | undefined {
    return devices.get(deviceId);
  }

  /**
   * Get device by MAC address
   */
  static getDeviceByMac(macAddress: string): DeviceIdentity | undefined {
    return Array.from(devices.values()).find((d) => d.macAddress === macAddress);
  }

  /**
   * List all devices
   */
  static listDevices(filter?: {
    trustLevel?: string;
    deviceType?: string;
  }): DeviceIdentity[] {
    let results = Array.from(devices.values());

    if (filter?.trustLevel) {
      results = results.filter((d) => d.trustLevel === filter.trustLevel);
    }

    if (filter?.deviceType) {
      results = results.filter((d) => d.deviceType === filter.deviceType);
    }

    return results;
  }

  /**
   * Update device trust level
   */
  static updateTrustLevel(
    deviceId: string,
    trustLevel: "unverified" | "verified" | "trusted" | "restricted"
  ): DeviceIdentity | undefined {
    const device = devices.get(deviceId);
    if (!device) return undefined;

    device.trustLevel = trustLevel;
    device.lastSeenAt = Date.now();
    devices.set(deviceId, device);

    return device;
  }

  /**
   * Issue device auth token
   */
  static issueAuthToken(
    deviceId: string,
    scope: string[] = ["read:webhooks", "write:events"]
  ): DeviceAuthToken {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    const tokenId = uuidv4();
    const issuedAt = Date.now();
    const expiresAt = issuedAt + 24 * 60 * 60 * 1000; // 24 hours

    const token: DeviceAuthToken = {
      token: tokenId,
      type: "device_certificate",
      deviceId,
      issuedAt,
      expiresAt,
      scope,
      rotationSchedule: "monthly",
    };

    authTokens.set(tokenId, token);

    return token;
  }

  /**
   * Verify device token
   */
  static verifyAuthToken(token: string): DeviceAuthToken | null {
    const authToken = authTokens.get(token);

    if (!authToken) {
      return null;
    }

    if (authToken.expiresAt < Date.now()) {
      console.log(`[AUTH] Token expired: ${token}`);
      return null;
    }

    return authToken;
  }

  /**
   * Create trust chain for device
   */
  static createTrustChain(
    deviceId: string,
    certificateChain: string[],
    issuer: string
  ): TrustChain {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    const trustChain: TrustChain = {
      deviceId,
      certificateChain,
      signedAt: Date.now(),
      expiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      issuer,
    };

    trustChains.set(deviceId, trustChain);

    console.log(`[TRUST] Created trust chain for device: ${deviceId}`);

    return trustChain;
  }

  /**
   * Verify trust chain
   */
  static verifyTrustChain(deviceId: string): boolean {
    const trustChain = trustChains.get(deviceId);

    if (!trustChain) {
      return false;
    }

    if (trustChain.expiresAt < Date.now()) {
      console.log(`[TRUST] Trust chain expired for device: ${deviceId}`);
      return false;
    }

    return true;
  }

  /**
   * Record device health check
   */
  static recordHealthCheck(check: DeviceHealthCheck): void {
    healthChecks.set(check.deviceId, check);

    const device = this.getDevice(check.deviceId);
    if (device) {
      device.lastSeenAt = check.timestamp;
      devices.set(check.deviceId, device);
    }
  }

  /**
   * Get device health
   */
  static getDeviceHealth(deviceId: string): DeviceHealthCheck | undefined {
    return healthChecks.get(deviceId);
  }

  /**
   * Get health for all devices
   */
  static getAllDeviceHealth(): DeviceHealthCheck[] {
    return Array.from(healthChecks.values());
  }

  /**
   * Rotate device credentials
   */
  static rotateDeviceCredentials(deviceId: string): RotatingCredential {
    const device = this.getDevice(deviceId);
    if (!device) {
      throw new Error("Device not found");
    }

    const newSecret = uuidv4().replace(/-/g, "");
    const credential: RotatingCredential = {
      secret: newSecret,
      rotatedAt: Date.now(),
      expiresAt: Date.now() + 90 * 24 * 60 * 60 * 1000, // 90 days
      nextRotationTime: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
      isActive: true,
      previousHash: device.privateKeyThumbprint,
    };

    return credential;
  }

  /**
   * Get devices by owner
   */
  static getDevicesByOwner(ownerId: string): DeviceIdentity[] {
    return Array.from(devices.values()).filter(
      (d) => d.metadata?.owner === ownerId
    );
  }

  /**
   * Deregister device
   */
  static deregisterDevice(deviceId: string): boolean {
    const removed = devices.delete(deviceId);
    trustChains.delete(deviceId);
    healthChecks.delete(deviceId);

    if (removed) {
      console.log(`[DEVICE] Deregistered device: ${deviceId}`);
    }

    return removed;
  }
}
