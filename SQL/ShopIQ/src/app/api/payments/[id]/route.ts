import { NextResponse } from "next/server";
import { z } from "zod";
import type { PaymentMethod } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { apiError, badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { can, canUsePaymentDirection } from "@/lib/permissions";
import { WALK_IN_PAYMENT_REQUIRED_MESSAGE, walkInInvoiceHasDue } from "@/lib/invoice-rules";
import { invoiceItemsSummary, invoicePaymentNotes, invoiceStatusFromPaid, isAutomaticInvoicePayment, moneyLabel } from "@/lib/payment-workflow";
import { prisma } from "@/lib/prisma";
import { nullableId, nullableText, positiveMoney } from "@/lib/validation";

const include = { customer: true, supplier: true, invoice: true, purchase: true } as const;

const paymentUpdateSchema = z.object({
  direction: z.enum(["CUSTOMER_IN", "SUPPLIER_OUT"]).optional(),
  method: z.enum(["CASH", "BANK_TRANSFER", "CARD", "JAZZCASH", "EASYPAISA", "CHEQUE", "OTHER"]).optional(),
  amount: positiveMoney.optional(),
  customerId: nullableId,
  supplierId: nullableId,
  invoiceId: nullableId,
  purchaseId: nullableId,
  paidAt: z.coerce.date().optional(),
  reference: nullableText(120),
  notes: nullableText(600)
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
    "Supplier payouts need a supplier or purchase.",
    "Automatic invoice payments are controlled by the invoice."
  ].some((text) => message.includes(text));
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

async function resolvePaymentLinks(db: any, shopId: string, payment: { direction: string; method: PaymentMethod; amount: unknown; customerId?: string | null; supplierId?: string | null; invoiceId?: string | null; purchaseId?: string | null; reference?: string | null; notes?: string | null }) {
  if (payment.invoiceId) {
    if (payment.direction !== "CUSTOMER_IN") return "Invoice payments must use customer-in direction.";
    const invoice = await db.invoice.findFirst({ where: { id: payment.invoiceId, shopId, status: { not: "CANCELLED" } }, include: { customer: true, items: { include: { product: true } } } });
    if (!invoice) return "Invoice not found.";
    if (payment.customerId && payment.customerId !== invoice.customerId) return "The selected invoice controls the customer. Clear the invoice to choose a different customer.";
    const remainingBalance = Number(invoice.dueAmount || 0);
    if (remainingBalance <= 0) return "This invoice is already fully paid.";
    if (Number(payment.amount) > remainingBalance) return `Payment amount cannot exceed the remaining invoice balance of ${moneyLabel(remainingBalance)}.`;
    const paidAfter = Number(invoice.paidAmount || 0) + Number(payment.amount);
    const statusAfter = invoiceStatusFromPaid(Number(invoice.total || 0), paidAfter);
    payment.customerId = invoice.customerId || null;
    payment.reference = payment.reference || invoice.invoiceNo;
    payment.notes = invoicePaymentNotes({
      automatic: false,
      customerName: invoice.customer?.name,
      invoiceId: invoice.id,
      invoiceNo: invoice.invoiceNo,
      amount: Number(payment.amount),
      method: payment.method,
      productsSummary: invoiceItemsSummary(invoice.items || []),
      status: statusAfter,
      remainingBalance: Math.max(Number(invoice.total || 0) - paidAfter, 0),
      userNotes: payment.notes
    });
  }
  if (payment.purchaseId) {
    const purchase = await db.purchase.findFirst({ where: { id: payment.purchaseId, shopId }, select: { id: true, supplierId: true } });
    if (!purchase) return "Purchase not found.";
    payment.supplierId = payment.supplierId || purchase.supplierId;
  }
  if (payment.customerId && !(await db.customer.findFirst({ where: { id: payment.customerId, shopId }, select: { id: true } }))) return "Customer not found.";
  if (payment.supplierId && !(await db.supplier.findFirst({ where: { id: payment.supplierId, shopId }, select: { id: true } }))) return "Supplier not found.";
  if (payment.direction === "CUSTOMER_IN" && !payment.customerId && !payment.invoiceId) return "Customer payments need a customer or invoice.";
  if (payment.direction === "SUPPLIER_OUT" && !payment.supplierId && !payment.purchaseId) return "Supplier payouts need a supplier or purchase.";
  return null;
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "payments", "update")) return forbidden();
    const existing = await prisma.payment.findFirst({ where: { id: params.id, shopId: user.shopId }, include: { invoice: { select: { invoiceNo: true } } } });
    if (!existing) return notFound("Payment not found.");
    if (isAutomaticInvoicePayment(existing, existing.invoice?.invoiceNo)) return badRequest("Automatic invoice payments are controlled by the invoice. Edit the invoice paid amount instead.");
    const data = paymentUpdateSchema.parse(await request.json());
    const next = {
      direction: data.direction ?? existing.direction,
      method: data.method ?? existing.method,
      amount: data.amount ?? Number(existing.amount),
      customerId: data.customerId !== undefined ? data.customerId || null : existing.customerId,
      supplierId: data.supplierId !== undefined ? data.supplierId || null : existing.supplierId,
      invoiceId: data.invoiceId !== undefined ? data.invoiceId || null : existing.invoiceId,
      purchaseId: data.purchaseId !== undefined ? data.purchaseId || null : existing.purchaseId,
      paidAt: data.paidAt ?? existing.paidAt,
      reference: data.reference !== undefined ? data.reference : existing.reference,
      notes: data.notes !== undefined ? data.notes : existing.notes
    };
    if (!canUsePaymentDirection(user.role, next.direction)) return forbidden("Your role can record customer receipts only.");
    const payment = await prisma.$transaction(async (tx) => {
      await applyPaymentEffect(tx, user.shopId, existing, -1);
      const linkError = await resolvePaymentLinks(tx, user.shopId, next);
      if (linkError) throw new Error(linkError);
      const updated = await tx.payment.update({ where: { id: existing.id }, data: next, include });
      await applyPaymentEffect(tx, user.shopId, updated, 1);
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "PAYMENT_UPDATED", title: "Payment updated" } });
      return updated;
    });
    return NextResponse.json({ payment });
  } catch (e) {
    if (e instanceof Error && (e.message === WALK_IN_PAYMENT_REQUIRED_MESSAGE || isPaymentValidationError(e.message))) return badRequest(e.message);
    return apiError(e, "Unable to update payment.");
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "payments", "delete")) return forbidden();
    const payment = await prisma.payment.findFirst({ where: { id: params.id, shopId: user.shopId }, include: { invoice: { select: { invoiceNo: true } } } });
    if (!payment) return notFound("Payment not found.");
    if (isAutomaticInvoicePayment(payment, payment.invoice?.invoiceNo)) return badRequest("Automatic invoice payments are controlled by the invoice. Edit the invoice paid amount instead.");
    await prisma.$transaction(async (tx) => {
      await applyPaymentEffect(tx, user.shopId, payment, -1);
      await tx.payment.delete({ where: { id: payment.id } });
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "PAYMENT_DELETED", title: "Payment deleted" } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof Error && (e.message === WALK_IN_PAYMENT_REQUIRED_MESSAGE || isPaymentValidationError(e.message))) return badRequest(e.message);
    return apiError(e, "Unable to delete payment.");
  }
}
