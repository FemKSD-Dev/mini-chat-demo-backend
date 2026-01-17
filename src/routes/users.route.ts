import { Router } from 'express';
import { prisma } from '../prisma';

export const usersRouter = Router();

usersRouter.get("/me", (req, res) => {
  res.json({ user: req.currentUser });
})

usersRouter.get("/", async (req, res, next) => {
  try {
    const includeMe = req.query.includeMe === "1" || req.query.includeMe === "true";
    const meId = req.currentUser.id;

    const users = await prisma.user.findMany({
      where: includeMe ? undefined : { id: { not: meId } },
      orderBy: { id: "asc" },
      select: { id: true, name: true },
    });

    res.json({ items: users });
  } catch (e) {
    next(e);
  }
});

usersRouter.get("/whoami", (req, res) => {
  res.json({ user: req.currentUser });
});