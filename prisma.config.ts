import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  // We hardcode the URL here to bypass the "Missing environment variable" error
  datasource: {
    url: "mysql://u448110646_ars_admin:v5jL>3JG;Hl~J58c!OFS@srv992.hstgr.io:3306/u448110646_ars_group",
  },
});
