import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { createBillingSchema } from "../validators/billing.validators.js";
import { HttpError } from "../lib/http-error.js";

export const billingRouter = Router();

billingRouter.get("/", asyncHandler(async (req, res) => {
  const data = await prisma.customerBillingLog.findMany({
    where: { shopId: req.auth!.shopId },
    include: { customer: { select: { customerName: true } } },
    orderBy: { billingDate: "desc" }
  });

  res.json({ success: true, data: serializeBigInts(data) });
}));

billingRouter.post("/", validateBody(createBillingSchema), asyncHandler(async (req, res) => {
  const customer = await prisma.customer.findFirst({
    where: { customerId: req.body.customerId, shopId: req.auth!.shopId, isActive: true }
  });
  if (!customer) throw new HttpError(404, "Customer not found.");

  const created = await prisma.customerBillingLog.create({
    data: {
      shopId: req.auth!.shopId,
      customerId: req.body.customerId,
      billingDate: new Date(req.body.billingDate),
      billingCategory: req.body.billingCategory,
      description: req.body.description ?? null,
      amount: req.body.amount,
      billingMonth: req.body.billingMonth,
      createdByShopUserId: req.auth!.shopUserId
    },
    include: { customer: { select: { customerName: true } } }
  });

  res.status(201).json({ success: true, message: "Billing entry created successfully.", data: serializeBigInts(created) });
}));
