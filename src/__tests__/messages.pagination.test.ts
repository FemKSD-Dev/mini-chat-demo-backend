import request from "supertest";
import { beforeAll, afterAll, describe, expect, it } from "vitest";
import { Express } from "express";

import { createApp } from "../index";
import { prisma } from "../prisma";

let app: Express;

describe("GET /api/conversations/:id/messages pagination + auth", () => {
  beforeAll(async () => {
    // Create app instance
    app = createApp();

    // Clean database (delete all data)
    await prisma.message.deleteMany();
    await prisma.conversationParticipant.deleteMany();
    await prisma.conversation.deleteMany();
    await prisma.user.deleteMany();

    // Create test users
    await prisma.user.createMany({
      data: [
        { id: 1, name: "Alice" },
        { id: 2, name: "Bob" },
        { id: 3, name: "Charlie" },
      ],
    });
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should paginate messages and forbid non-participants", async () => {
    // 1) สร้าง conversation ระหว่าง user 1 และ 2 (ผ่าน API)
    const createConv = await request(app)
      .post("/api/conversations")
      .set("x-user-id", "1")
      .send({ participantId: 2 });

    expect([200, 201]).toContain(createConv.status);

    const conversationId = createConv.body?.conversation?.id;
    expect(typeof conversationId).toBe("number");

    // 2) ส่งข้อความ 25 ข้อความโดย user1
    for (let i = 1; i <= 25; i++) {
      const r = await request(app)
        .post("/api/messages")
        .set("x-user-id", "1")
        .send({ conversationId, body: `msg-${i}` });

      expect(r.status).toBe(201);
      expect(r.body?.message?.body).toBe(`msg-${i}`);
    }

    // 3) หน้าแรก limit=10
    const page1 = await request(app)
      .get(`/api/conversations/${conversationId}/messages?limit=10`)
      .set("x-user-id", "1");

    expect(page1.status).toBe(200);
    expect(page1.body.items).toHaveLength(10);
    expect(page1.body.hasMore).toBe(true);
    expect(page1.body.nextCursor).toBeTruthy();

    const ids1 = page1.body.items.map((m: any) => m.id);
    expect(new Set(ids1).size).toBe(10);

    // 4) หน้า 2 ใช้ cursorAt/cursorId
    const { cursorAt, cursorId } = page1.body.nextCursor;
    const page2 = await request(app)
      .get(
        `/api/conversations/${conversationId}/messages?limit=10&cursorAt=${encodeURIComponent(
          cursorAt
        )}&cursorId=${cursorId}`
      )
      .set("x-user-id", "1");

    expect(page2.status).toBe(200);
    expect(page2.body.items).toHaveLength(10);

    const ids2 = page2.body.items.map((m: any) => m.id);
    // ต้องไม่ซ้ำกับ page1
    const overlap = ids2.filter((id: number) => ids1.includes(id));
    expect(overlap).toHaveLength(0);

    // 5) user3 (ไม่ใช่ participant) ต้องโดน 403
    const forbidden = await request(app)
      .get(`/api/conversations/${conversationId}/messages?limit=5`)
      .set("x-user-id", "3");

    expect(forbidden.status).toBe(403);
    expect(forbidden.body?.error?.code).toBe("FORBIDDEN");
  });
});
