import { z } from "zod";

export const registerShopSchema = z.object({
  shopName: z.string().min(2).max(255),
  legalName: z.string().max(255).optional().nullable(),
  shopCode: z.string().min(2).max(100),
  shopEmail: z.string().email().optional().nullable(),
  shopPhoneNumber: z.string().min(6).max(30).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  adminFullName: z.string().min(2).max(255),
  adminEmail: z.string().email(),
  adminPhoneNumber: z.string().min(6).max(30).optional().nullable(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});
