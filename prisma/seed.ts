import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
})

const prisma = new PrismaClient({ adapter });

async function main() {

  const users = [
    { id: 1, name: 'Alice' },
    { id: 2, name: 'Bob' },
    { id: 3, name: 'Charlie' },
    { id: 4, name: 'Dave' },
  ]

  for (const u of users) {
    await prisma.user.upsert({
      where: { id: u.id },
      update: { name: u.name },
      create: { id: u.id, name: u.name },
    });
  }

  // seed a demo conversation + messages
  let conversation = await prisma.conversation.findFirst({
    where: {
      AND: [
        { participants: { some: { userId: 1 }}},
        { participants: { some: { userId: 2 }}}
      ],
    },
    include: {
      participants: true,
    },
  });

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        participants: { create: [{ userId: 1 }, { userId: 2 }] },
      },
      include: {
        participants: true,
      },
    });
  } else {
    const has1 = conversation.participants.some((p) => p.userId === 1);
    const has2 = conversation.participants.some((p) => p.userId === 2);

    if (!has1) {
      await prisma.conversationParticipant.create({
        data: { conversationId: conversation.id, userId: 1 },
      });
    }
    if (!has2) {
      await prisma.conversationParticipant.create({
        data: { conversationId: conversation.id, userId: 2 },
      });
    }
  }

  const conversationId = conversation.id;
  const msgCount = await prisma.message.count({ where: { conversationId }});

  if (msgCount === 0) {
    const t1 = new Date(Date.now() - 60_000);
    const t2 = new Date(Date.now() - 30_000);

    const created = await prisma.$transaction(async (tx) => {
      const msg1 = await tx.message.create({
        data: {
          conversationId,
          senderId: 1,
          body: "Hello Bob 👋 (seed)",
          createdAt: t1,
        },
      });

      const msg2 = await tx.message.create({
        data: {
          conversationId,
          senderId: 2,
          body: "Hi Alice! (seed)",
          createdAt: t2,
        },
      });

      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: msg2.id,
          lastMessageAt: msg2.createdAt,
        },
      });

      return { msg1, msg2 };
    });

    console.log(`🌱 Seeded conversation ${conversationId} with ${created.msg1.body} and ${created.msg2.body}`);
  } else {
    console.log(`ℹ️ Conversation #${conversationId} already has ${msgCount} messages, skipping message seed`);
  }
  console.log("✅ Seed completed");
};

main().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});