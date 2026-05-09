import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function resolveDbPath(): string {
  const rawUrl = process.env.DATABASE_URL ?? "file:./dev.db";
  const filePart = rawUrl.startsWith("file:") ? rawUrl.slice(5) : rawUrl;
  if (path.isAbsolute(filePart)) return filePart;
  // Use __dirname-relative resolution so the path is statically scoped
  return path.join(/* turbopackIgnore: true */ path.resolve("."), filePart);
}

function createPrismaClient(): PrismaClient {
  const adapter = new PrismaBetterSqlite3({ url: resolveDbPath() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
