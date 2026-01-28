import { defineConfig } from "prisma/config";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // Use the environment variable now that dotenv has loaded it
  datasource: {
    url: process.env.DATABASE_URL || "mysql://u448110646_ars_admin:ARS_group_dashboard_Pass_2025@srv992.hstgr.io:3306/u448110646_ars_group",
  },
});
