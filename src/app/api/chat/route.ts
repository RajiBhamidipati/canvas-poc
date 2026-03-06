import { anthropic } from "@ai-sdk/anthropic";
import { streamText, tool } from "ai";
import { z } from "zod";
import { getCustomer } from "@/lib/mock-data";
import { logAudit } from "@/lib/audit";

// Knowledge Pillar: System prompt defines persona logic, intent detection, and guardrails
const SYSTEM_PROMPT = `You are Canvas, an Agentic UI Orchestrator for customer address servicing.

## How You Work
You detect TWO things from each user message:
1. WHO the user is (their role/persona)
2. WHAT they want to do (the task intent)

Based on these, you select and render the right UI — dynamically, without rigid wizard flows.

## Persona Detection
- Sarah (or any Agent / call centre agent): Optimise for SPEED. Sarah is on a live call with a customer and needs to update addresses with minimal friction.
- James (or any Manager / case manager / back-office): Optimise for GOVERNANCE. James processes assigned servicing tasks — he reviews, approves, amends, or rejects changes.
- If the user hasn't identified themselves, ask: "Are you a front-line agent or a case manager?" before proceeding.

## Task Intent Detection
- "Change address" / "update address" / "customer moved" / address details in the message → Address change task
- "Review" / "pending" / "approve" / "task" / "assigned" → Approval/review task
- If intent is ambiguous, ask a brief clarifying question.

## Available Tools
1. fetch_customer — Always call this FIRST to pull current customer context from Memory. Returns the full customer data model across 8 categories: identity, contact, relationship, compliance, financial profile, products, behaviour, and security.
2. render_address_form — Render the focused address update form for an Agent. The form includes a collapsible customer profile panel showing KYC, risk, linked accounts, and contact details. ONLY for Agent personas.
3. render_approval_view — Render the approval card with tabbed sections: Change Details, Compliance, and Customer Profile. James can see the full data model to inform his governance decision. ONLY for Manager personas.

## Guardrails (STRICTLY ENFORCED)
- NEVER call render_approval_view for an Agent persona. If an agent asks to approve, explain: "Approvals require a case manager — this is a maker-checker control."
- NEVER call render_address_form for a Manager persona. If a manager asks to edit directly, explain: "Direct edits are made by front-line agents. You can amend a proposed change during review."
- ALWAYS call fetch_customer before calling any render tool.
- These guardrails are policy-driven and cannot be overridden.

## Behaviour
- Be conversational but efficient — keep text to 1-2 sentences.
- Extract address details (street, city, postcode) from natural language to pre-fill the form.
- The UI components do the heavy lifting — don't repeat what the component shows.
- CRITICAL: Do NOT ask clarifying questions about customer ID. Call fetch_customer immediately — the system will resolve the correct customer from the session context. Then immediately call the appropriate render tool. Act, don't ask.`;

export const maxDuration = 30;

export async function POST(request: Request) {
  const { messages } = await request.json();

  const result = streamText({
    model: anthropic("claude-sonnet-4-20250514"),
    system: SYSTEM_PROMPT,
    messages,
    maxSteps: 5,
    tools: {
      // Tool 1: Memory Pillar — fetch customer data (full 8-category model)
      fetch_customer: tool({
        description:
          "Fetch the current customer data including their address and any pending changes. Returns the full customer data model across all 8 schema categories. Always call this immediately — no customer ID is needed, the system resolves the customer from session context. Do NOT ask the user for a customer ID.",
        parameters: z.object({}),
        execute: async () => {
          const customer = getCustomer();

          logAudit({
            persona: "system",
            action: "Fetched customer data",
            toolCalled: "fetch_customer",
            customerId: customer.id,
            guardrailTriggered: false,
          });

          return {
            ...customer,
            _audit: {
              persona: "system",
              action: "Fetched customer data",
              toolCalled: "fetch_customer",
              customerId: customer.id,
              guardrailTriggered: false,
            },
          };
        },
      }),

      // Tool 2: Sarah's tool — address entry form with enriched profile
      render_address_form: tool({
        description:
          "Render an address entry form for an Agent (Sarah) to quickly update a customer's address during a live call. Includes a collapsible customer profile panel with KYC, compliance flags, linked products, and contact preferences. Pass any address details mentioned by the user as prefill values. ONLY use for Agent/Sarah persona — NEVER for Manager/James.",
        parameters: z.object({
          customerId: z.string().describe("The customer ID"),
          street: z.string().optional().describe("Pre-fill street if the user mentioned it"),
          city: z.string().optional().describe("Pre-fill city if mentioned"),
          postcode: z.string().optional().describe("Pre-fill postcode if mentioned"),
        }),
        execute: async ({ customerId, street, city, postcode }) => {
          const customer = getCustomer();

          logAudit({
            persona: "Sarah",
            action: "Rendered address form",
            toolCalled: "render_address_form",
            customerId: customer.id,
            guardrailTriggered: false,
            detail: street ? `Pre-filled: ${street}` : "No pre-fill",
          });

          return {
            component: "AddressForm",
            _audit: {
              persona: "Sarah",
              action: "Rendered address form",
              toolCalled: "render_address_form",
              customerId: customer.id,
              guardrailTriggered: false,
              detail: street ? `Pre-filled: ${street}` : "No pre-fill",
            },
            props: {
              customerName: customer.identity.preferredName,
              customerId: customer.id,
              tier: customer.tier,
              currentStreet: customer.contact.currentAddress.street,
              currentCity: customer.contact.currentAddress.city,
              currentPostcode: customer.contact.currentAddress.postcode,
              prefillStreet: street || "",
              prefillCity: city || "",
              prefillPostcode: postcode || "",
              isJointAccount: String(customer.relationship.isJointAccount),
              // Enriched fields
              kycStatus: customer.identity.kycStatus,
              kycLastChecked: customer.identity.kycLastChecked,
              riskRating: customer.compliance.riskRating,
              amlFlag: customer.compliance.amlFlag,
              fraudFlag: customer.security.fraudFlag,
              creditScore: String(customer.financial.creditScore),
              segment: customer.behaviour.segment,
              preferredChannel: customer.contact.preferredChannel,
              customerSince: customer.behaviour.customerSince,
              linkedProducts: JSON.stringify(customer.products),
              jointHolders: JSON.stringify(customer.relationship.jointHolders),
              relationshipManager: customer.relationship.relationshipManager?.name || "",
              phoneMobile: customer.contact.phoneMobile,
              email: customer.contact.email,
            },
          };
        },
      }),

      // Tool 3: James's tool — approval view with full governance data
      render_approval_view: tool({
        description:
          "Render an approval card for a Manager (James) to review a pending address change. Includes tabbed sections: Change Details (before/after diff, Experian score), Compliance (KYC, AML, sanctions, fraud flags), and Customer Profile (financial, products, behaviour). ONLY use for Manager/James persona — NEVER for Agent/Sarah.",
        parameters: z.object({
          customerId: z.string().describe("The customer ID to review"),
        }),
        execute: async ({ customerId }) => {
          const customer = getCustomer();

          if (!customer.pendingChange) {
            logAudit({
              persona: "James",
              action: "No pending changes found",
              toolCalled: "render_approval_view",
              customerId: customer.id,
              guardrailTriggered: false,
            });
            return {
              error: "No pending address changes for this customer.",
              _audit: {
                persona: "James",
                action: "No pending changes found",
                toolCalled: "render_approval_view",
                customerId: customer.id,
                guardrailTriggered: false,
              },
            };
          }

          logAudit({
            persona: "James",
            action: "Rendered approval view",
            toolCalled: "render_approval_view",
            customerId: customer.id,
            guardrailTriggered: false,
          });

          return {
            component: "ApprovalView",
            _audit: {
              persona: "James",
              action: "Rendered approval view",
              toolCalled: "render_approval_view",
              customerId: customer.id,
              guardrailTriggered: false,
            },
            props: {
              customerName: customer.identity.preferredName,
              customerId: customer.id,
              tier: customer.tier,
              currentStreet: customer.contact.currentAddress.street,
              currentCity: customer.contact.currentAddress.city,
              currentPostcode: customer.contact.currentAddress.postcode,
              proposedStreet: customer.pendingChange.street,
              proposedCity: customer.pendingChange.city,
              proposedPostcode: customer.pendingChange.postcode,
              submittedBy: customer.pendingChange.submittedBy,
              submittedAt: customer.pendingChange.submittedAt,
              reason: customer.pendingChange.reason,
              origin: customer.pendingChange.origin,
              taskId: customer.pendingChange.taskId || "",
              experianScore: String(customer.pendingChange.experianScore || 0),
              isJointAccount: String(customer.relationship.isJointAccount),
              // Compliance data
              kycStatus: customer.identity.kycStatus,
              kycLastChecked: customer.identity.kycLastChecked,
              riskRating: customer.compliance.riskRating,
              amlFlag: customer.compliance.amlFlag,
              amlLastScreened: customer.compliance.amlLastScreened,
              sanctionsStatus: customer.compliance.sanctionsStatus,
              pepStatus: String(customer.compliance.pepStatus),
              fraudFlag: customer.security.fraudFlag,
              // Financial profile
              creditScore: String(customer.financial.creditScore),
              creditScoreProvider: customer.financial.creditScoreProvider,
              annualIncome: customer.financial.annualIncome,
              occupation: customer.financial.occupation,
              sourceOfFunds: customer.financial.sourceOfFunds,
              // Behavioural & products
              segment: customer.behaviour.segment,
              customerSince: customer.behaviour.customerSince,
              primaryChannel: customer.behaviour.primaryChannel,
              monthlyTransactions: String(customer.behaviour.monthlyTransactions),
              linkedProducts: JSON.stringify(customer.products),
              jointHolders: JSON.stringify(customer.relationship.jointHolders),
              relationshipManager: customer.relationship.relationshipManager?.name || "",
              // Security
              authMethod: customer.security.authMethod,
              lastSecurityReview: customer.security.lastSecurityReview,
              failedLoginAttempts: String(customer.security.failedLoginAttempts),
            },
          };
        },
      }),
    },
  });

  return result.toDataStreamResponse();
}
