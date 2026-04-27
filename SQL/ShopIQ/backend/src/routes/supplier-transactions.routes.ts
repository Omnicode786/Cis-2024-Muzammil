import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { createSupplierTransactionSchema } from "../validators/supplier-transaction.validators.js";
import { HttpError } from "../lib/http-error.js";

export const supplierTransactionsRouter = Router();

supplierTransactionsRouter.get("/", asyncHandler(async (req, res) => {
  const data = await prisma.supplierTransactionLog.findMany({
    where: { shopId: req.auth!.shopId },
    include: { supplier: { select: { supplierName: true } } },
    orderBy: { transactionDate: "desc" }
  });
  res.json({ success: true, data: serializeBigInts(data) });
}));

supplierTransactionsRouter.post("/", validateBody(createSupplierTransactionSchema), asyncHandler(async (req, res) => {
  const supplier = await prisma.supplier.findFirst({
    where: { supplierId: req.body.supplierId, shopId: req.auth!.shopId, isActive: true }
  });
  if (!supplier) throw new HttpError(404, "Supplier not found.");

  const created = await prisma.supplierTransactionLog.create({
    data: {
      shopId: req.auth!.shopId,
      supplierId: req.body.supplierId,
      transactionDate: new Date(req.body.transactionDate),
      transactionType: req.body.transactionType,
      amount: req.body.amount,
      description: req.body.description ?? null,
      createdByShopUserId: req.auth!.shopUserId
    },
    include: { supplier: { select: { supplierName: true } } }
  });

  res.status(201).json({ success: true, message: "Supplier transaction recorded successfully.", data: serializeBigInts(created) });
}));
