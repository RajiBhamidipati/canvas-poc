# Canvas — Generative UI POC

An AI-driven address servicing proof of concept demonstrating **context-aware, persona-adaptive UI** powered by Claude and the Vercel AI SDK.

## What it does

Canvas detects *who* the user is and *what* they want to do, then dynamically renders the right UI — no rigid wizard flows, no static page routing.

| Persona | Optimised for | UI rendered |
|---------|---------------|-------------|
| **Sarah** (Call Centre Agent) | Speed | Address entry form with PAF lookup, Experian scoring, real-time validation |
| **James** (Case Manager) | Governance | Approval card with before/after diff, compliance tabs, approve/amend/reject |

### The 4 Agentic Pillars

1. **Memory** — Full customer data model (8 categories) loaded from a JSON data store with 5 diverse customers
2. **Knowledge** — System prompt detects persona and task intent, routes to the correct tool
3. **Tools** — `fetch_customer`, `render_address_form`, `render_approval_view` — each returns a component + props that the client renders
4. **Guardrails** — Maker-checker policy enforced: agents can't approve, managers can't edit directly

## Tech stack

- **Next.js 14** (App Router)
- **Vercel AI SDK** (`streamText` + tool calling with `maxSteps`)
- **@ai-sdk/anthropic** (Claude Sonnet)
- **Shadcn/UI** + Tailwind CSS (custom brand theme)
- **TypeScript** (strict mode)

## Getting started

```bash
# Install dependencies
npm install

# Set your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the chat interface, or [http://localhost:3000/design-system](http://localhost:3000/design-system) for the component library.

## Project structure

```
src/
  app/
    page.tsx              # Chat interface with tool-result rendering
    design-system/        # Shadcn component showcase
    api/chat/route.ts     # Claude integration + tool definitions
    api/chat/submit/      # Address submission endpoint
    api/audit/            # Audit trail endpoint
  components/
    address-form.tsx      # Sarah's address entry form
    approval-view.tsx     # James's approval card (tabbed)
    audit-panel.tsx       # Floating audit log
    ui/                   # Shadcn primitives (12 components)
  data/
    customers.json        # 5 customer records with full 8-category schema
  lib/
    mock-data.ts          # Data access layer
    audit.ts              # Audit logging
    utils.ts              # cn() utility
```

## Customer data schema

Each customer record covers 8 categories: Core Identity, Contact, Relationship & Hierarchy, Regulatory & Compliance, Financial Profile, Product Linkages, Behavioural Data, and Authentication & Security.

5 seed customers with diverse profiles: different tiers (Premier/Business/Standard), risk levels (low/medium/high), compliance states (verified/expired/PEP/fraud-under-review), and product portfolios.

## Deployment

Deploy to Vercel:

1. Push to GitHub
2. Import the repo in [vercel.com/new](https://vercel.com/new)
3. Set `ANTHROPIC_API_KEY` as an environment variable
4. Deploy

## Licence

Internal POC
