import CryptoJS from "crypto-js";

const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || "your-encryption-key-change-in-production";

/**
 * Encrypt text content
 */
export function encrypt(text: string): string {
  return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

/**
 * Decrypt encrypted content, return original if not encrypted
 */
export function decrypt(ciphertext: string): string {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
    const result = bytes.toString(CryptoJS.enc.Utf8);
    // If decryption result is empty, return original (it might not be encrypted)
    return result || ciphertext;
  } catch {
    // If decryption fails, return original (it might not be encrypted)
    return ciphertext;
  }
}

/**
 * Encrypt object to JSON string
 */
export function encryptObject(obj: Record<string, unknown>): string {
  return encrypt(JSON.stringify(obj));
}

/**
 * Decrypt JSON string to object, handle both encrypted and plain JSON
 */
export function decryptObject<T>(ciphertext: string): T | null {
  if (!ciphertext) return null;
  
  try {
    // Try to decrypt first
    const decrypted = decrypt(ciphertext);
    // If decrypted successfully and looks like JSON, parse it
    if (decrypted.startsWith('{') || decrypted.startsWith('[')) {
      return JSON.parse(decrypted) as T;
    }
    // If not JSON, it might be plain JSON string that wasn't encrypted
    return JSON.parse(ciphertext) as T;
  } catch {
    // If all parsing fails, return null
    return null;
  }
}
