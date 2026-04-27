import { z } from "zod";

export const createBillingSchema = z.object({
  customerId: z.coerce.bigint(),
  billingDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  billingCategory: z.enum(["GROCERIES", "ELECTRICITY", "OTHER"]),
  description: z.string().max(1000).optional().nullable(),
  amount: z.coerce.number().positive(),
  billingMonth: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/)
});
