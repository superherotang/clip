import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./prisma";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "your-secret-key-change-in-production"
);

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export async function generateApiKey(): Promise<string> {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export interface Session {
  userId: string;
  username: string;
  email: string;
  role: string;
}

export async function createSession(user: {
  id: string;
  username: string;
  email: string;
  role: string;
}): Promise<string> {
  const token = await new SignJWT({
    userId: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);

  return token;
}

export async function getSession(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("session")?.value;

    console.log("[getSession] Token exists:", !!token);

    if (!token) return null;

    const { payload } = await jwtVerify(token, JWT_SECRET);
    const session = {
      userId: (payload as any).userId,
      username: (payload as any).username,
      email: (payload as any).email || "",
      role: (payload as any).role || "user",
    };

    console.log("[getSession] Session:", { userId: session.userId, username: session.username, role: session.role });

    return session;
  } catch (error) {
    console.error("[getSession] Error:", error);
    return null;
  }
}

export async function validateApiKey(apiKey: string): Promise<Session | null> {
  try {
    const user = await prisma.user.findUnique({
      where: { apiKey },
      select: { id: true, username: true, role: true },
    });

    if (!user) return null;

    return {
      userId: user.id,
      username: user.username,
      email: "",
      role: user.role,
    };
  } catch {
    return null;
  }
}

export async function requireAuth(): Promise<Session> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }
  return session;
}

export async function requireAdmin(session?: Session): Promise<Session> {
  const currentSession = session || await getSession();
  if (!currentSession || currentSession.role !== "admin") {
    throw new Error("Admin access required");
  }

  // Verify user is still active and admin in database
  const user = await prisma.user.findUnique({
    where: { id: currentSession.userId },
    select: { role: true, isActive: true }
  });

  if (!user || !user.isActive || user.role !== "admin") {
    throw new Error("Admin access required");
  }

  return currentSession;
}

export interface SystemSettings {
  allowRegistration: boolean;
  siteName: string;
  siteDescription: string | null;
  maxRoomsPerUser: number;
  maxClipboardItems: number;
}

export async function getSystemSettings(): Promise<SystemSettings> {
  try {
    let settings = await prisma.systemSettings.findUnique({
      where: { id: "site" }
    });

    if (!settings) {
      settings = await prisma.systemSettings.create({
        data: { id: "site" }
      });
    }

    return {
      allowRegistration: settings.allowRegistration,
      siteName: settings.siteName,
      siteDescription: settings.siteDescription,
      maxRoomsPerUser: settings.maxRoomsPerUser,
      maxClipboardItems: settings.maxClipboardItems,
    };
  } catch (error) {
    // If table doesn't exist or database error, return defaults
    console.error('Error getting system settings:', error);
    return {
      allowRegistration: true,
      siteName: "Clipboard",
      siteDescription: null,
      maxRoomsPerUser: 10,
      maxClipboardItems: 100,
    };
  }
}
