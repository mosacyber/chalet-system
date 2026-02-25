import { PrismaClient } from "@prisma/client";
import { autoMigrate } from "./auto-migrate";
import "./log-store";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === "production" ? ["error"] : ["error", "warn"],
  });
  // Run auto-migration on first connection (with retry)
  retryConnect(client).catch((e) =>
    console.error("[prisma] initial connect failed after retries:", e)
  );
  return client;
};

async function retryConnect(client: PrismaClient, maxRetries = 5) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      await client.$connect();
      console.log(`[prisma] connected on attempt ${i + 1}`);
      await autoMigrate(client).catch((e) =>
        console.error("[prisma] auto-migrate error:", e)
      );
      return;
    } catch (err) {
      console.warn(
        `[prisma] connect attempt ${i + 1}/${maxRetries} failed:`,
        err instanceof Error ? err.message : err
      );
      if (i < maxRetries - 1) {
        const delay = Math.min(2000 * Math.pow(2, i), 15000);
        await new Promise((r) => setTimeout(r, delay));
      }
    }
  }
}

// Re-connect function for health check endpoint
export async function reconnectPrisma() {
  try {
    await prisma.$disconnect();
  } catch {
    // ignore
  }
  await retryConnect(prisma, 3);
  const result = await prisma.$queryRaw`SELECT 1 as ok`;
  return result;
}

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
