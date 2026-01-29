import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Vercel injects DATABASE_URL at runtime, use it directly
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
