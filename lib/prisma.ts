import { PrismaClient } from "@prisma/client";
import { autoMigrate } from "./auto-migrate";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const prismaClientSingleton = () => {
  const client = new PrismaClient();
  // Run auto-migration on first connection
  autoMigrate(client).catch(() => {});
  return client;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
