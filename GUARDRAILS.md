# Canvas — Guardrails Reference

This document describes every guardrail enforced by the Canvas POC, the layer at which it is enforced, and how to verify it is working.

Canvas uses a **defence-in-depth** approach: guardrails are applied at three independent layers so that a failure at any one layer does not bypass the control.

---

## Enforcement Layers

```
Layer 1 — System Prompt (LLM)
  Claude is instructed not to call certain tools for certain personas.
  Weakest layer: can theoretically be overridden by a prompt injection attack.

Layer 2 — Tool execute() function (Server)
  Each render tool validates the persona parameter before executing.
  Claude must explicitly declare the persona; the server rejects mismatches.
  Independent of the system prompt — enforced in TypeScript, not in the LLM.

Layer 3 — Submit endpoint (Server)
  The address submission API enforces data-quality and risk controls
  regardless of what the client sends.
```

---

## Guardrail Inventory

| ID | Name | Description | Trigger | Enforcement Layer | Audit Outcome |
|----|------|-------------|---------|-------------------|---------------|
| G-01 | Agent cannot approve | An agent persona cannot call the approval/review tool | Agent calls `render_approval_view` | System prompt + `execute()` check | `guardrailTriggered: true` |
| G-02 | Manager cannot edit addresses | A manager persona cannot call the address form tool | Manager calls `render_address_form` | System prompt + `execute()` check | `guardrailTriggered: true` |
| G-03 | Customer fetch before render | Customer data must be fetched before any UI is rendered | Any render tool called; `fetch_customer` must precede it | System prompt instruction | Normal fetch log |
| G-04 | Experian score threshold | Address changes with a score below 5/9 cannot be approved | Approval action submitted with `experianScore < 5` | Submit endpoint (server-side) | `guardrailTriggered: true` + HTTP 422 |
| G-05 | Address field validation | Submitted address fields must be well-formed | Invalid postcode, empty street/city, oversized notes | Submit endpoint (server-side) | HTTP 422 with field error |
| G-06 | Rate limiting | Prevents abuse of the Claude API endpoint | More than 20 requests per minute from a single IP | API route (server-side) | HTTP 429 |

---

## G-01 — Agent Cannot Approve (Maker-Checker)

**Policy:** Front-line agents initiate changes; case managers approve them. No single user can both submit and approve the same change.

**What happens when triggered:**
- Claude explains the maker-checker policy in the chat
- `render_approval_view.execute()` returns an error payload instead of rendering the component
- The audit log records the blocked attempt with `guardrailTriggered: true`

**Implementation:**
```typescript
// src/app/api/chat/route.ts — render_approval_view execute()
if (persona !== "manager") {
  logAudit({ ..., guardrailTriggered: true, detail: "G-02: Agent persona attempted to call manager-only tool" });
  return { error: "Access denied. Approvals require a case manager...", _audit: { guardrailTriggered: true } };
}
```

**Test prompt:** `"I'm Sarah, an agent. I want to approve the pending address change for CUST-123."`

---

## G-02 — Manager Cannot Directly Edit Addresses

**Policy:** Managers review and govern changes proposed by agents. They cannot directly enter a new address; they can only approve, amend, or reject a proposed change.

**What happens when triggered:**
- Claude explains that direct edits are made by front-line agents
- `render_address_form.execute()` returns an error payload
- The audit log records the blocked attempt

**Implementation:**
```typescript
// src/app/api/chat/route.ts — render_address_form execute()
if (persona !== "agent") {
  logAudit({ ..., guardrailTriggered: true, detail: "G-01: Manager persona attempted to call agent-only tool" });
  return { error: "Access denied. The address form is restricted to front-line agents...", _audit: { guardrailTriggered: true } };
}
```

**Test prompt:** `"I'm James, a case manager. Update the customer's address to 42 Oak Lane, Bristol."`

---

## G-03 — Customer Data Fetch Before Render

**Policy:** No UI component may be rendered without first fetching current customer data. This ensures the UI always reflects the live record, not stale context.

**What happens:** Claude is instructed in the system prompt to always call `fetch_customer` as step one. The `maxSteps: 5` setting allows the multi-step chain (fetch → render) to complete automatically.

**Note:** This guardrail is currently enforced at the prompt layer only. A production implementation would track whether `fetch_customer` was called within the same request chain before allowing render tools to execute.

---

## G-04 — Experian Score Threshold

**Policy:** Address changes with an Experian identity verification score below 5 out of 9 represent insufficient address confidence and cannot be approved. The manager must amend the address or reject the change.

**What happens when triggered:**
- The `/api/chat/submit` endpoint returns HTTP 422
- The error message includes the actual score and the threshold
- The audit log records `guardrailTriggered: true`
- The `ApprovalView` component surfaces this as an error state

**Implementation:**
```typescript
// src/app/api/chat/submit/route.ts
if (body.action === "approved") {
  const score = Number(body.experianScore ?? 0);
  if (score < 5) {
    logAudit({ ..., guardrailTriggered: true, detail: `G-04: Score ${score} < 5 threshold` });
    return NextResponse.json({ error: `Approval blocked: Experian score (${score}/9) is below threshold of 5.` }, { status: 422 });
  }
}
```

**Test:** Use the seed customer CUST-345 (Lisa Rodriguez) who has a pending change with Experian score 4.

---

## G-05 — Address Field Validation

**Policy:** All address fields must be well-formed before they can be stored. This prevents garbage data from entering the system and reduces risk of address fraud.

**Validation rules:**
- `street`: required, max 100 characters
- `city`: required, max 100 characters
- `postcode`: required, must match UK postcode format (`/^[A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2}$/i`)
- `reason`: max 500 characters
- `notes`: max 500 characters

**What happens when triggered:**
- The `/api/chat/submit` endpoint returns HTTP 422 with a descriptive error message
- No audit entry is written for invalid submissions (rejected before logging)

---

## G-06 — Rate Limiting

**Policy:** Limits the number of requests to the Claude API to 20 per minute per IP address. Protects against abuse, runaway loops, and excessive API spend.

**Implementation:** In-memory sliding window counter in `src/app/api/chat/route.ts`. Resets on server restart (POC-grade; a production implementation would use Redis or an edge-native store).

**What happens when triggered:**
- HTTP 429 response with a human-readable error message
- The client should surface this as a temporary error

---

## Audit Trail

Every guardrail event is recorded via `logAudit()` in `src/lib/audit.ts`. The audit entry includes:

| Field | Description |
|-------|-------------|
| `timestamp` | ISO 8601 timestamp of the event |
| `persona` | The persona that triggered the event |
| `action` | Human-readable description of what was attempted |
| `toolCalled` | The tool or endpoint involved |
| `customerId` | The customer record in scope |
| `guardrailTriggered` | `true` if a guardrail blocked the action |
| `detail` | Optional free-text with guardrail ID and context |

Guardrail events appear highlighted in red in the floating **Audit Log** panel (bottom-right of the UI). The server-side log is available at `GET /api/audit`.

---

## Production Hardening (Beyond This POC)

This POC demonstrates the guardrail pattern. A production deployment would additionally require:

| Area | Recommended Approach |
|------|---------------------|
| Persona authentication | Derive persona from a verified JWT claim or RBAC system — never trust user-supplied text |
| Audit persistence | Write audit entries to an append-only database with tamper detection |
| Rate limiting | Use Redis or a distributed edge store for rate limit state across instances |
| Content moderation | Apply an LLM-based moderation layer to free-text inputs (reason, notes) |
| Output validation | Validate all tool result props against a Zod schema before rendering on the client |
| Experian integration | Replace the mock score with a live Experian Identity Verification API call |
| Penetration testing | Run red-team exercises against the system prompt to probe for prompt injection |
