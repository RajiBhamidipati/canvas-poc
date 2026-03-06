"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressForm } from "@/components/address-form";
import { ApprovalView } from "@/components/approval-view";
import { AuditPanel } from "@/components/audit-panel";
import type { AuditEntry } from "@/components/audit-panel";
import { useMemo, useState } from "react";

// Map tool result component names to actual React components
function ToolResult({ toolName: _toolName, result, onDecision }: { toolName: string; result: Record<string, unknown>; onDecision?: (d: "approved" | "amended" | "rejected") => void }) {
  if (result.error) {
    return (
      <div className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-800">
        {String(result.error)}
      </div>
    );
  }

  if (result.component === "AddressForm") {
    const p = result.props as Record<string, string>;
    return (
      <AddressForm
        customerName={p.customerName}
        customerId={p.customerId}
        tier={p.tier}
        currentStreet={p.currentStreet}
        currentCity={p.currentCity}
        currentPostcode={p.currentPostcode}
        prefillStreet={p.prefillStreet}
        prefillCity={p.prefillCity}
        prefillPostcode={p.prefillPostcode}
        isJointAccount={p.isJointAccount}
        kycStatus={p.kycStatus}
        kycLastChecked={p.kycLastChecked}
        riskRating={p.riskRating}
        amlFlag={p.amlFlag}
        fraudFlag={p.fraudFlag}
        creditScore={p.creditScore}
        segment={p.segment}
        preferredChannel={p.preferredChannel}
        customerSince={p.customerSince}
        linkedProducts={p.linkedProducts}
        jointHolders={p.jointHolders}
        relationshipManager={p.relationshipManager}
        phoneMobile={p.phoneMobile}
        email={p.email}
      />
    );
  }

  if (result.component === "ApprovalView") {
    const p = result.props as Record<string, string>;
    return (
      <ApprovalView
        onDecision={onDecision}
        customerName={p.customerName}
        customerId={p.customerId}
        tier={p.tier}
        currentStreet={p.currentStreet}
        currentCity={p.currentCity}
        currentPostcode={p.currentPostcode}
        proposedStreet={p.proposedStreet}
        proposedCity={p.proposedCity}
        proposedPostcode={p.proposedPostcode}
        submittedBy={p.submittedBy}
        submittedAt={p.submittedAt}
        reason={p.reason}
        origin={p.origin}
        taskId={p.taskId}
        experianScore={p.experianScore}
        isJointAccount={p.isJointAccount}
        kycStatus={p.kycStatus}
        kycLastChecked={p.kycLastChecked}
        riskRating={p.riskRating}
        amlFlag={p.amlFlag}
        amlLastScreened={p.amlLastScreened}
        sanctionsStatus={p.sanctionsStatus}
        pepStatus={p.pepStatus}
        fraudFlag={p.fraudFlag}
        creditScore={p.creditScore}
        creditScoreProvider={p.creditScoreProvider}
        annualIncome={p.annualIncome}
        occupation={p.occupation}
        sourceOfFunds={p.sourceOfFunds}
        segment={p.segment}
        customerSince={p.customerSince}
        primaryChannel={p.primaryChannel}
        monthlyTransactions={p.monthlyTransactions}
        linkedProducts={p.linkedProducts}
        jointHolders={p.jointHolders}
        relationshipManager={p.relationshipManager}
        authMethod={p.authMethod}
        lastSecurityReview={p.lastSecurityReview}
        failedLoginAttempts={p.failedLoginAttempts}
      />
    );
  }

  return null;
}

export default function PlatformPage() {
  const [persona, setPersona] = useState<"agent" | "manager" | null>(null);
  const [newStreet, setNewStreet] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newPostcode, setNewPostcode] = useState("");
  const [taskDecision, setTaskDecision] = useState<"approved" | "amended" | "rejected" | null>(null);

  const { messages, append, isLoading, setMessages } = useChat({
    api: "/api/chat",
    maxSteps: 5,
  });

  // Extract audit entries from tool invocations
  const auditEntries: AuditEntry[] = useMemo(() => {
    const entries: AuditEntry[] = [];
    for (const message of messages) {
      if (message.toolInvocations) {
        for (const invocation of message.toolInvocations) {
          if (invocation.state === "result" && invocation.result?._audit) {
            const a = invocation.result._audit as Record<string, unknown>;
            entries.push({
              id: invocation.toolCallId,
              timestamp: new Date().toISOString(),
              persona: String(a.persona || "unknown"),
              action: String(a.action || ""),
              toolCalled: String(a.toolCalled || invocation.toolName),
              customerId: String(a.customerId || ""),
              guardrailTriggered: Boolean(a.guardrailTriggered),
              detail: a.detail ? String(a.detail) : undefined,
            });
          }
        }
      }
    }
    return entries;
  }, [messages]);

  // Extract the latest rendered component for the canvas
  const activeComponent = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      const invocations = messages[i].toolInvocations;
      if (!invocations) continue;
      for (let j = invocations.length - 1; j >= 0; j--) {
        const inv = invocations[j];
        if (inv.state === "result" && inv.result?.component) {
          return { toolName: inv.toolName, result: inv.result as Record<string, unknown> };
        }
      }
    }
    return null;
  }, [messages]);

  // Last assistant text message (for guardrail feedback, etc.)
  const lastAssistantText = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === "assistant" && messages[i].content) {
        return messages[i].content;
      }
    }
    return null;
  }, [messages]);

  const hasResponse = messages.length > 0;

  const handlePersonaSelect = (p: "agent" | "manager") => {
    setPersona(p);
    setMessages([]);
    setNewStreet("");
    setNewCity("");
    setNewPostcode("");
    setTaskDecision(null);
  };

  const handleReset = () => {
    setPersona(null);
    setMessages([]);
    setTaskDecision(null);
  };

  const fireAgentAction = () => {
    setMessages([]);
    const addressPart = newStreet
      ? ` The customer wants to update their address to ${newStreet}, ${newCity}, ${newPostcode}.`
      : "";
    append({
      role: "user",
      content: `I'm Sarah, a call centre agent. I'm on a live call with the customer.${addressPart} Please open the address change form.`,
    });
  };

  const fireManagerAction = () => {
    setMessages([]);
    append({
      role: "user",
      content: `I'm James, a case manager. I need to review the pending address change for CUST-123.`,
    });
  };

  const fireGuardrailTest = () => {
    setMessages([]);
    append({
      role: "user",
      content: `I'm Sarah, an agent. I want to approve the pending address change for CUST-123.`,
    });
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* ── Left: Platform context sidebar ── */}
      <div className="flex flex-col w-[380px] min-w-[320px] border-r bg-background flex-shrink-0">
        {/* Platform header */}
        <header className="bg-[#1F1F1F] text-white px-5 py-3.5 flex-shrink-0 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight">
                <span className="text-[#ECF3B7]">Canvas</span>
                <span className="text-white/30 font-normal ml-1.5 text-sm">/ Servicing Platform</span>
              </h1>
            </div>
            <p className="text-[10px] text-white/30 mt-0.5">Generative UI · Address Servicing POC</p>
          </div>
          {persona && (
            <button
              onClick={handleReset}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Switch user
            </button>
          )}
        </header>

        {/* Sidebar body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {!persona ? (
            /* ── Persona selection (simulates SSO login) ── */
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-1">
                  Sign in as
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  In production, your identity comes from SSO. Select a role to simulate the platform context Canvas receives.
                </p>
              </div>

              <button
                onClick={() => handlePersonaSelect("agent")}
                className="w-full text-left rounded-xl border-2 border-transparent hover:border-[#6686F7]/50 bg-muted/40 hover:bg-[#6686F7]/5 p-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#6686F7]/20 flex items-center justify-center text-[#6686F7] text-sm font-bold flex-shrink-0">
                    SC
                  </div>
                  <div>
                    <p className="font-semibold text-sm">Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">Call Centre Agent · Team 3</p>
                  </div>
                  <svg className="ml-auto h-4 w-4 text-muted-foreground/40 group-hover:text-[#6686F7] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <button
                onClick={() => handlePersonaSelect("manager")}
                className="w-full text-left rounded-xl border-2 border-transparent hover:border-[#ECF3B7]/70 bg-muted/40 hover:bg-[#ECF3B7]/5 p-4 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#ECF3B7]/30 flex items-center justify-center text-[#1F1F1F] text-sm font-bold flex-shrink-0">
                    JW
                  </div>
                  <div>
                    <p className="font-semibold text-sm">James Wright</p>
                    <p className="text-xs text-muted-foreground">Case Manager · Back Office</p>
                  </div>
                  <svg className="ml-auto h-4 w-4 text-muted-foreground/40 group-hover:text-[#ECF3B7] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>

              <div className="pt-1 border-t">
                <p className="text-[11px] text-muted-foreground/60 leading-relaxed">
                  Canvas receives your identity and open customer context as structured signals. The LLM selects and renders the appropriate UI — no prompt required.
                </p>
              </div>
            </div>
          ) : (
            /* ── Logged-in platform view ── */
            <div className="space-y-5">
              {/* Identity bar */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/40">
                {persona === "agent" ? (
                  <>
                    <div className="w-9 h-9 rounded-full bg-[#6686F7]/20 flex items-center justify-center text-[#6686F7] text-xs font-bold flex-shrink-0">
                      SC
                    </div>
                    <div>
                      <p className="text-sm font-semibold">Sarah Chen</p>
                      <p className="text-xs text-muted-foreground">Call Centre Agent · Team 3</p>
                    </div>
                    <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#6686F7]/10 text-[#6686F7] border border-[#6686F7]/20">
                      Agent
                    </span>
                  </>
                ) : (
                  <>
                    <div className="w-9 h-9 rounded-full bg-[#ECF3B7]/30 flex items-center justify-center text-[#1F1F1F] text-xs font-bold flex-shrink-0">
                      JW
                    </div>
                    <div>
                      <p className="text-sm font-semibold">James Wright</p>
                      <p className="text-xs text-muted-foreground">Case Manager · Back Office</p>
                    </div>
                    <span className="ml-auto text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#ECF3B7]/20 text-[#1F1F1F] border border-[#ECF3B7]/40">
                      Manager
                    </span>
                  </>
                )}
              </div>

              {/* Open customer record */}
              <div>
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-2">
                  Open Customer Record
                </p>
                <div className="rounded-xl border bg-muted/20 p-3 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Alex Morgan</span>
                    <span className="text-xs font-mono text-muted-foreground">CUST-123</span>
                  </div>
                  <p className="text-xs text-muted-foreground">14 Primrose Hill, London, NW3 3AD</p>
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">KYC verified</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-50 text-green-700 border border-green-200">AML clear</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground border">Premium</span>
                  </div>
                </div>
              </div>

              {/* ── Agent actions ── */}
              {persona === "agent" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Live Call — Address Change
                  </p>
                  <div className="rounded-xl border border-orange-200 bg-orange-50/60 px-3 py-2.5 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs text-orange-800 font-medium">Customer on the line — requesting address update</span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-xs text-muted-foreground">New address told by customer (optional — pre-fills the form):</p>
                    <Input
                      placeholder="Street"
                      value={newStreet}
                      onChange={(e) => setNewStreet(e.target.value)}
                      disabled={isLoading}
                      className="text-xs h-8"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="City"
                        value={newCity}
                        onChange={(e) => setNewCity(e.target.value)}
                        disabled={isLoading}
                        className="text-xs h-8"
                      />
                      <Input
                        placeholder="Postcode"
                        value={newPostcode}
                        onChange={(e) => setNewPostcode(e.target.value)}
                        disabled={isLoading}
                        className="text-xs h-8"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={fireAgentAction}
                    disabled={isLoading}
                    className="w-full bg-[#1F1F1F] hover:bg-[#1F1F1F]/80 text-white text-xs"
                  >
                    {isLoading ? "Opening form…" : "Open Address Change Form"}
                  </Button>
                </div>
              )}

              {/* ── Manager actions ── */}
              {persona === "manager" && (
                <div className="space-y-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Task Queue
                  </p>
                  <div className={`rounded-xl border p-3 space-y-2 ${taskDecision ? "bg-muted/10 opacity-60" : "bg-muted/20"}`}>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-medium ${taskDecision ? "line-through text-muted-foreground" : ""}`}>
                        Address Change — Review Required
                      </span>
                      {taskDecision ? (
                        <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium border ${
                          taskDecision === "approved" || taskDecision === "amended"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : "bg-red-50 text-red-700 border-red-200"
                        }`}>
                          {taskDecision.charAt(0).toUpperCase() + taskDecision.slice(1)}
                        </span>
                      ) : (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-medium">
                          Pending
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">CUST-123 · Submitted by Sarah Chen</p>
                    <p className="text-xs text-muted-foreground">
                      14 Primrose Hill → 221B Baker Street, NW1 6XE
                    </p>
                  </div>
                  {!taskDecision && (
                    <Button
                      onClick={fireManagerAction}
                      disabled={isLoading}
                      className="w-full bg-[#1F1F1F] hover:bg-[#1F1F1F]/80 text-white text-xs"
                    >
                      {isLoading ? "Loading…" : "Review Pending Change"}
                    </Button>
                  )}
                </div>
              )}

              {/* Canvas response text (guardrail messages, etc.) */}
              {hasResponse && lastAssistantText && !activeComponent && (
                <div className="rounded-xl border bg-muted/30 p-3">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest mb-1.5">
                    Canvas Response
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{lastAssistantText}</p>
                </div>
              )}

              {/* Guardrail test (agent only) */}
              {persona === "agent" && (
                <div className="pt-1 border-t space-y-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                    Guardrail Test
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Agents cannot approve changes (maker-checker policy). Trigger this to see the guardrail block the request.
                  </p>
                  <Button
                    variant="outline"
                    onClick={fireGuardrailTest}
                    disabled={isLoading}
                    className="w-full text-xs border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                  >
                    Try: Approve as Agent (blocked)
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Right: Canvas (generative UI output) ── */}
      <div className="flex-1 overflow-y-auto bg-muted/30">
        {activeComponent ? (
          <div className="p-8">
            {/* Transparency note */}
            <div className="mb-5 flex items-center gap-2 text-[11px] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-[#6686F7]" />
              Canvas rendered this component from{" "}
              <span className="font-medium text-foreground/70">
                {persona === "agent" ? "Sarah's" : "James'"} role
              </span>{" "}
              and open customer context
              <span className="mx-1 text-muted-foreground/40">·</span>
              <span className="text-[#6686F7]">Powered by Claude</span>
            </div>
            <ToolResult toolName={activeComponent.toolName} result={activeComponent.result} onDecision={setTaskDecision} />
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <div className="flex gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#6686F7] animate-bounce" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#6686F7] animate-bounce [animation-delay:0.15s]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#6686F7] animate-bounce [animation-delay:0.3s]" />
            </div>
            <p className="text-sm text-muted-foreground">Canvas is generating UI…</p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-[#ECF3B7]/40 border border-[#ECF3B7] flex items-center justify-center">
              <svg className="h-8 w-8 text-[#1F1F1F]/30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground/50">
                {persona ? "Select an action to generate UI" : "Sign in to begin"}
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                {persona
                  ? "Canvas will render the right component for your role and the open customer record"
                  : "Canvas adapts to who you are — select a persona from the left panel to simulate the platform context"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Floating audit panel */}
      <AuditPanel entries={auditEntries} />
    </div>
  );
}
