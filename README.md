# Canvas — Generative UI for Customer Servicing

A proof of concept demonstrating how large language models can **dynamically generate the right UI for the right user at the right time** — replacing static page routing with context-aware, persona-adaptive interfaces.

Built with Next.js, the Vercel AI SDK, and Claude.

---

## The Problem

Traditional customer servicing platforms suffer from a rigid, one-size-fits-all approach:

**For front-line agents on live calls**, every second counts. But they navigate the same multi-step wizards as back-office staff — clicking through tabs, loading compliance screens they don't need, and manually cross-referencing customer data across separate systems. The result: longer call times, higher error rates, and frustrated customers on hold.

**For case managers reviewing changes**, the opposite problem exists. They need governance context — compliance flags, audit trails, before/after diffs — but the same generic interface buries this information behind the same simplified forms designed for speed. They end up toggling between multiple screens to make an informed decision.

The core issue is that **traditional UIs are built around pages and workflows, not around people and tasks**. Every user sees the same screens regardless of their role, their intent, or the risk profile of the customer they're serving.

## The Canvas Approach

Canvas flips this model. Instead of routing users to pre-built pages, it detects **who you are** and **what you're trying to do**, then assembles the right interface on the fly.

```
"Hi, I'm Sarah. Mrs Miller has moved to 42 Oak Lane, Bristol BS1 4QR"

→ Claude detects: Agent persona + address change intent
→ Fetches customer data (KYC: verified, risk: low, joint account)
→ Renders: streamlined address form with PAF lookup, pre-filled fields,
  and a collapsible compliance panel — optimised for speed
```

```
"It's James, I need to review the pending changes in my queue"

→ Claude detects: Manager persona + approval intent
→ Fetches customer data + pending change details
→ Renders: governance card with before/after diff, compliance tabs,
  Experian scoring, and approve/amend/reject controls
```

Same data. Same API. Completely different experiences — each optimised for the user's actual job.

---

## Architecture

### System Overview

```mermaid
graph TB
    subgraph Client["Browser (Next.js App Router)"]
        Chat["Chat Interface<br/>useChat hook"]
        TR["Tool Result Renderer<br/>Maps component names → React"]
        AF["AddressForm<br/>Agent: speed-optimised"]
        AV["ApprovalView<br/>Manager: governance-optimised"]
        AP["AuditPanel<br/>Floating audit log"]
    end

    subgraph Server["API Route (Edge)"]
        SP["System Prompt<br/>Persona detection + guardrails"]
        ST["streamText()<br/>Vercel AI SDK"]
        T1["fetch_customer"]
        T2["render_address_form"]
        T3["render_approval_view"]
    end

    subgraph LLM["Claude (Sonnet)"]
        IC["Intent Classification"]
        TC["Tool Selection"]
    end

    subgraph Data["Data Layer"]
        CJ["customers.json<br/>5 customers × 8 categories"]
        AL["Audit Log<br/>In-memory store"]
    end

    Chat -->|"messages"| ST
    ST -->|"system prompt"| LLM
    LLM -->|"tool calls"| T1
    LLM -->|"tool calls"| T2
    LLM -->|"tool calls"| T3
    T1 -->|"query"| CJ
    T2 -->|"query"| CJ
    T3 -->|"query"| CJ
    T1 -->|"log"| AL
    T2 -->|"log"| AL
    T3 -->|"log"| AL
    ST -->|"streamed response + tool results"| Chat
    Chat -->|"component + props"| TR
    TR --> AF
    TR --> AV
    Chat --> AP
```

### Request Flow

```mermaid
sequenceDiagram
    participant U as User
    participant C as Chat UI
    participant A as API Route
    participant L as Claude
    participant D as Data Store

    U->>C: "Hi, I'm Sarah. Customer needs address update"
    C->>A: POST /api/chat (messages array)
    A->>L: streamText() with system prompt

    Note over L: Step 1: Persona + intent detection
    L->>A: Call fetch_customer tool
    A->>D: getCustomer()
    D-->>A: Full 8-category customer record
    A-->>L: Customer data returned

    Note over L: Step 2: Select persona-appropriate UI
    L->>A: Call render_address_form tool
    A->>D: Read customer for form props
    A-->>L: { component: "AddressForm", props: {...} }

    L-->>A: Stream complete (text + tool results)
    A-->>C: Streamed response
    Note over C: Map "AddressForm" → <AddressForm /> React component
    C->>U: Rendered address form with pre-filled data
```

### The 4 Agentic Pillars

```mermaid
graph LR
    subgraph Memory["1. Memory"]
        M1["Customer data model"]
        M2["8 categories per customer"]
        M3["5 diverse seed records"]
    end

    subgraph Knowledge["2. Knowledge"]
        K1["System prompt"]
        K2["Persona detection rules"]
        K3["Intent classification"]
    end

    subgraph Tools["3. Tools"]
        T1["fetch_customer"]
        T2["render_address_form"]
        T3["render_approval_view"]
    end

    subgraph Guardrails["4. Guardrails"]
        G1["Maker-checker enforcement"]
        G2["Agents cannot approve"]
        G3["Managers cannot edit"]
    end

    Memory --> Knowledge
    Knowledge --> Tools
    Tools --> Guardrails
```

---

## Personas

### Sarah — Call Centre Agent

Sarah is on a live call. She needs to update a customer's address with minimal friction.

Canvas renders her a **streamlined address form** with PAF (Postcode Address File) lookup, Experian identity scoring, real-time validation, and a collapsible panel showing relevant customer context (KYC status, risk rating, linked products) — everything she needs without leaving the form.

**Guardrail:** Sarah cannot access approval controls. If she asks to approve a change, Canvas explains the maker-checker policy.

### James — Case Manager

James works through a queue of assigned servicing tasks. He needs to review proposed changes against the customer's full profile before making a governance decision.

Canvas renders him a **tabbed approval card** with three views: Change Details (before/after diff with Experian score), Compliance (KYC, AML, sanctions, PEP, and fraud flags), and Customer Profile (financial summary, linked products table, behavioural data). He can approve, amend, or reject — with full context.

**Guardrail:** James cannot directly edit addresses. If he asks to make a change, Canvas explains that edits are initiated by front-line agents.

---

## Customer Data Model

Each customer record spans 8 categories, reflecting the depth of data available in real banking systems:

| Category | Key Fields | Example |
|----------|-----------|---------|
| **Core Identity** | Full name, preferred name, DOB, KYC status | KYC: Verified (2024-11-15) |
| **Contact** | Current address, phone, email, preferred channel | Channel: Mobile App |
| **Relationship** | Account type, joint holders, relationship manager | Joint account with Robert Miller |
| **Compliance** | Risk rating, AML screening, sanctions, PEP status | Risk: Low, AML: Clear |
| **Financial Profile** | Credit score, income, occupation, source of funds | Experian: 742 |
| **Product Linkages** | Accounts, mortgages, cards with balances and status | 3 active products |
| **Behavioural Data** | Segment, tenure, primary channel, transaction volume | Premier since 2015 |
| **Security** | Auth method, last security review, login attempts | Biometric + PIN |

The POC ships with 5 seed customers covering a range of risk profiles, compliance states, and product portfolios:

| ID | Name | Tier | Risk | Compliance State | Pending Change |
|----|------|------|------|------------------|----------------|
| CUST-123 | Sarah Miller | Premier | Low | Verified | Yes (call centre) |
| CUST-456 | Ahmed Hassan | Business | Medium | Verified | Yes (eBanking) |
| CUST-789 | Yuki Tanaka | Premier | High | PEP Flagged | No |
| CUST-012 | James Wilson | Standard | Low | KYC Expired | No |
| CUST-345 | Lisa Rodriguez | Standard | High | Fraud Under Review | No |

---

## Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Framework | Next.js 14 (App Router) | Server-side rendering, API routes, file-based routing |
| AI Integration | Vercel AI SDK v4 | `streamText()`, tool calling, `maxSteps` for multi-step chains |
| LLM | Claude Sonnet (@ai-sdk/anthropic) | Persona detection, intent classification, tool selection |
| UI Components | Shadcn/UI (12 primitives) | Button, Card, Input, Badge, Tabs, Dialog, Table, Tooltip, Avatar, etc. |
| Styling | Tailwind CSS + custom brand theme | CSS variables for palette, Urbanist font, pill buttons |
| Validation | Zod | Tool parameter schemas |
| Language | TypeScript (strict mode) | End-to-end type safety |

---

## Project Structure

```
canvas-poc/
├── src/
│   ├── app/
│   │   ├── page.tsx                    # Chat interface + tool result rendering
│   │   ├── layout.tsx                  # Root layout with metadata
│   │   ├── globals.css                 # Brand theme (CSS variables, Urbanist font)
│   │   ├── design-system/
│   │   │   └── page.tsx                # Component library showcase (12 sections)
│   │   └── api/
│   │       ├── chat/
│   │       │   ├── route.ts            # Claude integration, system prompt, 3 tools
│   │       │   └── submit/
│   │       │       └── route.ts        # Address submission endpoint
│   │       └── audit/
│   │           └── route.ts            # Audit trail API
│   ├── components/
│   │   ├── address-form.tsx            # Agent form: PAF lookup, Experian, profile panel
│   │   ├── approval-view.tsx           # Manager card: tabbed governance view
│   │   ├── audit-panel.tsx             # Floating audit log overlay
│   │   └── ui/                         # Shadcn primitives
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── badge.tsx
│   │       ├── separator.tsx
│   │       ├── scroll-area.tsx
│   │       ├── tabs.tsx
│   │       ├── dialog.tsx
│   │       ├── table.tsx
│   │       ├── tooltip.tsx
│   │       └── avatar.tsx
│   ├── data/
│   │   └── customers.json              # 5 customer records (8-category schema)
│   └── lib/
│       ├── mock-data.ts                # Data access: getCustomer(), getAllCustomers()
│       ├── audit.ts                    # Audit logging utilities
│       └── utils.ts                    # cn() class merge utility
├── public/
├── DEMO-SCRIPT.md                      # Stakeholder walkthrough guide
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── next.config.ts
```

---

## Getting Started

### Prerequisites

Node.js 18+ and an Anthropic API key.

### Setup

```bash
# Clone the repository
git clone https://github.com/RajiBhamidipati/canvas-poc.git
cd canvas-poc

# Install dependencies
npm install

# Set your API key
echo "ANTHROPIC_API_KEY=sk-ant-..." > .env.local

# Start the dev server
npm run dev
```

### Usage

Open [http://localhost:3000](http://localhost:3000) for the chat interface.

Try these prompts to see persona-adaptive UI in action:

**As an agent:**
> "Hi, I'm Sarah. Mrs Miller has moved to 42 Oak Lane, Bristol BS1 4QR"

**As a manager:**
> "It's James, I need to review the pending address changes"

Visit [http://localhost:3000/design-system](http://localhost:3000/design-system) for the component library showcase.

---

## Design System

The `/design-system` route provides a visual component library with 12 sections: Brand, Typography, Colours, Buttons, Cards, Forms, Badges, Tables, Tabs, Dialogs, Tooltips, and Avatars. All components use the custom brand theme defined in `globals.css` with the Urbanist typeface and a lime/blue/purple accent palette.


## Roadmap

Future iterations could explore: multi-customer selection (agent picks from a search), real PAF/Experian API integration, WebSocket-based live updates between agent and manager views, persistent database with Prisma ORM, role-based authentication, and additional servicing journeys beyond address changes.

---

## Licence

Internal POC
