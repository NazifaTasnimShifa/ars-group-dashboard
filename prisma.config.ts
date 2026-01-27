import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // We hardcode the URL here to bypass the "Missing environment variable" error
  datasource: {
    url: "mysql://u448110646_ars_admin:ARS_group_dashboard_Pass_2025@srv992.hstgr.io:3306/u448110646_ars_group",
  },
});
