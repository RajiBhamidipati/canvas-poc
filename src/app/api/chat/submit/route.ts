import { NextResponse } from "next/server";
import { submitAddressUpdate } from "@/lib/mock-data";
import { logAudit } from "@/lib/audit";

export async function POST(request: Request) {
  const body = await request.json();

  const result = submitAddressUpdate(body);

  logAudit({
    persona: body.updatedBy || "unknown",
    action: body.action === "rejected"
      ? "Rejected address change"
      : body.action === "approved"
      ? "Approved address change"
      : "Submitted address update",
    toolCalled: "submit_address_update",
    customerId: body.customerId,
    guardrailTriggered: false,
    detail: `${body.street}, ${body.city}, ${body.postcode}`,
  });

  return NextResponse.json(result);
}
