const { PrismaClient } = require('@prisma/client');
const { PrismaLibSql } = require('@prisma/adapter-libsql');

const dbUrl = process.env.DATABASE_URL || 'file:/app/data/dev.db';
const adapter = new PrismaLibSql({ url: dbUrl });
const prisma = new PrismaClient({ adapter });

async function initDatabase() {
  console.log('Initializing database schema...');
  
  try {
    // Create tables
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "username" TEXT UNIQUE NOT NULL,
        "password" TEXT NOT NULL,
        "apiKey" TEXT UNIQUE NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'user',
        "isActive" BOOLEAN NOT NULL DEFAULT 1,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL
      )
    `);
    console.log('✓ User table created');
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "Room" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "code" TEXT UNIQUE NOT NULL,
        "ownerId" TEXT NOT NULL,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);
    console.log('✓ Room table created');
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "RoomMember" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "roomId" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'member',
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
        UNIQUE("userId", "roomId")
      )
    `);
    console.log('✓ RoomMember table created');
    
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ClipboardItem" (
        "id" TEXT PRIMARY KEY,
        "roomId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "type" TEXT NOT NULL,
        "content" TEXT NOT NULL,
        "title" TEXT,
        "category" TEXT,
        "meta" TEXT,
        "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" DATETIME NOT NULL,
        FOREIGN KEY ("roomId") REFERENCES "Room"("id") ON DELETE CASCADE,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      )
    `);
    console.log('✓ ClipboardItem table created');

    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "SystemSettings" (
        "id" TEXT PRIMARY KEY,
        "allowRegistration" BOOLEAN NOT NULL DEFAULT 1,
        "siteName" TEXT NOT NULL DEFAULT 'Clipboard',
        "siteDescription" TEXT,
        "maxRoomsPerUser" INTEGER NOT NULL DEFAULT 10,
        "maxClipboardItems" INTEGER NOT NULL DEFAULT 100,
        "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✓ SystemSettings table created');

    // Initialize default system settings
    await prisma.$executeRawUnsafe(`
      INSERT OR IGNORE INTO "SystemSettings" ("id", "allowRegistration", "siteName", "maxRoomsPerUser", "maxClipboardItems")
      VALUES ('site', 1, 'Clipboard', 10, 100)
    `);
    console.log('✓ Default system settings initialized');

    console.log('Database initialized successfully!');
  } catch (error) {
    console.error('Error initializing database:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

initDatabase();
