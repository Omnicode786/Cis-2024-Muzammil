import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { prisma } from "../lib/prisma.js";
import { hashPassword } from "../lib/password.js";
import { validateBody } from "../middlewares/validate.js";
import { requireRole } from "../middlewares/require-role.js";
import { createUserSchema, updateUserSchema } from "../validators/staff.validators.js";
import { HttpError } from "../lib/http-error.js";

export const staffRouter = Router();

staffRouter.get("/", asyncHandler(async (req, res) => {
  const data = await prisma.shopUser.findMany({
    where: { shopId: req.auth!.shopId },
    orderBy: [{ userType: "asc" }, { createdAt: "desc" }]
  });
  res.json({ success: true, data: serializeBigInts(data) });
}));

staffRouter.post("/", requireRole(["ADMIN"]), validateBody(createUserSchema), asyncHandler(async (req, res) => {
  const data = req.body;
  const passwordHash = await hashPassword(data.password);

  const created = await prisma.shopUser.create({
    data: {
      shopId: req.auth!.shopId,
      fullName: data.fullName,
      email: data.email,
      phoneNumber: data.phoneNumber ?? null,
      passwordHash,
      userType: data.userType,
      staffDesignation: data.userType === "ADMIN" ? null : data.staffDesignation,
      isPrimaryContact: data.isPrimaryContact ?? false
    }
  });

  res.status(201).json({ success: true, message: "User created successfully.", data: serializeBigInts(created) });
}));

staffRouter.patch("/:shopUserId", requireRole(["ADMIN"]), validateBody(updateUserSchema), asyncHandler(async (req, res) => {
  const targetId = BigInt(req.params.shopUserId);

  const existing = await prisma.shopUser.findFirst({
    where: { shopUserId: targetId, shopId: req.auth!.shopId }
  });

  if (!existing) throw new HttpError(404, "User not found.");

  const payload = req.body;
  const nextUserType = payload.userType ?? existing.userType;
  const nextDesignation = nextUserType === "ADMIN" ? null : payload.staffDesignation ?? existing.staffDesignation ?? "OTHER";

  const updated = await prisma.shopUser.update({
    where: { shopUserId: targetId },
    data: {
      fullName: payload.fullName ?? existing.fullName,
      phoneNumber: payload.phoneNumber ?? existing.phoneNumber,
      isPrimaryContact: payload.isPrimaryContact ?? existing.isPrimaryContact,
      isActive: payload.isActive ?? existing.isActive,
      userType: nextUserType,
      staffDesignation: nextDesignation
    }
  });

  res.json({ success: true, message: "User updated successfully.", data: serializeBigInts(updated) });
}));
