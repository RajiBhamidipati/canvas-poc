"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

interface ApprovalViewProps {
  customerName: string;
  customerId: string;
  tier: string;
  currentStreet: string;
  currentCity: string;
  currentPostcode: string;
  proposedStreet: string;
  proposedCity: string;
  proposedPostcode: string;
  submittedBy: string;
  submittedAt: string;
  reason?: string;
  origin?: string;
  taskId?: string;
  experianScore?: string;
  isJointAccount?: string;
  // Enriched data fields for governance
  kycStatus?: string;
  kycLastChecked?: string;
  riskRating?: string;
  amlFlag?: string;
  amlLastScreened?: string;
  sanctionsStatus?: string;
  pepStatus?: string;
  fraudFlag?: string;
  creditScore?: string;
  creditScoreProvider?: string;
  annualIncome?: string;
  occupation?: string;
  sourceOfFunds?: string;
  segment?: string;
  customerSince?: string;
  linkedProducts?: string;
  jointHolders?: string;
  relationshipManager?: string;
  authMethod?: string;
  lastSecurityReview?: string;
  failedLoginAttempts?: string;
  primaryChannel?: string;
  monthlyTransactions?: string;
}

type Decision = "pending" | "approved" | "amended" | "rejected";

// Badge styling helpers
function statusBadge(value: string, goodValues: string[]) {
  if (goodValues.includes(value)) return "bg-green-50 text-green-700 border-green-200";
  return "bg-red-50 text-red-700 border-red-200";
}

export function ApprovalView({
  customerName,
  customerId,
  tier,
  currentStreet,
  currentCity,
  currentPostcode,
  proposedStreet,
  proposedCity,
  proposedPostcode,
  submittedBy,
  submittedAt,
  reason,
  origin,
  taskId,
  experianScore,
  isJointAccount,
  kycStatus,
  kycLastChecked,
  riskRating,
  amlFlag,
  amlLastScreened,
  sanctionsStatus,
  pepStatus,
  fraudFlag,
  creditScore,
  creditScoreProvider,
  annualIncome,
  occupation,
  sourceOfFunds,
  segment,
  customerSince,
  linkedProducts,
  jointHolders,
  relationshipManager,
  authMethod,
  lastSecurityReview,
  failedLoginAttempts,
  primaryChannel,
  monthlyTransactions,
}: ApprovalViewProps) {
  const expScore = parseInt(experianScore || "0");
  const expPass = expScore > 5;
  const [decision, setDecision] = useState<Decision>("pending");
  const [notes, setNotes] = useState("");
  const [showAmend, setShowAmend] = useState(false);
  const [amendStreet, setAmendStreet] = useState(proposedStreet);
  const [amendCity, setAmendCity] = useState(proposedCity);
  const [amendPostcode, setAmendPostcode] = useState(proposedPostcode);
  const [activeTab, setActiveTab] = useState<"change" | "compliance" | "profile">("change");

  const hasEnrichedData = kycStatus || riskRating || creditScore || linkedProducts;

  // Parse enriched JSON fields
  const products = useMemo(() => {
    try { return linkedProducts ? JSON.parse(linkedProducts) : []; }
    catch { return []; }
  }, [linkedProducts]);

  const jointHoldersList = useMemo(() => {
    try { return jointHolders ? JSON.parse(jointHolders) : []; }
    catch { return []; }
  }, [jointHolders]);

  const handleDecision = async (action: Decision) => {
    const payload = {
      customerId,
      updatedBy: "James",
      action,
      street: action === "amended" ? amendStreet : proposedStreet,
      city: action === "amended" ? amendCity : proposedCity,
      postcode: action === "amended" ? amendPostcode : proposedPostcode,
      notes,
    };

    try {
      await fetch("/api/chat/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setDecision(action);
    } catch {
      // Silently fail for POC
    }
  };

  // Decision made — show task closed confirmation
  if (decision !== "pending") {
    const colours: Record<Decision, { bg: string; border: string; text: string; icon: string }> = {
      approved: { bg: "bg-green-50", border: "border-green-200", text: "text-green-800", icon: "text-green-600" },
      amended: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-800", icon: "text-blue-600" },
      rejected: { bg: "bg-red-50", border: "border-red-200", text: "text-red-800", icon: "text-red-600" },
      pending: { bg: "", border: "", text: "", icon: "" },
    };
    const c = colours[decision];
    const labels: Record<string, string> = {
      approved: "Address change approved",
      amended: "Address amended and approved",
      rejected: "Address change rejected",
    };

    return (
      <Card className={`w-full max-w-lg ${c.border} ${c.bg}`}>
        <CardContent className="pt-6 space-y-2">
          <div className="flex items-center gap-2">
            <svg className={`h-5 w-5 ${c.icon}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {decision === "rejected" ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              )}
            </svg>
            <p className={`font-medium ${c.text}`}>{labels[decision]}</p>
          </div>
          {notes && <p className="text-xs text-muted-foreground">Notes: {notes}</p>}
          <Separator />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Task closed</span>
            <span>Decision logged for {customerId}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const DiffBlock = ({
    label,
    street,
    city,
    postcode,
    variant,
  }: {
    label: string;
    street: string;
    city: string;
    postcode: string;
    variant: "current" | "proposed";
  }) => (
    <div
      className={`flex-1 rounded-md p-2.5 ${
        variant === "current"
          ? "bg-red-50 border border-red-200"
          : "bg-green-50 border border-green-200"
      }`}
    >
      <p className={`text-xs font-medium mb-1 ${variant === "current" ? "text-red-600" : "text-green-600"}`}>
        {label}
      </p>
      <p className="text-sm font-medium">{street}</p>
      <p className="text-xs text-muted-foreground">{city}, {postcode}</p>
    </div>
  );

  // Tab content renderers
  const ChangeTab = () => (
    <div className="space-y-3">
      {/* Request details and origin */}
      <div className="space-y-1.5">
        {reason && (
          <div className="rounded-md bg-muted/50 p-2 text-xs">
            <span className="text-muted-foreground">Reason: </span>
            <span className="font-medium">{reason}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          {origin && (
            <div className="rounded-md bg-muted/50 px-2 py-1 text-[10px]">
              Origin: <span className="font-medium">
                {origin === "ebanking" ? "eBanking Self-Service" : origin === "call-centre" ? "Call Centre" : "Branch"}
              </span>
            </div>
          )}
          {experianScore && (
            <div className={`rounded-md px-2 py-1 text-[10px] ${
              expPass ? "bg-green-50 border border-green-200 text-green-700" : "bg-red-50 border border-red-200 text-red-700"
            }`}>
              Experian: <span className="font-mono font-bold">{expScore}/9</span>
              {expPass ? " Verified" : " Below threshold"}
            </div>
          )}
        </div>
      </div>

      {/* Before / After diff */}
      <div className="flex items-center gap-2">
        <DiffBlock label="Current" street={currentStreet} city={currentCity} postcode={currentPostcode} variant="current" />
        <svg className="h-4 w-4 text-muted-foreground flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
        <DiffBlock label="Proposed" street={proposedStreet} city={proposedCity} postcode={proposedPostcode} variant="proposed" />
      </div>

      {/* Amend section (expandable) */}
      {showAmend && (
        <div className="rounded-md border border-blue-200 bg-blue-50/50 p-3 space-y-2">
          <p className="text-xs font-medium text-blue-700">Amend Address</p>
          <div>
            <Label htmlFor="amend-street" className="text-xs">Street</Label>
            <Input id="amend-street" value={amendStreet} onChange={(e) => setAmendStreet(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="amend-city" className="text-xs">City</Label>
              <Input id="amend-city" value={amendCity} onChange={(e) => setAmendCity(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="amend-postcode" className="text-xs">Postcode</Label>
              <Input id="amend-postcode" value={amendPostcode} onChange={(e) => setAmendPostcode(e.target.value.toUpperCase())} />
            </div>
          </div>
          <Button
            onClick={() => handleDecision("amended")}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            size="sm"
          >
            Submit Amendment
          </Button>
        </div>
      )}
    </div>
  );

  const ComplianceTab = () => (
    <div className="space-y-3">
      {/* Compliance flags */}
      <div className="flex flex-wrap gap-1.5">
        {kycStatus && (
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${statusBadge(kycStatus, ["verified"])}`}>
            KYC: {kycStatus}
          </span>
        )}
        {riskRating && (
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${statusBadge(riskRating, ["low"])}`}>
            Risk: {riskRating}
          </span>
        )}
        {amlFlag && (
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${statusBadge(amlFlag, ["clear"])}`}>
            AML: {amlFlag}
          </span>
        )}
        {sanctionsStatus && (
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${statusBadge(sanctionsStatus, ["clear"])}`}>
            Sanctions: {sanctionsStatus}
          </span>
        )}
        {pepStatus === "true" && (
          <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium bg-amber-50 text-amber-700 border-amber-200">
            PEP
          </span>
        )}
        {fraudFlag && (
          <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium ${
            fraudFlag === "clear" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-100 text-red-800 border-red-300 animate-pulse"
          }`}>
            Fraud: {fraudFlag}
          </span>
        )}
      </div>

      {/* Screening dates */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {kycLastChecked && (
          <>
            <span className="text-muted-foreground">KYC Last Checked</span>
            <span className="font-medium">{kycLastChecked}</span>
          </>
        )}
        {amlLastScreened && (
          <>
            <span className="text-muted-foreground">AML Last Screened</span>
            <span className="font-medium">{amlLastScreened}</span>
          </>
        )}
        {lastSecurityReview && (
          <>
            <span className="text-muted-foreground">Security Review</span>
            <span className="font-medium">{lastSecurityReview}</span>
          </>
        )}
        {authMethod && (
          <>
            <span className="text-muted-foreground">Auth Method</span>
            <span className="font-medium capitalize">{authMethod}</span>
          </>
        )}
        {failedLoginAttempts && parseInt(failedLoginAttempts) > 0 && (
          <>
            <span className="text-muted-foreground">Failed Logins</span>
            <span className="font-medium text-red-600">{failedLoginAttempts}</span>
          </>
        )}
      </div>

      {/* Joint holders with IDs */}
      {isJointAccount === "true" && jointHoldersList.length > 0 && (
        <div className="rounded-md border bg-muted/20 p-2 space-y-1">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Joint Account Holders</p>
          {jointHoldersList.map((h: { name: string; id: string }, i: number) => (
            <div key={i} className="flex justify-between text-[11px]">
              <span>{h.name}</span>
              <span className="font-mono text-muted-foreground">{h.id}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const ProfileTab = () => (
    <div className="space-y-3">
      {/* Financial summary */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
        {creditScore && (
          <>
            <span className="text-muted-foreground">Credit Score</span>
            <span className="font-medium">{creditScore}{creditScoreProvider ? ` (${creditScoreProvider})` : ""}</span>
          </>
        )}
        {annualIncome && (
          <>
            <span className="text-muted-foreground">Annual Income</span>
            <span className="font-medium">{annualIncome}</span>
          </>
        )}
        {occupation && (
          <>
            <span className="text-muted-foreground">Occupation</span>
            <span className="font-medium">{occupation}</span>
          </>
        )}
        {sourceOfFunds && (
          <>
            <span className="text-muted-foreground">Source of Funds</span>
            <span className="font-medium">{sourceOfFunds}</span>
          </>
        )}
        {segment && (
          <>
            <span className="text-muted-foreground">Segment</span>
            <span className="font-medium capitalize">{segment}</span>
          </>
        )}
        {customerSince && (
          <>
            <span className="text-muted-foreground">Customer Since</span>
            <span className="font-medium">{new Date(customerSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
          </>
        )}
        {primaryChannel && (
          <>
            <span className="text-muted-foreground">Primary Channel</span>
            <span className="font-medium capitalize">{primaryChannel}</span>
          </>
        )}
        {monthlyTransactions && (
          <>
            <span className="text-muted-foreground">Monthly Txns</span>
            <span className="font-medium">{monthlyTransactions}</span>
          </>
        )}
        {relationshipManager && (
          <>
            <span className="text-muted-foreground">Relationship Manager</span>
            <span className="font-medium">{relationshipManager}</span>
          </>
        )}
      </div>

      {/* Linked products */}
      {products.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Linked Products ({products.length})</p>
          <div className="space-y-1">
            {products.map((p: { productType: string; accountNumber: string; status: string; balance: string; sortCode: string }, i: number) => (
              <div
                key={i}
                className={`flex items-center justify-between rounded-md border px-2 py-1.5 text-[11px] ${
                  p.status === "arrears" ? "bg-red-50 border-red-200" : "bg-background"
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="font-medium capitalize">{p.productType.replace("-", " ")}</span>
                  <span className="font-mono text-muted-foreground text-[10px]">{p.accountNumber}</span>
                  {p.sortCode && <span className="font-mono text-muted-foreground text-[10px]">{p.sortCode}</span>}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{p.balance}</span>
                  <span className={`rounded px-1 py-0.5 text-[9px] font-medium ${
                    p.status === "active" ? "bg-green-50 text-green-700" :
                    p.status === "arrears" ? "bg-red-50 text-red-700" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Address Change Review</CardTitle>
          <div className="flex items-center gap-1.5">
            {taskId && (
              <Badge variant="secondary" className="text-[10px] font-mono">{taskId}</Badge>
            )}
            <Badge variant="outline">Pending Approval</Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          {customerName} &middot; {customerId} &middot; {tier}
          {isJointAccount === "true" && " &middot; Joint Account"}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Tabbed sections — only show tabs if enriched data present */}
        {hasEnrichedData ? (
          <>
            <div className="flex border-b">
              {(["change", "compliance", "profile"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-medium border-b-2 transition-colors capitalize ${
                    activeTab === tab
                      ? "border-foreground text-foreground"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "change" ? "Change Details" : tab === "compliance" ? "Compliance" : "Customer Profile"}
                </button>
              ))}
            </div>

            {activeTab === "change" && <ChangeTab />}
            {activeTab === "compliance" && <ComplianceTab />}
            {activeTab === "profile" && <ProfileTab />}
          </>
        ) : (
          <ChangeTab />
        )}

        <Separator />

        {/* Metadata */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Submitted by {submittedBy}</span>
          <span>
            {new Date(submittedAt).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        {/* Supporting notes */}
        <div>
          <Label htmlFor="notes" className="text-xs">Notes (optional)</Label>
          <textarea
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Add supporting notes for the audit trail..."
            rows={2}
            className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <Button
            onClick={() => handleDecision("approved")}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white"
          >
            Approve
          </Button>
          <Button
            onClick={() => setShowAmend(!showAmend)}
            variant="outline"
            className="flex-1 border-blue-300 text-blue-700 hover:bg-blue-50"
          >
            Amend
          </Button>
          <Button
            onClick={() => handleDecision("rejected")}
            variant="destructive"
            className="flex-1"
          >
            Reject
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
