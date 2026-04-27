import { z } from "zod";

export const createUserSchema = z
  .object({
    fullName: z.string().min(2).max(255),
    email: z.string().email(),
    phoneNumber: z.string().min(6).max(30).optional().nullable(),
    password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/),
    userType: z.enum(["ADMIN", "STAFF"]),
    staffDesignation: z.enum(["MANAGER", "CASHIER", "OTHER"]).optional().nullable(),
    isPrimaryContact: z.boolean().optional()
  })
  .superRefine((value, ctx) => {
    if (value.userType === "ADMIN" && value.staffDesignation != null) {
      ctx.addIssue({ code: "custom", path: ["staffDesignation"], message: "Admins must not have a staff designation." });
    }
    if (value.userType === "STAFF" && value.staffDesignation == null) {
      ctx.addIssue({ code: "custom", path: ["staffDesignation"], message: "Staff members require a staff designation." });
    }
  });

export const updateUserSchema = z.object({
  fullName: z.string().min(2).max(255).optional(),
  phoneNumber: z.string().min(6).max(30).optional().nullable(),
  userType: z.enum(["ADMIN", "STAFF"]).optional(),
  staffDesignation: z.enum(["MANAGER", "CASHIER", "OTHER"]).optional().nullable(),
  isPrimaryContact: z.boolean().optional(),
  isActive: z.boolean().optional()
});
