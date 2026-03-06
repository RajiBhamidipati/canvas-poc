# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start dev server at http://localhost:3000
npm run build    # Production build
npm run lint     # ESLint via next lint
npm run start    # Start production server
```

There are no tests in this project.

Requires `ANTHROPIC_API_KEY` in `.env.local`.

## Architecture

Canvas is a **generative UI proof of concept** — the LLM dynamically selects and renders React components based on detected user persona and intent, rather than routing to pre-built pages.

### Request Flow

1. User sends a chat message via the `useChat` hook (Vercel AI SDK) in [src/app/page.tsx](src/app/page.tsx)
2. `POST /api/chat` ([src/app/api/chat/route.ts](src/app/api/chat/route.ts)) calls `streamText()` with Claude Sonnet and a system prompt defining persona detection logic and guardrails
3. Claude calls tools in sequence: always `fetch_customer` first, then a persona-gated render tool
4. Tool results include a `component` field (`"AddressForm"` or `"ApprovalView"`) and a `props` object — all values are strings (including booleans and numbers)
5. The client-side `ToolResult` component in [src/app/page.tsx](src/app/page.tsx) maps the component name to the actual React component and spreads the props

### The 3 Claude Tools (all in the chat route)

| Tool | Persona | Purpose |
|------|---------|---------|
| `fetch_customer` | Any | Fetches customer from mock data; always called first |
| `render_address_form` | Agent (Sarah) only | Returns `{ component: "AddressForm", props: {...} }` |
| `render_approval_view` | Manager (James) only | Returns `{ component: "ApprovalView", props: {...} }` |

Guardrails are enforced in the system prompt: agents can never call the approval tool, managers can never call the address form tool.

### Data Layer

- Customer data lives in [src/data/customers.json](src/data/customers.json) — 5 seed records, each with an 8-category schema (identity, contact, relationship, compliance, financial, products, behaviour, security)
- `getCustomer(id?)` in [src/lib/mock-data.ts](src/lib/mock-data.ts) defaults to `CUST-123` when no ID is provided (the tool passes no customer ID — Claude never asks for one)
- `submitAddressUpdate()` in the same file is a no-op mock that always returns success
- In production, replace `src/lib/mock-data.ts` with real API calls

### Audit Logging

Every tool execution calls `logAudit()` from [src/lib/audit.ts](src/lib/audit.ts). The audit trail is embedded in tool results as `result._audit`, extracted client-side from `message.toolInvocations`, and displayed in the floating `<AuditPanel>`. The server-side log (`GET /api/audit`) is an in-memory array that resets on restart.

### Key Conventions

- All tool result props are typed as `Record<string, string>` on the client — numeric and boolean values are serialised to strings by the tool `execute` functions (e.g. `String(customer.financial.creditScore)`)
- The `maxSteps: 5` setting on both the server `streamText()` and client `useChat()` allows multi-step tool chaining (fetch → render)
- Shadcn/UI primitives live in [src/components/ui/](src/components/ui/) and are standard copy-paste components — do not modify their internals
- Brand theme (lime/blue/purple palette, Urbanist font, CSS variables) is defined in [src/app/globals.css](src/app/globals.css)
- The `/design-system` route ([src/app/design-system/page.tsx](src/app/design-system/page.tsx)) is a standalone component showcase with no AI integration

### Routes

| Route | File | Description |
|-------|------|-------------|
| `/` | `src/app/page.tsx` | Chat interface + generative UI renderer |
| `/design-system` | `src/app/design-system/page.tsx` | Component library showcase |
| `POST /api/chat` | `src/app/api/chat/route.ts` | Claude integration with 3 tools |
| `POST /api/chat/submit` | `src/app/api/chat/submit/route.ts` | Address submission (approve/reject/update) |
| `GET /api/audit` | `src/app/api/audit/route.ts` | Audit log retrieval |
