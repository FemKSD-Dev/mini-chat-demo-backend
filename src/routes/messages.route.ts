import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { badRequest, forbidden, notFound } from "../error";
import { Prisma } from "@prisma/client";

export const messagesRouter = Router();

const createMessageSchema = z.object({
  conversationId: z.number().int().positive(),
  body: z.string().trim().min(1).max(500),
});

async function ensureMember(userId: number, conversationId: number) {
  const count = await prisma.conversationParticipant.count({
    where: { conversationId, userId },
  });
  if (count === 0) throw forbidden("You are not a participant of this conversation");
}

messagesRouter.post("/", async (req, res, next) => {
  try {
    const parsed = createMessageSchema.safeParse(req.body);
    if (!parsed.success) throw badRequest("Invalid payload", parsed.error.flatten());

    const userId = req.currentUser.id;
    const { conversationId, body } = parsed.data;

    const convo = await prisma.conversation.findUnique({
      where: { id: conversationId },
      select: { id: true },
    });
    if (!convo) throw notFound("Conversation not found");

    await ensureMember(userId, conversationId);

    const created = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      const msg = await tx.message.create({
        data: {
          conversationId,
          senderId: userId,
          body,
        },
        include: { sender: { select: { id: true, name: true } } },
      });

      // Update conversation for sorting (/conversations) and last message pointer
      await tx.conversation.update({
        where: { id: conversationId },
        data: {
          lastMessageId: msg.id,
          lastMessageAt: msg.createdAt,
        },
      });

      return msg;
    });

    res.status(201).json({
      message: {
        id: created.id,
        conversationId: created.conversationId,
        sender: created.sender,
        body: created.body,
        createdAt: created.createdAt,
      },
    });
  } catch (e) {
    next(e);
  }
});
