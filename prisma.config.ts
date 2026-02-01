import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Load .env file for local development
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Use DATABASE_URL from environment
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
