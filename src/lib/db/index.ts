import { Pool as PgPool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool as NeonPool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var __pgPoolInstance: PgPool | undefined;
  // eslint-disable-next-line no-var
  var __neonPoolInstance: NeonPool | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL || "";
  if (connectionString.includes("neon.tech") || connectionString.includes("neondb")) {
    if (typeof globalThis.WebSocket === "undefined") {
      neonConfig.webSocketConstructor = ws;
    }
    if (!globalThis.__neonPoolInstance) {
      globalThis.__neonPoolInstance = new NeonPool({ connectionString });
    }
    const adapter = new PrismaNeon(globalThis.__neonPoolInstance as any);
    return new PrismaClient({ adapter });
  } else {
    if (!globalThis.__pgPoolInstance) {
      globalThis.__pgPoolInstance = new PgPool({ connectionString });
    }
    const adapter = new PrismaPg(globalThis.__pgPoolInstance as any);
    return new PrismaClient({ adapter });
  }
}

function getClient(): PrismaClient {
  if (process.env.NODE_ENV !== "production") {
    // In dev mode, always instantiate PrismaClient to pick up updated generated schemas
    return createClient();
  }
  if (!globalThis.__prismaInstance) {
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
