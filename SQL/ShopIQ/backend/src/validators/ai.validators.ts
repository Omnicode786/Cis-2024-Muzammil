import { z } from "zod";

export const createThreadSchema = z.object({
  title: z.string().min(1).max(255).optional()
});

export const sendMessageSchema = z.object({
  message: z.string().min(1).max(4000)
});
