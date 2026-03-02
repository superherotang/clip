import "dotenv/config";
import { defineConfig } from "prisma/config";
import path from "path";

// Use absolute path for database
const dbPath = process.env.DATABASE_URL 
  ? process.env.DATABASE_URL.replace("file:", "")
  : path.join(process.cwd(), "prisma", "dev.db");

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: `file:${dbPath}`,
  },
});
