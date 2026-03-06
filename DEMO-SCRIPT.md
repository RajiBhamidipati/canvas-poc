# Canvas POC — Stakeholder Demo Script

## How to Walk Non-Technical Stakeholders Through the 4 Agentic Pillars

This demo is designed for a 10-minute walkthrough. You don't need to explain AI or architecture — you show it working, then explain *why* it worked.

---

## Before You Start

Open `http://localhost:3000` in your browser. Have this script on a second screen or printed.

**Key message to plant early:**
> "What you're about to see is one address change task. But the system shows a completely different screen depending on who's using it — without anyone having to build two separate interfaces."

---

## Demo Flow (4 Sections = 4 Pillars)

### Section 1: "The system remembers" (MEMORY)

**What you say:**
> "The first thing the system does — before showing anything — is pull the customer's current state. Their address, account type, whether they're on a joint account, whether there are already pending changes. This is the Memory pillar."

**What you do:**
1. Type Sarah's prompt: *"I'm Sarah, a call centre agent. I'm on a call — the customer has moved to 221B Baker Street, London, NW1 6XE."*
2. Point out the **customer card** that appears first (name, ID, current address, Premier tier)

**What to say after:**
> "The system didn't ask Sarah to look up the customer or navigate to their profile. It fetched the context automatically. In the current system, that's 3-4 screens. Here it's instant."

---

### Section 2: "The system knows the rules" (KNOWLEDGE)

**What you say:**
> "Now watch what it shows Sarah. This is the Knowledge pillar — the system understands that Sarah is a call centre agent on a live call, so it optimises for speed."

**What to point out on the form:**
- The address is **pre-filled** from what Sarah said (221B Baker Street, NW1 6XE)
- Only the **relevant fields** are shown — no unnecessary fields
- The **PAF postcode lookup** — type a postcode and addresses appear automatically (reducing manual entry errors)
- The **reason for change** dropdown — capturing governance data without slowing Sarah down
- The **joint account checkbox** — the system knows this is a joint account and surfaces the option

**What to say:**
> "Sarah didn't have to navigate a wizard or fill in 15 fields. The system knew what she needed and gave her a focused, fast interface. The knowledge of 'what to show' lives in the AI prompt, not in hardcoded screen logic."

---

### Section 3: "The system has tools" (TOOLS)

**What you do:**
1. Click **Review Change** on Sarah's form
2. Walk through the **confirmation screen**:

**What to point out:**
- The **before/after comparison** — red (old) and green (new) side by side
- The **Experian Identity Hub score** (8/9 — Address verified) — real-time identity validation
- The **confirmation letter notice** — the system knows the business rule: if the effective date is more than 5 days away, the letter goes to the old address
- The **pending changes notice** — previous pending changes will be automatically deactivated

**What to say:**
> "Each of these elements is a tool the AI selected. The Experian check, the PAF lookup, the letter routing logic — these are all separate capabilities the system called based on context. In a traditional build, each of these would be a separate integration project."

3. Click **Confirm & Submit**
4. Show the success card

---

### Section 4: "The system enforces the rules" (GUARDRAILS)

**What you do:**
1. Click **New Chat**
2. Type the guardrail test: *"I'm Sarah, an agent. I want to approve the pending address change for CUST-123."*
3. Watch the system **refuse** to show the approval screen

**What to say:**
> "Sarah just tried to approve a change. The system blocked her — not with a greyed-out button, but by understanding that approvals are a governance action reserved for case managers. This is the maker-checker control, enforced at the AI level."

4. Click **New Chat** again
5. Type James's prompt: *"I'm James, a case manager. I have a pending task to review an address change for CUST-123."*
6. Point out how the **same data** is now shown in a completely different layout:

**What to point out on James's view:**
- **Task ID** (T862-00451) in the header — the system knows this is a trackable task
- **Origin badge** — "Call Centre" — so James knows where the request came from
- **Experian score** — already validated, shown for governance context
- **Before/after diff** — same data as Sarah's confirmation, but formatted for review
- **Three actions**: Approve / Amend / Reject — not just a simple yes/no
- **Supporting notes** field — for the audit trail
- **Task closed** confirmation after a decision

**What to say:**
> "Same customer. Same address change. But the interface is completely different because the user is different. James sees governance controls. Sarah sees speed. Neither of them sees anything they don't need."

---

### Close: The Audit Trail

**What you do:**
1. Click the **Audit Log** button (bottom-right corner)
2. Walk through the entries — every action is timestamped and logged

**What to say:**
> "Every decision the AI made is logged. Which persona it detected, which tool it called, whether a guardrail was triggered. This is the compliance story — the system is auditable from end to end."

---

## The Punchline (Memorise This)

> "Traditional servicing platforms force every user through the same rigid wizard, regardless of who they are or what they're trying to do. Canvas adapts the interface to the user, the task, and the context — dynamically, in real time."

> "We built this with four pillars: Memory gives it context. Knowledge tells it the rules. Tools give it capabilities. And Guardrails keep it safe. That's the architecture — and it's extensible. Adding a new task type or a new role doesn't require rebuilding the UI."

---

## Likely Questions & Answers

**"Is this production-ready?"**
> "No — this is a proof of concept. It demonstrates the architecture and the user experience. Production would need real backend integration, security hardening, and scale testing."

**"How long did this take to build?"**
> "The working prototype was built in days, not months. That's the point — the UI layer is decoupled, so changes are fast."

**"What if the AI makes a mistake?"**
> "The guardrails are enforced at the system level, not by the AI's judgement alone. The maker-checker control, the Experian validation, the audit logging — these are deterministic safeguards. The AI orchestrates, but the rules are fixed."

**"Can it do more than address changes?"**
> "The architecture is task-agnostic. The same four pillars — Memory, Knowledge, Tools, Guardrails — can drive any servicing task. Adding a new task means adding a new tool and updating the knowledge prompt. The framework stays the same."

**"What about data security?"**
> "Customer data stays in the backend. The AI sees the data it needs to render the UI, but it doesn't store it. The mock data you see here would be replaced with secure API calls to existing systems."
