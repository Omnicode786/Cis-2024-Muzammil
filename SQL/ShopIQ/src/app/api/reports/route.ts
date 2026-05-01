import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { unauthorized } from "@/lib/api-response";
import { getDashboardSnapshot } from "@/lib/data";
export async function GET(){const user=await getCurrentUser(); if(!user)return unauthorized(); return NextResponse.json(await getDashboardSnapshot(user.shopId));}
