import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { createPaymentSchema } from "../validators/payment.validators.js";
import { HttpError } from "../lib/http-error.js";

export const paymentsRouter = Router();

paymentsRouter.get("/", asyncHandler(async (req, res) => {
  const data = await prisma.paymentLog.findMany({
    where: { shopId: req.auth!.shopId },
    include: { customer: { select: { customerName: true } } },
    orderBy: { paymentDate: "desc" }
  });
  res.json({ success: true, data: serializeBigInts(data) });
}));

paymentsRouter.post("/", validateBody(createPaymentSchema), asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { customerId: req.body.customerId, shopId: req.auth!.shopId, isActive: true }
  });
  if (!customer) throw new HttpError(404, "Customer not found.");

  const created = await prisma.paymentLog.create({
    data: {
      shopId: req.auth!.shopId,
      customerId: req.body.customerId,
      paymentDate: new Date(req.body.paymentDate),
      amountPaid: req.body.amountPaid,
      paymentMethod: req.body.paymentMethod,
      referenceNo: req.body.referenceNo ?? null,
      remarks: req.body.remarks ?? null,
      createdByShopUserId: req.auth!.shopUserId
    },
    include: { customer: { select: { customerName: true } } }
  });

  res.status(201).json({ success: true, message: "Payment recorded successfully.", data: serializeBigInts(created) });
}));
