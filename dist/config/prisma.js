"use strict";
/**
 * File: src/config/prisma.ts
 * Purpose: Create and expose a shared PrismaClient instance with the Prisma 7 PostgreSQL adapter.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectPrisma = disconnectPrisma;
const adapter_pg_1 = require("@prisma/adapter-pg");
const client_js_1 = require("../generated/prisma/client.js");
const index_1 = __importDefault(require("./index"));
const logger_1 = __importDefault(require("../utils/logger"));
/* Typed global cache for the PrismaClient instance. */
const globalForPrisma = globalThis;
if (!index_1.default.database.url) {
    throw new Error('Missing required environment variable: DATABASE_URL');
}
/* Create or reuse the singleton PrismaClient with environment-based logging. */
const prisma = globalForPrisma.prisma ??
    new client_js_1.PrismaClient({
        adapter: new adapter_pg_1.PrismaPg({ connectionString: index_1.default.database.url }),
        log: index_1.default.env === 'development'
            ? ['query', 'error', 'warn']
            : ['error'],
    });
/* Cache PrismaClient on globalThis only in development to avoid leaks. */
if (index_1.default.env !== 'production') {
    globalForPrisma.prisma = prisma;
}
/* Disconnect Prisma gracefully during shutdown. */
async function disconnectPrisma() {
    await prisma.$disconnect();
    logger_1.default.info('Prisma client disconnected from the database.');
}
exports.default = prisma;
//# sourceMappingURL=prisma.js.map