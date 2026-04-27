import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { createSupplierSchema, updateSupplierSchema } from "../validators/supplier.validators.js";
import { HttpError } from "../lib/http-error.js";

export const suppliersRouter = Router();

suppliersRouter.get("/", asyncHandler(async (req, res) => {
  const suppliers = await prisma.supplier.findMany({
    where: { shopId: req.auth!.shopId },
    orderBy: { createdAt: "desc" }
  });

  res.json({ success: true, data: serializeBigInts(suppliers) });
}));

suppliersRouter.post("/", validateBody(createSupplierSchema), asyncHandler(async (req, res) => {
  const supplier = await prisma.supplier.create({
    data: {
      shopId: req.auth!.shopId,
      supplierName: req.body.supplierName,
      phoneNumber: req.body.phoneNumber ?? null,
      paymentType: req.body.paymentType,
      creditDays: req.body.paymentType === "CREDIT" ? req.body.creditDays ?? null : null,
      notes: req.body.notes ?? null,
      createdByShopUserId: req.auth!.shopUserId
    }
  });

  res.status(201).json({ success: true, message: "Supplier created successfully.", data: serializeBigInts(supplier) });
}));

suppliersRouter.patch("/:supplierId", validateBody(updateSupplierSchema), asyncHandler(async (req, res) => {
  const supplierId = BigInt(req.params.supplierId);
  const existing = await prisma.supplier.findFirst({ where: { supplierId, shopId: req.auth!.shopId } });
  if (!existing) throw new HttpError(404, "Supplier not found.");

  const nextPaymentType = req.body.paymentType ?? existing.paymentType;

  const updated = await prisma.supplier.update({
    where: { supplierId },
    data: {
      supplierName: req.body.supplierName ?? existing.supplierName,
      phoneNumber: req.body.phoneNumber ?? existing.phoneNumber,
      paymentType: nextPaymentType,
      creditDays: nextPaymentType === "CREDIT" ? req.body.creditDays ?? existing.creditDays : null,
      notes: req.body.notes ?? existing.notes,
      isActive: req.body.isActive ?? existing.isActive
    }
  });

  res.json({ success: true, message: "Supplier updated successfully.", data: serializeBigInts(updated) });
}));
