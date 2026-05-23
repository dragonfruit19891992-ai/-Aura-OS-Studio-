/**
 * VaultCrypt
 * The Base64 Auto-Patching System
 * Encrypts and decrypts the raw code input to ensure it is not stored as plain text.
 */

export class VaultCrypt {
  /**
   * Encodes a string (code) to Base64 to prevent raw code from sitting in plain text
   * inside the database or local storage. In a full production system, this could be upgraded
   * to true AES-GCM encryption.
   */
  public static encode(rawString: string): string {
    if (typeof window !== 'undefined') {
      // Browser environment
      return btoa(unescape(encodeURIComponent(rawString)));
    } else {
      // Node.js environment
      return Buffer.from(rawString).toString('base64');
    }
  }

  /**
   * Decodes the Base64 string back to raw text.
   */
  public static decode(encodedString: string): string {
    try {
      if (typeof window !== 'undefined') {
        // Browser environment
        return decodeURIComponent(escape(atob(encodedString)));
      } else {
        // Node.js environment
        return Buffer.from(encodedString, 'base64').toString('utf8');
      }
    } catch (e) {
      console.warn("VaultCrypt: Failed to decode string, returning raw.");
      return encodedString; // fallback if already decoded or corrupted
    }
  }
}
