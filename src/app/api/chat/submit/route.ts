import { NextResponse } from "next/server";
import { submitAddressUpdate } from "@/lib/mock-data";
import { logAudit } from "@/lib/audit";

const UK_POSTCODE_RE = /^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i;

function validateFields(body: Record<string, unknown>): string | null {
  const street = typeof body.street === "string" ? body.street.trim() : "";
  const city = typeof body.city === "string" ? body.city.trim() : "";
  const postcode = typeof body.postcode === "string" ? body.postcode.trim() : "";
  const reason = typeof body.reason === "string" ? body.reason : "";
  const notes = typeof body.notes === "string" ? body.notes : "";

  if (!street || street.length > 100) return "Street address is required and must be under 100 characters.";
  if (!city || city.length > 100) return "City is required and must be under 100 characters.";
  if (!postcode || !UK_POSTCODE_RE.test(postcode)) return "A valid UK postcode is required.";
  if (reason.length > 500) return "Reason must be under 500 characters.";
  if (notes.length > 500) return "Notes must be under 500 characters.";
  return null;
}

export async function POST(request: Request) {
  const body = await request.json();

  // Guardrail G-05: field validation
  const validationError = validateFields(body);
  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 422 });
  }

  // Guardrail G-04: Experian score threshold — block approvals below minimum score
  if (body.action === "approved") {
    const score = Number(body.experianScore ?? 0);
    if (score < 5) {
      logAudit({
        persona: body.updatedBy || "unknown",
        action: "Approval blocked — Experian score below threshold",
        toolCalled: "submit_address_update",
        customerId: body.customerId,
        guardrailTriggered: true,
        detail: `G-04: Score ${score} < 5 threshold. Address: ${body.street}, ${body.city}, ${body.postcode}`,
      });
      return NextResponse.json(
        { error: `Approval blocked: Experian identity score (${score}/9) is below the minimum threshold of 5. Please amend or reject this change.` },
        { status: 422 }
      );
    }
  }

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
