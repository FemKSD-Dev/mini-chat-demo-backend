import { PrismaClient, Prisma } from "@prisma/client";
import { execSync } from "node:child_process";
import path from "node:path";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🔄 Resetting database...");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    await tx.message.deleteMany();
    await tx.conversationParticipant.deleteMany();
    await tx.conversation.deleteMany();
    await tx.user.deleteMany();
  });

  console.log("✅ Database reset complete");

  const svrDir = process.cwd();
  const prismaDir = path.join(svrDir, "prisma");

  console.log(`🌱 Seeding from ${prismaDir}...`);
  execSync("npx prisma db seed", {
    stdio: "inherit",
    env: process.env,
  });

  console.log("✅ Reset + seed completed.");
}

main()
  .catch((err) => {
    console.error("❌ Reset failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });