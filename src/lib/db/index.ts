import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@prisma/client";
import ws from "ws";

if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

declare global {
  // eslint-disable-next-line no-var
  var __prismaInstance: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL!;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

function getClient(): PrismaClient {
  if (
    !globalThis.__prismaInstance ||
    !(globalThis.__prismaInstance as unknown as { managementMember?: unknown }).managementMember
  ) {
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
