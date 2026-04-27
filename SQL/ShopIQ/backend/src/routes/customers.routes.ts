import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";
import { validateBody } from "../middlewares/validate.js";
import { createCustomerSchema, updateCustomerSchema } from "../validators/customer.validators.js";
import { HttpError } from "../lib/http-error.js";

export const customersRouter = Router();

customersRouter.get("/", asyncHandler(async (req, res) => {
  const customers = await prisma.customer.findMany({
    where: { shopId: req.auth!.shopId },
    orderBy: { createdAt: "desc" }
  });
  res.json({ success: true, data: serializeBigInts(customers) });
}));

customersRouter.post("/", validateBody(createCustomerSchema), asyncHandler(async (req, res) => {
  const customer = await prisma.customer.create({
    data: {
      shopId: req.auth!.shopId,
      customerName: req.body.customerName,
      phoneNumber: req.body.phoneNumber ?? null,
      address: req.body.address ?? null,
      area: req.body.area ?? null,
      notes: req.body.notes ?? null,
      createdByShopUserId: req.auth!.shopUserId
    }
  });

  res.status(201).json({ success: true, message: "Customer created successfully.", data: serializeBigInts(customer) });
}));

customersRouter.patch("/:customerId", validateBody(updateCustomerSchema), asyncHandler(async (req, res) => {
  const customerId = BigInt(req.params.customerId);
  const existing = await prisma.customer.findFirst({ where: { customerId, shopId: req.auth!.shopId } });
  if (!existing) throw new HttpError(404, "Customer not found.");

  const updated = await prisma.customer.update({
    where: { customerId },
    data: {
      customerName: req.body.customerName ?? existing.customerName,
      phoneNumber: req.body.phoneNumber ?? existing.phoneNumber,
      address: req.body.address ?? existing.address,
      area: req.body.area ?? existing.area,
      notes: req.body.notes ?? existing.notes,
      isActive: req.body.isActive ?? existing.isActive
    }
  });

  res.json({ success: true, message: "Customer updated successfully.", data: serializeBigInts(updated) });
}));
