import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { apiError, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { money, optionalId, optionalText } from "@/lib/validation";

const invoiceUpdateSchema = z.object({
  customerId: optionalId,
  status: z.enum(["DRAFT", "PAID", "PARTIAL", "UNPAID", "CANCELLED"]).optional(),
  discount: money.optional(),
  tax: money.optional(),
  paidAmount: money.optional(),
  total: money.optional(),
  dueDate: z.coerce.date().optional(),
  notes: optionalText(600)
});

function invoiceStatus(total: number, paid: number) {
  return paid >= total ? "PAID" : paid > 0 ? "PARTIAL" : "UNPAID";
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "invoices", "update")) return forbidden();
    const existing = await prisma.invoice.findFirst({ where: { id: params.id, shopId: user.shopId } });
    if (!existing) return notFound("Invoice not found.");
    const data = invoiceUpdateSchema.parse(await request.json());
    if (data.customerId) {
      const customer = await prisma.customer.findFirst({ where: { id: data.customerId, shopId: user.shopId }, select: { id: true } });
      if (!customer) return notFound("Customer not found.");
    }
    const nextTotal = Number(data.total ?? existing.total);
    const nextPaid = Math.min(Number(data.paidAmount ?? existing.paidAmount), nextTotal);
    const nextDue = Math.max(nextTotal - nextPaid, 0);
    const nextCustomerId = data.customerId !== undefined ? data.customerId || null : existing.customerId;
    const updateData = { ...data, customerId: nextCustomerId, paidAmount: nextPaid, dueAmount: nextDue, status: data.status || invoiceStatus(nextTotal, nextPaid) };
    const invoice = await prisma.$transaction(async (tx) => {
      if (existing.customerId && Number(existing.dueAmount) > 0) await tx.customer.update({ where: { id: existing.customerId }, data: { balance: { decrement: Number(existing.dueAmount) } } });
      if (nextCustomerId && nextDue > 0 && updateData.status !== "CANCELLED") await tx.customer.update({ where: { id: nextCustomerId }, data: { balance: { increment: nextDue } } });
      const updated = await tx.invoice.update({ where: { id: existing.id }, data: updateData, include: { customer: true, items: { include: { product: true } } } });
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
    const existing = await prisma.invoice.findFirst({ where: { id: params.id, shopId: user.shopId }, include: { items: true } });
    if (!existing) return notFound("Invoice not found.");
    if (existing.status === "CANCELLED") return NextResponse.json({ ok: true });
    await prisma.$transaction(async (tx) => {
      if (existing.customerId && Number(existing.dueAmount) > 0) await tx.customer.update({ where: { id: existing.customerId }, data: { balance: { decrement: Number(existing.dueAmount) } } });
      for (const item of existing.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        await tx.product.update({ where: { id: item.productId }, data: { stockQty: { increment: item.quantity } } });
        await tx.stockMovement.create({ data: { shopId: user.shopId, productId: item.productId, userId: user.id, type: "RETURN_IN", quantity: item.quantity, beforeQty: product.stockQty, afterQty: product.stockQty + item.quantity, reference: existing.invoiceNo, notes: "Invoice cancellation stock reversal" } });
      }
      await tx.invoice.update({ where: { id: existing.id }, data: { status: "CANCELLED", dueAmount: 0 } });
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "INVOICE_CANCELLED", title: `Invoice ${existing.invoiceNo} cancelled` } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e, "Unable to cancel invoice.");
  }
}
