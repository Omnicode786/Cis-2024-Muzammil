import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { apiError, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { money, optionalId, optionalText } from "@/lib/validation";

const purchaseUpdateSchema = z.object({
  supplierId: optionalId,
  status: z.enum(["ORDERED", "RECEIVED", "PARTIAL", "CANCELLED"]).optional(),
  total: money.optional(),
  paidAmount: money.optional(),
  purchaseDate: z.coerce.date().optional(),
  notes: optionalText(600)
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "purchases", "update")) return forbidden();
    const existing = await prisma.purchase.findFirst({ where: { id: params.id, shopId: user.shopId } });
    if (!existing) return notFound("Purchase not found.");
    const data = purchaseUpdateSchema.parse(await request.json());
    if (data.supplierId) {
      const supplier = await prisma.supplier.findFirst({ where: { id: data.supplierId, shopId: user.shopId }, select: { id: true } });
      if (!supplier) return notFound("Supplier not found.");
    }
    const nextTotal = Number(data.total ?? existing.total);
    const nextPaid = Math.min(Number(data.paidAmount ?? existing.paidAmount), nextTotal);
    const nextDue = Math.max(nextTotal - nextPaid, 0);
    const nextSupplierId = data.supplierId !== undefined ? data.supplierId || null : existing.supplierId;
    const updateData = { ...data, supplierId: nextSupplierId, subtotal: nextTotal, total: nextTotal, paidAmount: nextPaid, dueAmount: nextDue };
    const purchase = await prisma.$transaction(async (tx) => {
      if (existing.supplierId && Number(existing.dueAmount) > 0) await tx.supplier.update({ where: { id: existing.supplierId }, data: { balance: { decrement: Number(existing.dueAmount) } } });
      if (nextSupplierId && nextDue > 0 && updateData.status !== "CANCELLED") await tx.supplier.update({ where: { id: nextSupplierId }, data: { balance: { increment: nextDue } } });
      const updated = await tx.purchase.update({ where: { id: existing.id }, data: updateData, include: { supplier: true, items: { include: { product: true } } } });
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "PURCHASE_UPDATED", title: `Purchase ${updated.purchaseNo} updated` } });
      return updated;
    });
    return NextResponse.json({ purchase });
  } catch (e) {
    return apiError(e, "Unable to update purchase.");
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "purchases", "delete")) return forbidden();
    const existing = await prisma.purchase.findFirst({ where: { id: params.id, shopId: user.shopId }, include: { items: true } });
    if (!existing) return notFound("Purchase not found.");
    if (existing.status === "CANCELLED") return NextResponse.json({ ok: true });
    await prisma.$transaction(async (tx) => {
      if (existing.supplierId && Number(existing.dueAmount) > 0) await tx.supplier.update({ where: { id: existing.supplierId }, data: { balance: { decrement: Number(existing.dueAmount) } } });
      for (const item of existing.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) continue;
        await tx.product.update({ where: { id: item.productId }, data: { stockQty: { decrement: item.quantity } } });
        await tx.stockMovement.create({ data: { shopId: user.shopId, productId: item.productId, userId: user.id, type: "RETURN_OUT", quantity: -item.quantity, beforeQty: product.stockQty, afterQty: product.stockQty - item.quantity, reference: existing.purchaseNo, notes: "Purchase cancellation stock reversal" } });
      }
      await tx.purchase.update({ where: { id: existing.id }, data: { status: "CANCELLED", dueAmount: 0 } });
      await tx.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "PURCHASE_CANCELLED", title: `Purchase ${existing.purchaseNo} cancelled` } });
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiError(e, "Unable to cancel purchase.");
  }
}
