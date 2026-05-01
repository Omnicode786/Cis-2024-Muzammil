import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { apiError, badRequest, forbidden, notFound, unauthorized } from "@/lib/api-response";
import { can } from "@/lib/permissions";
import { prisma } from "@/lib/prisma";
import { optionalText, requiredText } from "@/lib/validation";

const selectUser = { id: true, name: true, email: true, role: true, status: true, designation: true, phone: true, createdAt: true } as const;

const staffUpdateSchema = z.object({
  name: requiredText("Name").optional(),
  email: z.string().trim().email().toLowerCase().optional(),
  password: z.preprocess((value) => (String(value || "").trim() ? value : undefined), z.string().min(8).optional()),
  role: z.enum(["ADMIN", "MANAGER", "STAFF"]).optional(),
  status: z.enum(["ACTIVE", "INVITED", "SUSPENDED"]).optional(),
  designation: optionalText(120),
  phone: optionalText(40)
});

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "staff", "update")) return forbidden();
    const target = await prisma.user.findFirst({ where: { id: params.id, shopId: user.shopId } });
    if (!target) return notFound("Team member not found.");
    const data = staffUpdateSchema.parse(await request.json());
    if (user.role === "MANAGER" && (target.role !== "STAFF" || data.role !== undefined)) return forbidden();
    const updateData: Record<string, unknown> = { ...data };
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, 12);
    }
    delete updateData.password;
    const staff = await prisma.user.update({ where: { id: params.id }, data: updateData, select: selectUser });
    await prisma.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "STAFF_UPDATED", title: `Team member updated: ${staff.name}` } });
    return NextResponse.json({ staff });
  } catch (e) {
    return apiError(e, "Unable to update team member.");
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getCurrentUser();
    if (!user) return unauthorized();
    if (!can(user.role, "staff", "delete")) return forbidden();
    if (user.id === params.id) return badRequest("You cannot suspend your own account.");
    const target = await prisma.user.findFirst({ where: { id: params.id, shopId: user.shopId } });
    if (!target) return notFound("Team member not found.");
    if (user.role === "MANAGER" && target.role !== "STAFF") return forbidden();
    const staff = await prisma.user.update({ where: { id: params.id }, data: { status: "SUSPENDED" }, select: selectUser });
    await prisma.activityLog.create({ data: { shopId: user.shopId, userId: user.id, type: "STAFF_SUSPENDED", title: `Team member suspended: ${staff.name}` } });
    return NextResponse.json({ staff });
  } catch (e) {
    return apiError(e, "Unable to suspend team member.");
  }
}
