import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { apiError, badRequest, forbidden, unauthorized } from "@/lib/api-response";
import { can, canUsePaymentDirection } from "@/lib/permissions";
import { WALK_IN_PAYMENT_REQUIRED_MESSAGE, walkInInvoiceHasDue } from "@/lib/invoice-rules";
import { invoiceItemsSummary, invoicePaymentNotes, invoiceStatusFromPaid, moneyLabel } from "@/lib/payment-workflow";
import { prisma } from "@/lib/prisma";
import { optionalId, optionalText, positiveMoney } from "@/lib/validation";

const include = { customer: true, supplier: true, invoice: true, purchase: true } as const;

const paymentSchema = z.object({
  direction: z.enum(["CUSTOMER_IN", "SUPPLIER_OUT"]).default("CUSTOMER_IN"),
  method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "JAZZCASH", "EASYPAISA", "CHEQUE", "OTHER"]).default("CASH"),
  amount: positiveMoney,
  customerId: optionalId,
  supplierId: optionalId,
  invoiceId: optionalId,
  purchaseId: optionalId,
  paidAt: z.coerce.date().optional(),
  reference: optionalText(120),
  notes: optionalText(600)
});

function isPaymentValidationError(message: string) {
  return [
    "Invoice payments must use customer-in direction.",
    "Invoice not found.",
    "The selected invoice controls the customer.",
    "This invoice is already fully paid.",
    "Payment amount cannot exceed",
    "Purchase not found.",
    "Customer not found.",
    "Supplier not found.",
    "Customer payments need a customer or invoice.",
    "Supplier payouts need a supplier or purchase."
  ].some((text) => message.includes(text));
}

async function resolvePaymentLinks(db: any, shopId: string, payment: z.infer<typeof paymentSchema>) {
  const next = { ...payment, customerId: payment.customerId || null, supplierId: payment.supplierId || null, invoiceId: payment.invoiceId || null, purchaseId: payment.purchaseId || null };
  if (next.invoiceId) {
    if (next.direction !== "CUSTOMER_IN") return { error: "Invoice payments must use customer-in direction." };
    const invoice = await db.invoice.findFirst({ where: { id: next.invoiceId, shopId, status: { not: "CANCELLED" } }, include: { customer: true, items: { include: { product: true } } } });
    if (!invoice) return { error: "Invoice not found." };
    if (next.customerId && next.customerId !== invoice.customerId) return { error: "The selected invoice controls the customer. Clear the invoice to choose a different customer." };
    const remainingBalance = Number(invoice.dueAmount || 0);
    if (remainingBalance <= 0) return { error: "This invoice is already fully paid." };
    if (Number(next.amount) > remainingBalance) return { error: `Payment amount cannot exceed the remaining invoice balance of ${moneyLabel(remainingBalance)}.` };
    const paidAfter = Number(invoice.paidAmount || 0) + Number(next.amount);
    const statusAfter = invoiceStatusFromPaid(Number(invoice.total || 0), paidAfter);
    next.customerId = invoice.customerId || null;
    next.reference = next.reference || invoice.invoiceNo;
    next.notes = invoicePaymentNotes({
      automatic: false,
      customerName: invoice.customer?.name,
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      amount: Number(next.amount),
      method: next.method,
      productsSummary: invoiceItemsSummary(invoice.items || []),
      status: statusAfter,
      remainingBalance: Math.max(Number(invoice.total || 0) - paidAfter, 0),
      userNotes: next.notes
    });
  }
  if (next.purchaseId) {
    const purchase = await db.purchase.findFirst({ where: { id: next.purchaseId, shopId }, select: { id: true, supplierId: true } });
    if (!purchase) return { error: "Purchase not found." };
    next.supplierId = next.supplierId || purchase.supplierId;
  }
  if (next.customerId) {
    const customer = await db.customer.findFirst({ where: { id: next.customerId, shopId }, select: { id: true } });
    if (!customer) return { error: "Customer not found." };
  }
  if (next.supplierId) {
    const supplier = await db.supplier.findFirst({ where: { id: next.supplierId, shopId }, select: { id: true } });
    if (!supplier) return { error: "Supplier not found." };
  }
  if (next.direction === "CUSTOMER_IN" && !next.customerId && !next.invoiceId) return { error: "Customer payments need a customer or invoice." };
  if (next.direction === "SUPPLIER_OUT" && !next.supplierId && !next.purchaseId) return { error: "Supplier payouts need a supplier or purchase." };
  return { payment: next };
}

async function applyPaymentEffect(tx: any, shopId: string, payment: { direction: string; amount: unknown; customerId?: string | null; supplierId?: string | null; invoiceId?: string | null; purchaseId?: string | null }, sign: 1 | -1) {
  const amount = Number(payment.amount);
  if (payment.direction === "CUSTOMER_IN") {
    let customerId = payment.customerId || null;
    if (payment.invoiceId) {
      const invoice = await tx.invoice.findFirst({ where: { id: payment.invoiceId, shopId } });
      if (invoice) {
        customerId = customerId || invoice.customerId;
        if (sign === 1 && amount > Number(invoice.dueAmount || 0)) throw new Error(`Payment amount cannot exceed the remaining invoice balance of ${moneyLabel(invoice.dueAmount)}.`);
        const paidAmount = Math.max(Number(invoice.paidAmount) + sign * amount, 0);
        const dueAmount = Math.max(Number(invoice.total) - paidAmount, 0);
        const status = invoiceStatusFromPaid(Number(invoice.total), paidAmount);
        if (walkInInvoiceHasDue(invoice.customerId, Number(invoice.total), paidAmount, status)) throw new Error(WALK_IN_PAYMENT_REQUIRED_MESSAGE);
        await tx.invoice.update({ where: { id: invoice.id }, data: { paidAmount, dueAmount, status } });
      }
    }
    if (customerId) await tx.customer.update({ where: { id: customerId }, data: { balance: sign === 1 ? { decrement: amount } : { increment: amount } } });
  }
  if (payment.direction === "SUPPLIER_OUT") {
    let supplierId = payment.supplierId || null;
    if (payment.purchaseId) {
      const purchase = await tx.purchase.findFirst({ where: { id: payment.purchaseId, shopId } });
      if (purchase) {
        supplierId = supplierId || purchase.supplierId;
        const paidAmount = Math.max(Number(purchase.paidAmount) + sign * amount, 0);
        const dueAmount = Math.max(Number(purchase.total) - paidAmount, 0);
        await tx.purchase.update({ where: { id: purchase.id }, data: { paidAmount, dueAmount } });
      }
    }
    if (supplierId) await tx.supplier.update({ where: { id: supplierId }, data: { balance: sign === 1 ? { decrement: amount } : { increment: amount } } });
  }
}

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "payments", "read")) return forbidden();
    const payments = await prisma.payment.findMany({ where: { shopId: user.shopId, ...(canUsePaymentDirection(user.role, "SUPPLIER_OUT") ? {} : { direction: "CUSTOMER_IN" as const }) }, include, orderBy: { paidAt: "desc" }, take: 150 });
    return NextResponse.json({ payments });
  } catch (e) {
    return apiError(e, "Unable to load payments.");
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "payments", "create")) return forbidden();
    const parsed = paymentSchema.parse(await request.json());
    if (!canUsePaymentDirection(user.role, parsed.direction)) return forbidden("Your role can record customer receipts only.");
    const payment = await prisma.$transaction(async (tx) => {
      const resolved = await resolvePaymentLinks(tx, user.shopId, parsed);
      if (resolved.error || !resolved.payment) throw new Error(resolved.error);
      const created = await tx.payment.create({ data: { shopId: user.shopId, createdById: user.id, ...resolved.payment }, include });
      await applyPaymentEffect(tx, user.shopId, created, 1);
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "PAYMENT_RECORDED", title: "Payment recorded", details: `PKR ${Number(created.amount).toLocaleString()} via ${created.method}` } });
      return created;
    });
    return NextResponse.json({ payment });
  } catch (e) {
    if (e instanceof Error && (e.message === WALK_IN_PAYMENT_REQUIRED_MESSAGE || isPaymentValidationError(e.message))) return badRequest(e.message);
    return apiError(e, "Unable to record payment.");
  }
}
