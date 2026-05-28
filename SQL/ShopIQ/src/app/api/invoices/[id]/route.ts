import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { apiError, badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { can } from "@/lib/permissions";
import { WALK_IN_PAYMENT_REQUIRED_MESSAGE, walkInInvoiceHasDue } from "@/lib/invoice-rules";
import { invoiceStatusFromPaid, isAutomaticInvoicePayment, moneyLabel, syncAutomaticInvoicePayment } from "@/lib/payment-workflow";
import { prisma } from "@/lib/prisma";
import { money, nullableId, nullableText } from "@/lib/validation";

const invoiceUpdateSchema = z.object({
  customerId: nullableId,
  status: z.enum(["DRAFT", "PAID", "PARTIAL", "UNPAID", "CANCELLED"]).optional(),
  discount: money.optional(),
  tax: money.optional(),
  loyaltyDiscount: money.optional(),
  paidAmount: money.optional(),
  paymentMethod: z.enum(["CASH", "BANK_TRANSFER", "CARD", "JAZZCASH", "EASYPAISA", "CHEQUE", "OTHER"]).optional(),
  total: money.optional(),
  dueDate: z.coerce.date().optional(),
  cashierCounter: nullableText(80),
  channel: nullableText(80),
  promoCode: nullableText(80),
  receiptNo: nullableText(100),
  paymentBreakdown: z.record(z.any()).nullable().optional(),
  notes: nullableText(600)
});

async function cancelInvoice(user: { id: string; shopId: string }, invoiceId: string) {
  const existing = await prisma.invoice.findFirst({ where: { id: invoiceId, shopId: user.shopId }, include: { items: true } });
  if (!existing) return notFound("Invoice not found.");
  if (existing.status === "CANCELLED") return NextResponse.json({ ok: true });
  await prisma.$transaction(async (tx) => {
    if (existing.customerId && Number(existing.dueAmount) > 0) await tx.customer.update({ where: { id: existing.customerId }, data: { balance: { decrement: Number(existing.dueAmount) } } });
    const runningStock = new Map<string, number>();
    for (const item of existing.items) {
      const product = await tx.product.findUnique({ where: { id: item.productId } });
      if (!product) continue;
      const beforeQty = runningStock.get(item.productId) ?? product.stockQty;
      const afterQty = beforeQty + item.quantity;
      runningStock.set(item.productId, afterQty);
      await tx.product.update({ where: { id: item.productId }, data: { stockQty: { increment: item.quantity } } });
      await tx.stockMovement.create({ data: { shopId: user.shopId, productId: item.productId, userId: user.id, type: "RETURN_IN", quantity: item.quantity, beforeQty, afterQty, reference: existing.invoiceNo, notes: "Invoice cancellation stock reversal" } });
    }
    await tx.invoice.update({ where: { id: existing.id }, data: { status: "CANCELLED", dueAmount: 0 } });
    await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "INVOICE_CANCELLED", title: `Invoice ${existing.invoiceNo} cancelled` } });
  });
  return NextResponse.json({ ok: true });
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "invoices", "update")) return forbidden();
    const existing = await prisma.invoice.findFirst({
      where: { id: params.id, shopId: user.shopId },
      include: {
        payments: { where: { direction: "CUSTOMER_IN" }, select: { id: true, amount: true, reference: true, notes: true } }
      }
    });
    const parsed = invoiceUpdateSchema.parse(await request.json());
    const { paymentMethod, ...data } = parsed;
    if (!existing) return notFound("Invoice not found.");
    if (data.status === "CANCELLED") return cancelInvoice(user, params.id);
    if (existing.status === "CANCELLED") return badRequest("Cancelled invoices cannot be edited.");
    // Customer validation moved down to after nextDue calculation
    const nextTotal = Number(data.total ?? existing.total);
    const manualPaid = existing.payments
      .filter((payment) => !isAutomaticInvoicePayment(payment, existing.invoiceNo))
      .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
    if (manualPaid > nextTotal) return badRequest(`Invoice total cannot be lower than ${moneyLabel(manualPaid)} already recorded through payments.`);
    const requestedPaid = Math.min(Number(data.paidAmount ?? existing.paidAmount), nextTotal);
    if (requestedPaid < manualPaid) return badRequest(`Paid amount cannot be lower than ${moneyLabel(manualPaid)} already recorded through manual payments.`);
    const nextAutoPaid = Math.max(requestedPaid - manualPaid, 0);
    const nextPaid = Math.min(manualPaid + nextAutoPaid, nextTotal);
    const nextDue = Math.max(nextTotal - nextPaid, 0);
    const nextCustomerId = data.customerId !== undefined ? data.customerId || null : existing.customerId;
    const nextStatus = invoiceStatusFromPaid(nextTotal, nextPaid);
    const nextPaymentBreakdown =
      data.paymentBreakdown !== undefined
        ? data.paymentBreakdown
        : paymentMethod && nextAutoPaid > 0
          ? { [paymentMethod]: nextAutoPaid }
          : nextPaid <= 0 || (paymentMethod && nextAutoPaid <= 0)
            ? null
            : undefined;
    if (walkInInvoiceHasDue(nextCustomerId, nextTotal, nextPaid, nextStatus)) return badRequest(WALK_IN_PAYMENT_REQUIRED_MESSAGE);
    
    if (nextCustomerId) {
      const customer = await prisma.customer.findFirst({ where: { id: nextCustomerId, shopId: user.shopId }, select: { id: true, balance: true, creditLimit: true } });
      if (!customer) return notFound("Customer not found.");
      
      if (nextDue > 0 && Number(customer.creditLimit) > 0) {
        const baseBalance = nextCustomerId === existing.customerId 
          ? Number(customer.balance) - Number(existing.dueAmount) 
          : Number(customer.balance);
          
        if (baseBalance + nextDue > Number(customer.creditLimit)) {
          return badRequest(`Credit limit exceeded. The customer's projected balance is PKR ${(baseBalance + nextDue).toLocaleString()} and their credit limit is PKR ${Number(customer.creditLimit).toLocaleString()}.`);
        }
      }
    }
    const updateData = {
      ...data,
      customerId: nextCustomerId,
      paidAmount: nextPaid,
      dueAmount: nextDue,
      status: nextStatus,
      paymentBreakdown: nextPaymentBreakdown === null ? Prisma.JsonNull : nextPaymentBreakdown
    };
    const invoice = await prisma.$transaction(async (tx) => {
      if (existing.customerId && Number(existing.dueAmount) > 0) await tx.customer.update({ where: { id: existing.customerId }, data: { balance: { decrement: Number(existing.dueAmount) } } });
      if (nextCustomerId && nextDue > 0 && updateData.status !== "CANCELLED") await tx.customer.update({ where: { id: nextCustomerId }, data: { balance: { increment: nextDue } } });
      const updated = await tx.invoice.update({ where: { id: existing.id }, data: updateData, include: { customer: true, items: { include: { product: true } } } });
      await syncAutomaticInvoicePayment(tx, {
        shopId: user.shopId,
        invoice: updated,
        amount: nextAutoPaid,
        invoicePaidAmount: nextPaid,
        method: paymentMethod,
        createdById: user.id
      });
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "INVOICE_UPDATED", title: `Invoice ${updated.invoiceNo} updated` } });
      return updated;
    });
    return NextResponse.json({ invoice });
  } catch (e) {
    return apiError(e, "Unable to update invoice.");
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "invoices", "delete")) return forbidden();
    return cancelInvoice(user, params.id);
  } catch (e) {
    return apiError(e, "Unable to cancel invoice.");
  }
}
