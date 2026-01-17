import { Router } from "express";
import { usersRouter } from "./users.route";
import { conversationsRouter } from "./conversations.route";
import { messagesRouter } from "./messages.route";


export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => res.json({ ok: true }));

apiRouter.use("/users", usersRouter);
apiRouter.use("/conversations", conversationsRouter);
apiRouter.use("/messages", messagesRouter);
