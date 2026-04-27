import { z } from "zod";

export const createSupplierSchema = z
  .object({
    supplierName: z.string().min(2).max(255),
    phoneNumber: z.string().min(6).max(30).optional().nullable(),
    paymentType: z.enum(["CASH", "CREDIT"]),
    creditDays: z.coerce.number().int().min(0).optional().nullable(),
    notes: z.string().max(1000).optional().nullable()
  })
  .superRefine((value, ctx) => {
    if (value.paymentType === "CASH" && value.creditDays != null) {
      ctx.addIssue({ code: "custom", path: ["creditDays"], message: "Cash suppliers must not have credit days." });
    }
    if (value.paymentType === "CREDIT" && value.creditDays == null) {
      ctx.addIssue({ code: "custom", path: ["creditDays"], message: "Credit suppliers require credit days." });
    }
  });

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  isActive: z.boolean().optional()
});
