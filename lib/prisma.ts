/**
 * lib/prisma.ts
 *
 * Singleton Prisma Client instance for use across the application.
 * Uses the @prisma/adapter-pg driver adapter as required by Prisma 7 for
 * SQL providers (connection URL is no longer stored in schema.prisma).
 */

import { PrismaClient } from "@/generated/client/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prismaClientSingleton = (): PrismaClient => {
  const adapter = new PrismaPg({
    connectionString: process.env.DATABASE_URL!,
  });
  return new PrismaClient({ adapter });
};

const globalForPrisma = globalThis as unknown as {
  prismaGlobal: ReturnType<typeof prismaClientSingleton> | undefined;
};

export const prisma = globalForPrisma.prismaGlobal ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaGlobal = prisma;
}
