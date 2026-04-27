import { Prisma } from "@prisma/client";
import { geminiClient } from "../lib/gemini.js";
import { prisma } from "../lib/prisma.js";
import { HttpError } from "../lib/http-error.js";
import { env } from "../config/env.js";

async function buildShopContext(shopId: bigint) {
  const [customerCount, supplierCount, activeUserCount] = await Promise.all([
    prisma.customer.count({ where: { shopId, isActive: true } }),
    prisma.supplier.count({ where: { shopId, isActive: true } }),
    prisma.shopUser.count({ where: { shopId, isActive: true } })
  ]);

  const receivables = await prisma.$queryRaw<
    Array<{ customer_name: string; outstanding: Prisma.Decimal }>
  >`
    SELECT c.customer_name,
           COALESCE(SUM(b.amount), 0) - COALESCE(SUM(p.amount_paid), 0) AS outstanding
    FROM customer c
    LEFT JOIN customer_billing_log b
      ON b.customer_id = c.customer_id AND b.shop_id = c.shop_id
    LEFT JOIN payment_log p
      ON p.customer_id = c.customer_id AND p.shop_id = c.shop_id
    WHERE c.shop_id = ${shopId}
    GROUP BY c.customer_id, c.customer_name
    ORDER BY outstanding DESC
    LIMIT 5
  `;

  return {
    customerCount,
    supplierCount,
    activeUserCount,
    receivables: receivables.map((row) => ({
      customerName: row.customer_name,
      outstanding: row.outstanding.toString()
    }))
  };
}

export async function ensureThread(threadId: bigint, shopId: bigint) {
  const thread = await prisma.aiThread.findFirst({
    where: { aiThreadId: threadId, shopId }
  });

  if (!thread) {
    throw new HttpError(404, "AI thread not found.");
  }

  return thread;
}

export async function createThread(params: { shopId: bigint; shopUserId: bigint; title?: string }) {
  return prisma.aiThread.create({
    data: {
      shopId: params.shopId,
      createdByShopUserId: params.shopUserId,
      title: params.title?.trim() || "New conversation"
    }
  });
}

export async function listThreads(shopId: bigint) {
  return prisma.aiThread.findMany({
    where: { shopId },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getThreadMessages(threadId: bigint, shopId: bigint) {
  await ensureThread(threadId, shopId);
  return prisma.aiMessage.findMany({
    where: { aiThreadId: threadId, shopId },
    orderBy: { createdAt: "asc" }
  });
}

export async function sendMessage(params: {
  shopId: bigint;
  shopUserId: bigint;
  threadId: bigint;
  message: string;
}) {
  if (!geminiClient) {
    throw new HttpError(500, "Gemini API key is missing. Add GEMINI_API_KEY in backend/.env.");
  }

  const thread = await ensureThread(params.threadId, params.shopId);
  const trimmedMessage = params.message.trim();
  const title = thread.title === "New conversation" ? trimmedMessage.slice(0, 60) : undefined;

  await prisma.aiMessage.create({
    data: {
      shopId: params.shopId,
      aiThreadId: params.threadId,
      role: "USER",
      content: trimmedMessage,
      createdByShopUserId: params.shopUserId
    }
  });

  if (title) {
    await prisma.aiThread.update({
      where: { aiThreadId: params.threadId },
      data: { title }
    });
  }

  const messageHistory = await prisma.aiMessage.findMany({
    where: { shopId: params.shopId, aiThreadId: params.threadId },
    orderBy: { createdAt: "asc" },
    take: 20
  });

  const shopContext = await buildShopContext(params.shopId);

  const response = await geminiClient.models.generateContent({
    model: env.GEMINI_MODEL,
    contents: messageHistory.map((item) => ({
      role: item.role === "ASSISTANT" ? "model" : "user",
      parts: [{ text: item.content }]
    })),
    config: {
      systemInstruction: `
You are ShopIQ AI, a polished business assistant inside a shop management app.
Always respond in clean markdown with short headings and useful bullets.
Focus on shop operations, staff, receivables, payables, collections, and business actions.

Current shop snapshot:
${JSON.stringify(shopContext, null, 2)}

Use only the provided facts from the snapshot.
      `.trim()
    }
  });

  const assistantText = response.text?.trim() || "I could not generate a response this time.";

  const savedAssistantMessage = await prisma.aiMessage.create({
    data: {
      shopId: params.shopId,
      aiThreadId: params.threadId,
      role: "ASSISTANT",
      content: assistantText,
      modelName: env.GEMINI_MODEL
    }
  });

  await prisma.aiThread.update({
    where: { aiThreadId: params.threadId },
    data: { updatedAt: new Date() }
  });

  return { assistantMessage: savedAssistantMessage };
}
