/**
 * File: prisma/seed.ts
 * Purpose: Entry point for all database seed functions.
 * Add new seed functions in prisma/seed/ and register them in main().
 */

import 'dotenv/config';
import prisma from '../src/config/prisma';
import { seedAdmin } from './seed/admin.seed';

/* ─── Main ──────────────────────────────────────────────────────────────── */
async function main() {
  await seedAdmin();
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
