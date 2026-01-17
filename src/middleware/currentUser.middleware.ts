import type { NextFunction, Request, Response } from "express";
import { prisma } from "../prisma";
import { badRequest, notFound } from "../error"; // ของคุณชื่อ error.ts

declare global {
  namespace Express {
    interface Request {
      currentUser: { id: number; name: string };
    }
  }
}

function parseUserId(req: Request): number | null {
  const headerVal = req.header("x-user-id");
  const queryVal = req.query.userId;

  const raw =
    headerVal ??
    (typeof queryVal === "string" ? queryVal : undefined) ??
    "1";

  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  return id;
}

export async function currentUser(req: Request, _res: Response, next: NextFunction) {
  try {
    const userId = parseUserId(req);
    if (!userId) return next(badRequest("Invalid user ID"));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true },
    });

    if (!user) return next(notFound(`User ${userId} not found`));

    req.currentUser = user;
    return next();
  } catch (e) {
    return next(e);
  }
}
