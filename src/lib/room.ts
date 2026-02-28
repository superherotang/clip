import { v4 as uuidv4 } from "uuid";

/**
 * Generate a unique room code for joining rooms
 */
export function generateRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const randomValues = new Uint8Array(6);
  crypto.getRandomValues(randomValues);
  
  for (let i = 0; i < 6; i++) {
    code += chars[randomValues[i] % chars.length];
  }
  
  return code;
}

/**
 * Generate a UUID
 */
export function generateUuid(): string {
  return uuidv4();
}
