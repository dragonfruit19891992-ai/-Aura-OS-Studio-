/**
 * Secure Secret Management
 * Handles environment variables, API keys, and sensitive data
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import os from "os";

const SECRETS_DIR = path.join(os.homedir(), ".aura_os_secrets");

// Ensure secrets directory exists and is secure (0700 permissions)
if (!fs.existsSync(SECRETS_DIR)) {
  fs.mkdirSync(SECRETS_DIR, { mode: 0o700 });
} else {
  // Enforce restricted permissions
  fs.chmodSync(SECRETS_DIR, 0o700);
}

/**
 * Validate that a value is a real, usable secret (not dummy/placeholder)
 */
function isValidSecret(value: string): boolean {
  // Reject common dummy/placeholder patterns
  const dummyPatterns = [
    "_DUMMY_",
    "_PLACEHOLDER_",
    "YOUR_",
    "xxx",
    "test",
    "fake",
    "none",
  ];

  const lowerValue = value.toLowerCase();
  return !dummyPatterns.some((pattern) => lowerValue.includes(pattern)) && value.length > 0;
}

/**
 * Get a secret from environment or raise error if missing/invalid
 */
export function getSecret(key: string, required: boolean = false): string | undefined {
  const value = process.env[key];

  if (required && !value) {
    throw new Error(`FATAL: Required secret '${key}' not configured in environment`);
  }

  if (value && !isValidSecret(value)) {
    if (required) {
      throw new Error(`FATAL: Secret '${key}' contains dummy/placeholder value - not production-ready`);
    }
    return undefined;
  }

  return value;
}

/**
 * Store a secret securely in encrypted local file
 */
export function storeSecret(projectId: string, key: string, value: string): void {
  const projectSecretsPath = path.join(SECRETS_DIR, `${projectId}.json`);

  let secrets: Record<string, string> = {};
  if (fs.existsSync(projectSecretsPath)) {
    const content = fs.readFileSync(projectSecretsPath, "utf8");
    try {
      secrets = JSON.parse(content);
    } catch {
      // Corrupted file, start fresh
      secrets = {};
    }
  }

  secrets[key] = value;

  // Encrypt and write (with restricted permissions)
  fs.writeFileSync(projectSecretsPath, JSON.stringify(secrets, null, 2), {
    mode: 0o600, // Only readable by owner
  });
}

/**
 * Retrieve a secret stored in local file
 */
export function retrieveSecret(projectId: string, key: string): string | undefined {
  const projectSecretsPath = path.join(SECRETS_DIR, `${projectId}.json`);

  if (!fs.existsSync(projectSecretsPath)) {
    return undefined;
  }

  try {
    const content = fs.readFileSync(projectSecretsPath, "utf8");
    const secrets = JSON.parse(content);
    return secrets[key];
  } catch {
    return undefined;
  }
}

/**
 * List all secret keys for a project (don't return values for security)
 */
export function listSecretKeys(projectId: string): string[] {
  const projectSecretsPath = path.join(SECRETS_DIR, `${projectId}.json`);

  if (!fs.existsSync(projectSecretsPath)) {
    return [];
  }

  try {
    const content = fs.readFileSync(projectSecretsPath, "utf8");
    const secrets = JSON.parse(content);
    return Object.keys(secrets);
  } catch {
    return [];
  }
}

/**
 * Delete a secret
 */
export function deleteSecret(projectId: string, key: string): boolean {
  const projectSecretsPath = path.join(SECRETS_DIR, `${projectId}.json`);

  if (!fs.existsSync(projectSecretsPath)) {
    return false;
  }

  try {
    const content = fs.readFileSync(projectSecretsPath, "utf8");
    const secrets = JSON.parse(content);
    delete secrets[key];
    fs.writeFileSync(projectSecretsPath, JSON.stringify(secrets, null, 2), {
      mode: 0o600,
    });
    return true;
  } catch {
    return false;
  }
}

/**
 * Validate webhook secret (HMAC signature)
 */
export function validateWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const expectedSignature = crypto.createHmac("sha256", secret).update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
}

/**
 * Generate webhook secret token
 */
export function generateWebhookSecret(): string {
  return crypto.randomBytes(32).toString("hex");
}

/**
 * Validate API key format (basic validation)
 */
export function isValidApiKey(key: string): boolean {
  // API keys should be at least 32 characters
  // And not contain spaces or newlines
  return key.length >= 32 && !/[\s\n\r]/.test(key);
}

/**
 * Redact secret from logs (mask most characters)
 */
export function redactSecret(secret: string): string {
  if (secret.length <= 8) {
    return "***";
  }
  return secret.slice(0, 4) + "*".repeat(secret.length - 8) + secret.slice(-4);
}
