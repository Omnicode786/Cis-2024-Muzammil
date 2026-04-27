import { z } from "zod";

export const createPaymentSchema = z.object({
  customerId: z.coerce.bigint(),
  paymentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  amountPaid: z.coerce.number().positive(),
  paymentMethod: z.enum(["CASH", "BANK", "WALLET", "CARD"]),
  referenceNo: z.string().max(100).optional().nullable(),
  remarks: z.string().max(1000).optional().nullable()
});
