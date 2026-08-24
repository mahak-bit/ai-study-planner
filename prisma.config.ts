import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// The CLI (migrate/introspect/studio) uses the direct, unpooled connection —
// migrations need a stable connection, unlike the app's pooled runtime client
// in src/lib/db/prisma.ts, which connects via the Neon driver adapter instead.
export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env['DIRECT_URL'],
  },
});
