import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { apiError, unauthorized } from "@/lib/api-response";
import { prisma } from "@/lib/prisma";
import { getBusinessContext } from "@/lib/data";
import { runAiTask } from "@/lib/ai";
import { can } from "@/lib/permissions";
import { workspacePath } from "@/lib/workspace";

type PendingAction = "create_product" | "create_customer" | "create_supplier";
type PendingMetadata = { pendingAction?: PendingAction; status?: "pending" | "executed" | "cancelled"; payload?: Record<string, any>; previewId?: string };

const CONFIRM_RE = /^(yes|yep|yeah|ok|okay|confirm|confirmed|create it|save it|add it|proceed|do it|approve|approved|go ahead|yes add|yes create|yes save)/i;
const CANCEL_RE = /^(no|nope|cancel|cancel it|do not|don't|dont|not now|stop|reject)/i;

function money(value: unknown) { const raw = String(value || "").replace(/,/g, ""); const parsed = Number(raw.match(/\d+(?:\.\d+)?/)?.[0] || 0); return Number.isFinite(parsed) ? parsed : 0; }
function clean(value: unknown, fallback = "") { return String(value || fallback).replace(/\s+/g, " ").trim(); }
function titleCase(value: string) { return value.split(" ").filter(Boolean).map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" "); }
function isConfirm(text: string) { return CONFIRM_RE.test(text.trim()); }
function isCancel(text: string) { return CANCEL_RE.test(text.trim()); }
function getIntent(text: string): PendingAction | null { const normalized = text.toLowerCase(); const asksAction = /\b(add|create|save|register|make|new)\b/.test(normalized); if (!asksAction) return null; if (/\b(product|item|inventory|sku|stock)\b/.test(normalized)) return "create_product"; if (/\b(customer|client|buyer)\b/.test(normalized)) return "create_customer"; if (/\b(supplier|vendor|wholesaler|distributor)\b/.test(normalized)) return "create_supplier"; return null; }
function extractBetween(text: string, patterns: RegExp[], fallback: string) { for (const pattern of patterns) { const match = text.match(pattern)?.[1]; if (match) return clean(match, fallback).replace(/[.,;:]$/, ""); } return fallback; }

function extractProduct(text: string) {
  const name = extractBetween(text, [/product\s*:?\s*([^,.\n]+)/i, /item\s*:?\s*([^,.\n]+)/i, /add\s+(?:a\s+new\s+)?(?:product|item)?\s*:?\s*([^,.\n]+?)(?:\s+with|\s+cost|\s+sale|\s+price|,|$)/i], "New Product");
  const sku = clean(text.match(/\bsku\s*(?:is|=|:)?\s*([A-Za-z0-9-_]+)/i)?.[1]) || `AI-${Date.now()}`;
  const brand = clean(text.match(/\bbrand\s*(?:is|=|:)?\s*([^,.\n]+)/i)?.[1]) || name.split(" ")[0] || undefined;
  const categoryName = clean(text.match(/\bcategory\s*(?:is|=|:)?\s*([^,.\n]+)/i)?.[1]);
  const unit = clean(text.match(/\bunit\s*(?:is|=|:)?\s*([A-Za-z]+)/i)?.[1]) || "pcs";
  const costPrice = money(text.match(/cost(?:\s*price)?\s*(?:is|=|:)?\s*(PKR|Rs\.?|rupees)?\s*([\d,]+)/i)?.[2] || text.match(/buy(?:ing)?\s*price\s*(?:is|=|:)?\s*([\d,]+)/i)?.[1]);
  const salePrice = money(text.match(/sale(?:\s*price)?\s*(?:is|=|:)?\s*(PKR|Rs\.?|rupees)?\s*([\d,]+)/i)?.[2] || text.match(/selling\s*price\s*(?:is|=|:)?\s*([\d,]+)/i)?.[1] || text.match(/price\s*(?:is|=|:)?\s*([\d,]+)/i)?.[1]);
  const stockQty = Number(text.match(/stock\s*(?:is|=|:)?\s*(\d+)/i)?.[1] || text.match(/quantity\s*(?:is|=|:)?\s*(\d+)/i)?.[1] || 0);
  const reorderLevel = Number(text.match(/(?:low stock|reorder)\s*(?:threshold|level)?\s*(?:is|=|:)?\s*(\d+)/i)?.[1] || 5);
  const reorderQuantity = Number(text.match(/reorder\s*quantity\s*(?:is|=|:)?\s*(\d+)/i)?.[1] || Math.max(reorderLevel * 3, 10));
  const location = clean(text.match(/location\s*(?:is|=|:)?\s*([^,.\n]+)/i)?.[1]);
  return { name: titleCase(name), sku, brand, categoryName: categoryName ? titleCase(categoryName) : undefined, unit, costPrice, salePrice: salePrice || Math.round(costPrice * 1.2), stockQty: Number.isFinite(stockQty) ? stockQty : 0, reorderLevel: Number.isFinite(reorderLevel) ? reorderLevel : 5, reorderQuantity: Number.isFinite(reorderQuantity) ? reorderQuantity : 10, location: location || undefined };
}
function extractCustomer(text: string) { const name = extractBetween(text, [/customer\s*:?\s*([^,.\n]+)/i, /client\s*:?\s*([^,.\n]+)/i, /add\s+(?:a\s+new\s+)?(?:customer|client)?\s*:?\s*([^,.\n]+?)(?:\s+with|\s+phone|,|$)/i], "New Customer"); return { name: titleCase(name), phone: clean(text.match(/phone\s*(?:is|=|:)?\s*([+\d\-\s]+)/i)?.[1]), email: clean(text.match(/email\s*(?:is|=|:)?\s*([^\s,]+)/i)?.[1]), address: clean(text.match(/address\s*(?:is|=|:)?\s*([^\n]+)/i)?.[1]), creditLimit: money(text.match(/credit\s*limit\s*(?:is|=|:)?\s*([\d,]+)/i)?.[1]), notes: "Created from ShopIQ AI Copilot preview." }; }
function extractSupplier(text: string) { const name = extractBetween(text, [/supplier\s*:?\s*([^,.\n]+)/i, /vendor\s*:?\s*([^,.\n]+)/i, /add\s+(?:a\s+new\s+)?(?:supplier|vendor)?\s*:?\s*([^,.\n]+?)(?:\s+with|\s+phone|,|$)/i], "New Supplier"); return { name: titleCase(name), phone: clean(text.match(/phone\s*(?:is|=|:)?\s*([+\d\-\s]+)/i)?.[1]), email: clean(text.match(/email\s*(?:is|=|:)?\s*([^\s,]+)/i)?.[1]), address: clean(text.match(/address\s*(?:is|=|:)?\s*([^\n]+)/i)?.[1]), reliabilityScore: Number(text.match(/reliability\s*(?:score)?\s*(?:is|=|:)?\s*(\d+)/i)?.[1] || 80), notes: "Created from ShopIQ AI Copilot preview." }; }

function previewMarkdown(action: PendingAction, payload: Record<string, any>) {
  if (action === "create_product") return `## Product Preview\n\nI can add this product to your inventory after confirmation.\n\n- **Name:** ${payload.name}\n- **SKU:** ${payload.sku}\n- **Brand:** ${payload.brand || "Not provided"}\n- **Category:** ${payload.categoryName || "Uncategorized"}\n- **Cost price:** PKR ${Number(payload.costPrice || 0).toLocaleString()}\n- **Sale price:** PKR ${Number(payload.salePrice || 0).toLocaleString()}\n- **Opening stock:** ${payload.stockQty}\n- **Low stock level:** ${payload.reorderLevel}\n\nReply **Yes, add it** to save this product in the database, or **Cancel** to discard this preview.`;
  if (action === "create_customer") return `## Customer Preview\n\nI can add this customer after confirmation.\n\n- **Name:** ${payload.name}\n- **Phone:** ${payload.phone || "Not provided"}\n- **Email:** ${payload.email || "Not provided"}\n- **Address:** ${payload.address || "Not provided"}\n- **Credit limit:** PKR ${Number(payload.creditLimit || 0).toLocaleString()}\n\nReply **Yes, add it** to save this customer, or **Cancel** to discard this preview.`;
  return `## Supplier Preview\n\nI can add this supplier after confirmation.\n\n- **Name:** ${payload.name}\n- **Phone:** ${payload.phone || "Not provided"}\n- **Email:** ${payload.email || "Not provided"}\n- **Address:** ${payload.address || "Not provided"}\n- **Reliability score:** ${payload.reliabilityScore || 80}%\n\nReply **Yes, add it** to save this supplier, or **Cancel** to discard this preview.`;
}
async function findLatestPendingMessage(threadId: string) { const messages = await prisma.assistantMessage.findMany({ where: { threadId }, orderBy: { createdAt: "desc" }, take: 12 }); return messages.find((message) => { const metadata = message.metadata as PendingMetadata | null; return metadata?.pendingAction && metadata.status === "pending" && metadata.payload; }); }

async function createFromPendingAction(user: any, action: PendingAction, payload: Record<string, any>) {
  if (action === "create_product") {
    if (!can(user.role, "products", "create")) return { answer: "## Permission Needed\n\nOnly admins and managers can create products from the AI Copilot.", action: null };
    let categoryId: string | undefined;
    if (payload.categoryName) { const category = await prisma.category.upsert({ where: { shopId_name: { shopId: user.shopId, name: payload.categoryName } }, update: {}, create: { shopId: user.shopId, name: payload.categoryName, color: "emerald" } }); categoryId = category.id; }
    const product = await prisma.product.create({ data: { shopId: user.shopId, categoryId, sku: payload.sku || `AI-${Date.now()}`, name: payload.name || "New Product", brand: payload.brand || undefined, unit: payload.unit || "pcs", costPrice: payload.costPrice || 0, salePrice: payload.salePrice || 0, stockQty: payload.stockQty || 0, reorderLevel: payload.reorderLevel || 5, reorderQuantity: payload.reorderQuantity || 10, location: payload.location || undefined } });
    await prisma.stockMovement.create({ data: { shopId: user.shopId, productId: product.id, userId: user.id, type: "OPENING", quantity: product.stockQty, beforeQty: 0, afterQty: product.stockQty, reference: "AI_OPENING_STOCK", notes: "Opening stock created through AI Copilot." } });
    await prisma.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "AI_PRODUCT_CREATED", title: `AI created product: ${product.name}`, details: `Stock ${product.stockQty}, sale price PKR ${Number(product.salePrice).toLocaleString()}`, metadata: { productId: product.id } } });
    return { answer: `## Product Created\n\n**${product.name}** has been added to your inventory.\n\n- SKU: ${product.sku}\n- Stock: ${product.stockQty}\n- Sale price: PKR ${Number(product.salePrice).toLocaleString()}\n\nYou can open the Inventory workspace to review it.`, action: { label: "Open Inventory", href: workspacePath(user.role, "products") } };
  }
  if (action === "create_customer") {
    const customer = await prisma.customer.create({ data: { shopId: user.shopId, name: payload.name || "New Customer", phone: payload.phone || undefined, email: payload.email || undefined, address: payload.address || undefined, creditLimit: payload.creditLimit || 0, notes: payload.notes || "Created from ShopIQ AI Copilot." } });
    await prisma.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "AI_CUSTOMER_CREATED", title: `AI created customer: ${customer.name}`, metadata: { customerId: customer.id } } });
    return { answer: `## Customer Created\n\n**${customer.name}** has been added to your customer list.`, action: { label: "Open Customers", href: workspacePath(user.role, "customers") } };
  }
  if (!can(user.role, "suppliers", "create")) return { answer: "## Permission Needed\n\nOnly admins and managers can create suppliers from the AI Copilot.", action: null };
  const supplier = await prisma.supplier.create({ data: { shopId: user.shopId, name: payload.name || "New Supplier", phone: payload.phone || undefined, email: payload.email || undefined, address: payload.address || undefined, reliabilityScore: payload.reliabilityScore || 80, notes: payload.notes || "Created from ShopIQ AI Copilot." } });
  await prisma.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "AI_SUPPLIER_CREATED", title: `AI created supplier: ${supplier.name}`, metadata: { supplierId: supplier.id } } });
  return { answer: `## Supplier Created\n\n**${supplier.name}** has been added to your supplier list.`, action: { label: "Open Suppliers", href: "/admin/suppliers" } };
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser(); if (!user) return unauthorized();
    const { question, threadId, agentMode } = await request.json();
    const text = String(question || "").trim(); if (!text) return NextResponse.json({ error: "Question is required." }, { status: 400 });
    let thread = threadId ? await prisma.assistantThread.findFirst({ where: { id: threadId, shopId: user.shopId } }) : null;
    if (!thread) thread = await prisma.assistantThread.create({ data: { shopId: user.shopId, createdById: user.id, title: text.slice(0, 80) || "Business assistant" } });
    const recentBefore = await prisma.assistantMessage.findMany({ where: { threadId: thread.id }, orderBy: { createdAt: "desc" }, take: 6 });
    await prisma.assistantMessage.create({ data: { threadId: thread.id, authorId: user.id, role: "USER", content: text } });
    if (agentMode && isCancel(text)) { const pending = await findLatestPendingMessage(thread.id); if (pending) { const metadata = pending.metadata as PendingMetadata; await prisma.assistantMessage.update({ where: { id: pending.id }, data: { metadata: { ...metadata, status: "cancelled", cancelledAt: new Date().toISOString() } } }); } const answer = "## Preview Cancelled\n\nNo database record was created. You can ask me to prepare a new product, customer, or supplier preview whenever you are ready."; await prisma.assistantMessage.create({ data: { threadId: thread.id, role: "AI", content: answer } }); return NextResponse.json({ thread, answer }); }
    if (agentMode && isConfirm(text)) { const pending = await findLatestPendingMessage(thread.id); if (!pending) { const answer = "## Nothing Pending\n\nI do not have a pending ShopIQ action to confirm. Ask me to create a product, customer, or supplier first, and I will show you a preview before saving it."; await prisma.assistantMessage.create({ data: { threadId: thread.id, role: "AI", content: answer } }); return NextResponse.json({ thread, answer }); } const metadata = pending.metadata as PendingMetadata; const result = await createFromPendingAction(user, metadata.pendingAction!, metadata.payload || {}); await prisma.assistantMessage.update({ where: { id: pending.id }, data: { metadata: { ...metadata, status: "executed", executedAt: new Date().toISOString() } } }); await prisma.assistantMessage.create({ data: { threadId: thread.id, role: "AI", content: result.answer, metadata: result.action ? { action: result.action } : undefined } }); return NextResponse.json({ thread, answer: result.answer, action: result.action }); }
    if (agentMode) { const intent = getIntent(text); if (intent) { const payload = intent === "create_product" ? extractProduct(text) : intent === "create_customer" ? extractCustomer(text) : extractSupplier(text); const previewId = `${intent}-${Date.now()}`; const answer = previewMarkdown(intent, payload); await prisma.assistantMessage.create({ data: { threadId: thread.id, role: "AI", content: answer, metadata: { pendingAction: intent, status: "pending", payload, previewId } } }); return NextResponse.json({ thread, answer, previewAction: { type: intent, payload, previewId } }); } }
    const context = await getBusinessContext(user.shopId);
    const history = recentBefore.reverse().map((message) => `${message.role === "USER" ? "User" : "Assistant"}: ${message.content}`).join("\n\n");
    const result = await runAiTask(`You are ShopIQ, an AI business operating assistant for a real shop. Use the live shop data. Be practical, structured, concise, and do not invent database facts.\n\n${context}\n\nRecent conversation:\n${history || "No previous messages in this thread."}\n\nCurrent user question:\n${text}`);
    await prisma.assistantMessage.create({ data: { threadId: thread.id, role: "AI", content: result.text, metadata: { provider: result.provider, confidence: result.confidence } } });
    return NextResponse.json({ thread, answer: result.text });
  } catch (error) { return apiError(error, "AI assistant is temporarily unavailable.", 502); }
}
