import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get database path from environment or use default
const dbPath = process.env.DATABASE_URL || "file:/app/data/dev.db";

// Remove 'file:' prefix if present for libsql
const dbFilePath = dbPath.replace("file:", "");

// Ensure absolute path
const absolutePath = path.isAbsolute(dbFilePath) 
  ? dbFilePath 
  : path.join(process.cwd(), dbFilePath);

const adapter = new PrismaLibSql({
  url: `file:${absolutePath}`,
});

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
