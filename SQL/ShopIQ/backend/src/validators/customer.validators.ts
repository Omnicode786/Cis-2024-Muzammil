import { z } from "zod";

export const createCustomerSchema = z.object({
  customerName: z.string().min(2).max(255),
  phoneNumber: z.string().min(6).max(30).optional().nullable(),
  address: z.string().max(1000).optional().nullable(),
  area: z.string().max(100).optional().nullable(),
  notes: z.string().max(1000).optional().nullable()
});

export const updateCustomerSchema = createCustomerSchema.partial().extend({
  isActive: z.boolean().optional()
});
