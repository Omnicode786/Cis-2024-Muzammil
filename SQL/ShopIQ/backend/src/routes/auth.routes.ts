import { Router } from "express";
import { asyncHandler } from "../lib/async-handler.js";
import { serializeBigInts } from "../lib/serialize.js";
import { requireAuth } from "../middlewares/auth.js";
import { validateBody } from "../middlewares/validate.js";
import { authRateLimiter } from "../middlewares/rate-limit.js";
import { loginSchema, registerShopSchema } from "../validators/auth.validators.js";
import {
  createSession,
  getCurrentUser,
  login,
  logout,
  registerShop,
  rotateSession
} from "../services/auth.service.js";

export const authRouter = Router();

authRouter.post("/register-shop", authRateLimiter, validateBody(registerShopSchema), asyncHandler(async (req, res) => {
  const user = await registerShop(req.body);
  await createSession(user, req, res);
  res.status(201).json({ success: true, message: "Shop and admin account created successfully.", data: serializeBigInts(user) });
}));

authRouter.post("/login", authRateLimiter, validateBody(loginSchema), asyncHandler(async (req, res) => {
  const user = await login(req.body);
  await createSession(user, req, res);
  res.json({ success: true, message: "Login successful.", data: serializeBigInts(user) });
}));

authRouter.post("/refresh", authRateLimiter, asyncHandler(async (req, res) => {
  const user = await rotateSession(req, res);
  res.json({ success: true, message: "Session refreshed.", data: serializeBigInts(user) });
}));

authRouter.post("/logout", asyncHandler(async (req, res) => {
  await logout(req, res);
  res.json({ success: true, message: "Logged out successfully." });
}));

authRouter.get("/me", requireAuth, asyncHandler(async (req, res) => {
  const user = await getCurrentUser(req.auth!.shopUserId);
  res.json({ success: true, data: serializeBigInts(user) });
}));
