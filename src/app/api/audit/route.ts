import { NextResponse } from "next/server";
import { getAuditLog } from "@/lib/audit";

export async function GET() {
  return NextResponse.json(getAuditLog());
}
