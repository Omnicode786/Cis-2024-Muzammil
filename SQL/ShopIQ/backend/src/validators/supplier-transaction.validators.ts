import { z } from "zod";

export const createSupplierTransactionSchema = z.object({
  supplierId: z.coerce.bigint(),
  transactionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  transactionType: z.enum(["PURCHASE", "PAYMENT", "ADJUSTMENT", "BONUS", "RETURN"]),
  amount: z.coerce.number().positive(),
  description: z.string().max(1000).optional().nullable()
});
