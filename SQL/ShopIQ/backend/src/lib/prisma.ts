import { PrismaClient } from "@prisma/client";

declare global {
  var __shopiqPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__shopiqPrisma ??
  new PrismaClient({
    log: ["error", "warn"]
  });

if (process.env.NODE_ENV !== "production") {
  global.__shopiqPrisma = prisma;
}
