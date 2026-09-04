import { Pool as PgPool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPoolInstance: PgPool | undefined;
  // eslint-disable-next-line no-var
  var __pgPoolUrl: string | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "";
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL environment variable is missing or empty. Please set DATABASE_URL in your .env file."
    );
  }

  if (!globalThis.__pgPoolInstance || globalThis.__pgPoolUrl !== connectionString) {
    if (globalThis.__pgPoolInstance) {
      globalThis.__pgPoolInstance.end().catch(() => {});
    }
    const pool = new PgPool({ connectionString });
    pool.setMaxListeners(50);
    globalThis.__pgPoolInstance = pool;
    globalThis.__pgPoolUrl = connectionString;
  }
  const adapter = new PrismaPg(globalThis.__pgPoolInstance as any);
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (!globalThis.__prismaInstance || globalThis.__pgPoolUrl !== process.env.DATABASE_URL) {
    globalThis.__prismaInstance = createClient();
  }
  return globalThis.__prismaInstance;
}

export const db: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(client);
    }
    return value;
  },
});
