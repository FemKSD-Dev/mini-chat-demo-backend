import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { badRequest, forbidden, notFound } from "../error";

export const conversationsRouter = Router();

const listQuerySchema = z.object({
  limit: z
    .preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().int().min(1).max(50))
    .optional()
    .default(20),
  cursorAt: z.string().datetime().optional(),
  cursorId: z
    .preprocess((v) => (typeof v === "string" ? Number(v) : v), z.number().int().positive())
    .optional(),
});

const createSchema = z.object({
  participantId: z.number().int().positive(),
});

// helper: verify membership
async function ensureMember(userId: number, conversationId: number) {
  const count = await prisma.conversationParticipant.count({
    where: { conversationId, userId },
  });
  if (count === 0) throw forbidden("You are not a participant of this conversation");
}

// helper: find existing 1:1 conversation between two users
async function findExistingOneToOneConversation(userA: number, userB: number) {
  const candidates = await prisma.conversation.findMany({
    where: {
      AND: [
        { participants: { some: { userId: userA } } },
        { participants: { some: { userId: userB } } },
      ],
    },
    select: {
      id: true,
      participants: { select: { userId: true } },
    },
    take: 20,
  });

  // enforce exactly two participants and only these users
  for (const c of candidates) {
    const ids = c.participants.map((p: { userId: number }) => p.userId).sort((a: number, b: number) => a - b);
    const target = [userA, userB].sort((a: number, b: number) => a - b);
    if (ids.length === 2 && ids[0] === target[0] && ids[1] === target[1]) return c.id;
  }
  return null;
}

// GET /conversations (pagination)
conversationsRouter.get("/", async (req, res, next) => {
  try {
    const q = listQuerySchema.parse(req.query);
    const userId = req.currentUser.id;

    const whereCursor =
      q.cursorAt && q.cursorId
        ? {
            OR: [
              { updatedAt: { lt: new Date(q.cursorAt) } },
              {
                AND: [{ updatedAt: { equals: new Date(q.cursorAt) } }, { id: { lt: q.cursorId } }],
              },
            ],
          }
        : {};

    const items = await prisma.conversation.findMany({
      where: {
        participants: { some: { userId } },
        ...whereCursor,
      },
      orderBy: [{ updatedAt: "desc" }, { id: "desc" }],
      take: q.limit + 1, // fetch one extra to detect hasMore
      include: {
        participants: { include: { user: { select: { id: true, name: true } } } },
        lastMessage: true,
      },
    });

    const hasMore = items.length > q.limit;
    const page = hasMore ? items.slice(0, q.limit) : items;

    const mapped = page.map((c: typeof items[number]) => {
      const other = c.participants
        .map((p: typeof c.participants[number]) => p.user)
        .find((u: { id: number; name: string }) => u.id !== userId) ?? { id: userId, name: req.currentUser.name };

      return {
        id: c.id,
        participant: other,
        lastMessage: c.lastMessage
          ? {
              id: c.lastMessage.id,
              body: c.lastMessage.body,
              senderId: c.lastMessage.senderId,
              createdAt: c.lastMessage.createdAt,
            }
          : null,
        lastMessageAt: c.lastMessageAt,
        updatedAt: c.updatedAt,
      };
    });

    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? { cursorAt: last.updatedAt.toISOString(), cursorId: last.id }
        : null;

    res.json({ items: mapped, nextCursor, hasMore });
  } catch (e) {
    next(e);
  }
});

// POST /conversations
conversationsRouter.post("/", async (req, res, next) => {
  try {
    const body = createSchema.safeParse(req.body);
    if (!body.success) throw badRequest("Invalid payload", body.error.flatten());

    const userId = req.currentUser.id;
    const participantId = body.data.participantId;

    if (participantId === userId) throw badRequest("participantId cannot be yourself");

    const other = await prisma.user.findUnique({
      where: { id: participantId },
      select: { id: true, name: true },
    });
    if (!other) throw notFound(`User ${participantId} not found`);

    const existingId = await findExistingOneToOneConversation(userId, participantId);
    if (existingId) {
      // return existing conversation
      const convo = await prisma.conversation.findUnique({
        where: { id: existingId },
        include: {
          participants: { include: { user: { select: { id: true, name: true } } } },
          lastMessage: true,
        },
      });
      if (!convo) throw notFound("Conversation not found");

      const otherUser = convo.participants.map((p: typeof convo.participants[number]) => p.user).find((u: { id: number; name: string }) => u.id !== userId)!;

      return res.status(200).json({
        conversation: {
          id: convo.id,
          participant: otherUser,
          lastMessage: convo.lastMessage
            ? {
                id: convo.lastMessage.id,
                body: convo.lastMessage.body,
                senderId: convo.lastMessage.senderId,
                createdAt: convo.lastMessage.createdAt,
              }
            : null,
          lastMessageAt: convo.lastMessageAt,
          updatedAt: convo.updatedAt,
        },
      });
    }

    const created = await prisma.conversation.create({
      data: {
        participants: {
          create: [{ userId }, { userId: participantId }],
        },
      },
      include: {
        participants: { include: { user: { select: { id: true, name: true } } } },
      },
    });

    const otherUser = created.participants.map((p: typeof created.participants[number]) => p.user).find((u: { id: number; name: string }) => u.id !== userId)!;

    return res.status(201).json({
      conversation: {
        id: created.id,
        participant: otherUser,
        lastMessage: null,
        lastMessageAt: created.lastMessageAt,
        updatedAt: created.updatedAt,
      },
    });
  } catch (e) {
    return next(e);
  }
});

// GET /conversations/:id/messages (pagination)
conversationsRouter.get("/:id/messages", async (req, res, next) => {
  try {
    const conversationId = Number(req.params.id);
    if (!Number.isInteger(conversationId) || conversationId <= 0) throw badRequest("Invalid conversation id");

    const q = listQuerySchema.parse(req.query); // reuse limit/cursorAt/cursorId
    const userId = req.currentUser.id;

    // must exist
    const convo = await prisma.conversation.findUnique({ where: { id: conversationId }, select: { id: true } });
    if (!convo) throw notFound("Conversation not found");

    await ensureMember(userId, conversationId);

    const whereCursor =
      q.cursorAt && q.cursorId
        ? {
            OR: [
              { createdAt: { lt: new Date(q.cursorAt) } },
              {
                AND: [{ createdAt: { equals: new Date(q.cursorAt) } }, { id: { lt: q.cursorId } }],
              },
            ],
          }
        : {};

    const messages = await prisma.message.findMany({
      where: {
        conversationId,
        ...whereCursor,
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: q.limit + 1,
      include: { sender: { select: { id: true, name: true } } },
    });

    const hasMore = messages.length > q.limit;
    const page = hasMore ? messages.slice(0, q.limit) : messages;

    const mapped = page.map((m: typeof messages[number]) => ({
      id: m.id,
      conversationId: m.conversationId,
      sender: m.sender,
      body: m.body,
      createdAt: m.createdAt,
    }));

    const last = page[page.length - 1];
    const nextCursor =
      hasMore && last
        ? { cursorAt: last.createdAt.toISOString(), cursorId: last.id }
        : null;

    res.json({ items: mapped, nextCursor, hasMore });
  } catch (e) {
    next(e);
  }
});
