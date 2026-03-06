"use client";

import { useChat } from "ai/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AddressForm } from "@/components/address-form";
import { ApprovalView } from "@/components/approval-view";
import { AuditPanel } from "@/components/audit-panel";
import { useRef, useEffect } from "react";

// Map tool result component names to actual React components
function ToolResult({ toolName, result }: { toolName: string; result: Record<string, unknown> }) {
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

  // fetch_customer result — show enriched customer card
  if (toolName === "fetch_customer" && result.id) {
    const r = result as Record<string, unknown>;
    const identity = r.identity as Record<string, string> | undefined;
    const contact = r.contact as Record<string, unknown> | undefined;
    const compliance = r.compliance as Record<string, string> | undefined;
    const relationship = r.relationship as Record<string, unknown> | undefined;
    const address = contact
      ? (contact.currentAddress as Record<string, string>)
      : (r.address as Record<string, string>);
    const displayName = identity?.preferredName || String(r.name || "");
    const kycStatus = identity?.kycStatus;
    const riskRating = compliance?.riskRating;
    const amlFlag = compliance?.amlFlag;
    const isJoint = relationship?.isJointAccount;
    const products = r.products as unknown[] | undefined;

    return (
      <div className="rounded-md bg-muted/30 border px-3 py-2.5 text-xs max-w-md space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="font-medium text-sm">{displayName}</span>
          <span className="text-muted-foreground font-mono">{String(r.id)}</span>
        </div>
        <p className="text-muted-foreground">
          {address?.street}, {address?.city}, {address?.postcode}
        </p>
        {/* Compliance badges */}
        {(kycStatus || riskRating || amlFlag) && (
          <div className="flex flex-wrap gap-1 pt-0.5">
            {kycStatus && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                kycStatus === "verified" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                KYC: {kycStatus}
              </span>
            )}
            {riskRating && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                riskRating === "low" ? "bg-green-50 text-green-700 border-green-200" : "bg-amber-50 text-amber-700 border-amber-200"
              }`}>
                Risk: {riskRating}
              </span>
            )}
            {amlFlag && (
              <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border ${
                amlFlag === "clear" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
              }`}>
                AML: {amlFlag}
              </span>
            )}
            {isJoint === true && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border bg-blue-50 text-blue-700 border-blue-200">
                Joint Account
              </span>
            )}
            {products && (
              <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium border bg-muted text-muted-foreground">
                {products.length} products
              </span>
            )}
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
    api: "/api/chat",
    maxSteps: 5,
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickPrompts = [
    { label: "Agent: Live address change", text: "I'm Sarah, a call centre agent. I'm on a call — the customer has moved to 221B Baker Street, London, NW1 6XE." },
    { label: "Manager: Review pending task", text: "I'm James, a case manager. I have a pending task to review an address change for CUST-123." },
    { label: "Guardrail test: Agent tries to approve", text: "I'm Sarah, an agent. I want to approve the pending address change for CUST-123." },
  ];

  return (
    <div className="flex flex-col h-screen max-w-2xl mx-auto">
      {/* Branded header */}
      <header className="bg-[#1F1F1F] text-white px-5 py-3 flex-shrink-0 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold tracking-tight">
            <span className="text-[#ECF3B7]">Canvas</span>
          </h1>
          <p className="text-[10px] text-white/40">
            Generative UI &middot; Address Servicing POC
          </p>
        </div>
        {messages.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setMessages([])}
            className="text-xs rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white"
          >
            New Chat
          </Button>
        )}
      </header>

      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="mt-16 space-y-4">
            <div className="text-center text-muted-foreground space-y-2">
              <p className="text-sm font-medium">Try one of these prompts:</p>
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              {quickPrompts.map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => {
                    handleInputChange({ target: { value: prompt.text } } as React.ChangeEvent<HTMLInputElement>);
                  }}
                  className="w-full text-left rounded-xl border px-4 py-3 hover:bg-[#ECF3B7]/20 hover:border-[#ECF3B7]/50 hover:text-foreground transition-colors"
                >
                  <p className="text-xs font-medium text-foreground">{prompt.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{prompt.text}</p>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              The third prompt tests the guardrail &mdash; agents can&apos;t approve (maker-checker policy).
            </p>
          </div>
        )}

        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-md ${
                message.role === "user"
                  ? "bg-[#1F1F1F] text-white rounded-2xl px-4 py-2.5 text-sm"
                  : "space-y-3"
              }`}
            >
              {/* Text content */}
              {message.content && (
                <p className={message.role === "assistant" ? "text-sm" : ""}>
                  {message.content}
                </p>
              )}

              {/* Tool invocations — render the actual UI components */}
              {message.toolInvocations?.map((invocation) => {
                if (invocation.state === "result") {
                  return (
                    <ToolResult
                      key={invocation.toolCallId}
                      toolName={invocation.toolName}
                      result={invocation.result}
                    />
                  );
                }
                // Loading state for tool calls in progress
                return (
                  <div key={invocation.toolCallId} className="text-xs text-muted-foreground animate-pulse">
                    Loading {invocation.toolName.replace(/_/g, " ")}...
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="flex gap-1 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.15s]" />
              <span className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce [animation-delay:0.3s]" />
            </div>
          </div>
        )}
      </div>

      {/* Input area */}
      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2 flex-shrink-0">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Type a message..."
          disabled={isLoading}
          className="flex-1 rounded-full px-4"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input.trim() || isLoading}
          className="rounded-full bg-[#1F1F1F] hover:bg-[#1F1F1F]/80 text-white"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
          </svg>
        </Button>
      </form>

      {/* Audit panel (floating) */}
      <AuditPanel />
    </div>
  );
}
