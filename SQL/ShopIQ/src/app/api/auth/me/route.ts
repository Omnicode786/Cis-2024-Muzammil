import { getCurrentUser } from "@/lib/auth";
import { unauthorized } from "@/lib/api-response";
import { NextResponse } from "next/server";
export async function GET() { const user = await getCurrentUser(); if (!user) return unauthorized(); return NextResponse.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, shop: user.shop } }); }
