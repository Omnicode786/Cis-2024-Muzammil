import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { validateBody } from "../middlewares/validate.js";
import { aiRateLimiter } from "../middlewares/rate-limit.js";
import { createThreadSchema, sendMessageSchema } from "../validators/ai.validators.js";
import { createThread, getThreadMessages, listThreads, sendMessage } from "../services/ai.service.js";

export const aiRouter = Router();

aiRouter.get("/threads", asyncHandler(async (req, res) => {
  const threads = await listThreads(req.auth!.shopId);
  res.json({ success: true, data: serializeBigInts(threads) });
}));

aiRouter.post("/threads", validateBody(createThreadSchema), asyncHandler(async (req, res) => {
  const thread = await createThread({
    shopId: req.auth!.shopId,
    shopUserId: req.auth!.shopUserId,
    title: req.body.title
  });

  res.status(201).json({ success: true, message: "Thread created successfully.", data: serializeBigInts(thread) });
}));

aiRouter.get("/threads/:threadId/messages", asyncHandler(async (req, res) => {
  const messages = await getThreadMessages(BigInt(req.params.threadId), req.auth!.shopId);
  res.json({ success: true, data: serializeBigInts(messages) });
}));

aiRouter.post("/threads/:threadId/messages", aiRateLimiter, validateBody(sendMessageSchema), asyncHandler(async (req, res) => {
  const result = await sendMessage({
    shopId: req.auth!.shopId,
    shopUserId: req.auth!.shopUserId,
    threadId: BigInt(req.params.threadId),
    message: req.body.message
  });

  res.status(201).json({ success: true, message: "Message stored successfully.", data: serializeBigInts(result) });
}));
