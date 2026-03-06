"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface AddressFormProps {
  customerName: string;
  customerId: string;
  tier: string;
  currentStreet: string;
  currentCity: string;
  currentPostcode: string;
  prefillStreet?: string;
  prefillCity?: string;
  prefillPostcode?: string;
  isJointAccount?: string;
  // Enriched data fields
  kycStatus?: string;
  kycLastChecked?: string;
  riskRating?: string;
  amlFlag?: string;
  fraudFlag?: string;
  creditScore?: string;
  segment?: string;
  preferredChannel?: string;
  customerSince?: string;
  linkedProducts?: string; // JSON string of product summaries
  jointHolders?: string; // JSON string
  relationshipManager?: string;
  phoneMobile?: string;
  email?: string;
}

// UK postcode regex
const UK_POSTCODE_REGEX = /^[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}$/i;

const CHANGE_REASONS = [
  "Customer moved house",
  "Previous address incorrect",
  "Correspondence address update",
  "Returned mail / gone away",
  "Other",
];

// Mock PAF (Postcode Address File) lookup — simulates the real PAF gateway integration
const MOCK_PAF: Record<string, { street: string; city: string }[]> = {
  "NW1 6XE": [
    { street: "221B Baker Street", city: "London" },
    { street: "223 Baker Street", city: "London" },
    { street: "225 Baker Street", city: "London" },
  ],
  "SW1A 2AA": [
    { street: "10 Downing Street", city: "London" },
    { street: "11 Downing Street", city: "London" },
  ],
  "EC2R 8AH": [
    { street: "1 Bank Junction", city: "London" },
    { street: "3 Bank Junction", city: "London" },
  ],
  "M1 1AE": [
    { street: "1 Piccadilly", city: "Manchester" },
    { street: "3 Piccadilly", city: "Manchester" },
  ],
};

// Mock Experian Identity Hub score (0-9, threshold > 5 to pass)
function getMockExperianScore(street: string, postcode: string): number {
  if (!street || !postcode) return 0;
  const hasNumber = /\d/.test(street);
  const hasStreetWord = /street|road|lane|avenue|drive|close|way|place|junction/i.test(street);
  const postcodeValid = UK_POSTCODE_REGEX.test(postcode);
  let score = 3;
  if (hasNumber) score += 2;
  if (hasStreetWord) score += 2;
  if (postcodeValid) score += 2;
  return Math.min(score, 9);
}

// Status colour helpers
function kycBadgeStyle(status: string) {
  switch (status) {
    case "verified": return "bg-green-50 text-green-700 border-green-200";
    case "pending": return "bg-amber-50 text-amber-700 border-amber-200";
    case "expired": return "bg-red-50 text-red-700 border-red-200";
    case "failed": return "bg-red-50 text-red-700 border-red-200";
    default: return "bg-muted text-muted-foreground";
  }
}

function riskBadgeStyle(rating: string) {
  switch (rating) {
    case "low": return "bg-green-50 text-green-700 border-green-200";
    case "medium": return "bg-amber-50 text-amber-700 border-amber-200";
    case "high": return "bg-red-50 text-red-700 border-red-200";
    case "very-high": return "bg-red-100 text-red-800 border-red-300";
    default: return "bg-muted text-muted-foreground";
  }
}

export function AddressForm({
  customerName,
  customerId,
  tier,
  currentStreet,
  currentCity,
  currentPostcode,
  prefillStreet = "",
  prefillCity = "",
  prefillPostcode = "",
  isJointAccount = "false",
  kycStatus,
  kycLastChecked,
  riskRating,
  amlFlag,
  fraudFlag,
  creditScore,
  segment,
  preferredChannel,
  customerSince,
  linkedProducts,
  jointHolders,
  relationshipManager,
  phoneMobile,
  email,
}: AddressFormProps) {
  const [street, setStreet] = useState(prefillStreet);
  const [city, setCity] = useState(prefillCity || "");
  const [postcode, setPostcode] = useState(prefillPostcode);
  const [reason, setReason] = useState(CHANGE_REASONS[0]);
  const [effectiveDate, setEffectiveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [applyToJoint, setApplyToJoint] = useState(false);
  const [updateCorrespondence, setUpdateCorrespondence] = useState<"auto" | "prompt" | null>(null);
  const [step, setStep] = useState<"edit" | "confirm">("edit");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [showProfile, setShowProfile] = useState(false);

  // PAF lookup state
  const [pafResults, setPafResults] = useState<{ street: string; city: string }[]>([]);
  const [showPafDropdown, setShowPafDropdown] = useState(false);

  // Validation state
  const [postcodeError, setPostcodeError] = useState("");
  const [streetError, setStreetError] = useState("");

  // Experian score
  const experianScore = useMemo(() => getMockExperianScore(street, postcode), [street, postcode]);
  const experianPass = experianScore > 5;

  // Parse enriched JSON fields
  const products = useMemo(() => {
    try { return linkedProducts ? JSON.parse(linkedProducts) : []; }
    catch { return []; }
  }, [linkedProducts]);

  const jointHoldersList = useMemo(() => {
    try { return jointHolders ? JSON.parse(jointHolders) : []; }
    catch { return []; }
  }, [jointHolders]);

  // PAF lookup when postcode changes
  useEffect(() => {
    if (!postcode) { setPafResults([]); return; }
    const normalised = postcode.replace(/\s/g, " ").toUpperCase().trim();
    const matches = MOCK_PAF[normalised];
    if (matches) {
      setPafResults(matches);
      setShowPafDropdown(true);
    } else {
      setPafResults([]);
      setShowPafDropdown(false);
    }
  }, [postcode]);

  // Real-time postcode validation
  useEffect(() => {
    if (!postcode) { setPostcodeError(""); return; }
    if (!UK_POSTCODE_REGEX.test(postcode)) {
      setPostcodeError("Enter a valid UK postcode");
    } else {
      setPostcodeError("");
    }
  }, [postcode]);

  // Street validation
  useEffect(() => {
    if (!street) { setStreetError(""); return; }
    if (street.length < 3) {
      setStreetError("Street address is too short");
    } else {
      setStreetError("");
    }
  }, [street]);

  // Calculate days until effective
  const daysUntilEffective = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eff = new Date(effectiveDate);
    eff.setHours(0, 0, 0, 0);
    return Math.ceil((eff.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }, [effectiveDate]);

  const isValid =
    street.length >= 3 &&
    city.length > 0 &&
    UK_POSTCODE_REGEX.test(postcode) &&
    reason.length > 0 &&
    experianPass;

  const handlePafSelect = (result: { street: string; city: string }) => {
    setStreet(result.street);
    setCity(result.city);
    setShowPafDropdown(false);
  };

  const handleSubmit = async () => {
    setStatus("submitting");
    try {
      const res = await fetch("/api/chat/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          updatedBy: "Sarah",
          street,
          city,
          postcode,
          reason,
          effectiveDate,
          applyToJoint,
          updateCorrespondence,
          experianScore,
        }),
      });
      if (res.ok) {
        setStatus("success");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  // Customer Profile Panel (collapsible)
  const hasEnrichedData = kycStatus || riskRating || creditScore || linkedProducts;

  const ProfilePanel = () => {
    if (!hasEnrichedData) return null;

    return (
      <div className="rounded-md border bg-muted/20 overflow-hidden">
        <button
          onClick={() => setShowProfile(!showProfile)}
          className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium hover:bg-muted/40 transition-colors"
        >
          <span>Customer Profile</span>
          <svg
            className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${showProfile ? "rotate-180" : ""}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showProfile && (
          <div className="px-3 pb-3 space-y-2.5">
            {/* Compliance flags row */}
            <div className="flex flex-wrap gap-1.5">
              {kycStatus && (
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${kycBadgeStyle(kycStatus)}`}>
                  KYC: {kycStatus}
                  {kycLastChecked && <span className="ml-1 opacity-70">({kycLastChecked})</span>}
                </span>
              )}
              {riskRating && (
                <span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium ${riskBadgeStyle(riskRating)}`}>
                  Risk: {riskRating}
                </span>
              )}
              {amlFlag && amlFlag !== "clear" && (
                <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium bg-red-50 text-red-700 border-red-200">
                  AML: {amlFlag}
                </span>
              )}
              {amlFlag === "clear" && (
                <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium bg-green-50 text-green-700 border-green-200">
                  AML: clear
                </span>
              )}
              {fraudFlag && fraudFlag !== "clear" && (
                <span className="inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium bg-red-100 text-red-800 border-red-300 animate-pulse">
                  FRAUD: {fraudFlag}
                </span>
              )}
            </div>

            {/* Key details grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px]">
              {creditScore && (
                <>
                  <span className="text-muted-foreground">Credit Score</span>
                  <span className="font-medium">{creditScore}</span>
                </>
              )}
              {segment && (
                <>
                  <span className="text-muted-foreground">Segment</span>
                  <span className="font-medium capitalize">{segment}</span>
                </>
              )}
              {preferredChannel && (
                <>
                  <span className="text-muted-foreground">Preferred Channel</span>
                  <span className="font-medium capitalize">{preferredChannel}</span>
                </>
              )}
              {customerSince && (
                <>
                  <span className="text-muted-foreground">Customer Since</span>
                  <span className="font-medium">{new Date(customerSince).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}</span>
                </>
              )}
              {phoneMobile && (
                <>
                  <span className="text-muted-foreground">Mobile</span>
                  <span className="font-medium font-mono text-[10px]">{phoneMobile}</span>
                </>
              )}
              {email && (
                <>
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-[10px] truncate">{email}</span>
                </>
              )}
              {relationshipManager && (
                <>
                  <span className="text-muted-foreground">RM</span>
                  <span className="font-medium">{relationshipManager}</span>
                </>
              )}
            </div>

            {/* Joint holders */}
            {isJointAccount === "true" && jointHoldersList.length > 0 && (
              <div className="text-[11px]">
                <span className="text-muted-foreground">Joint holders: </span>
                <span className="font-medium">{jointHoldersList.map((h: { name: string }) => h.name).join(", ")}</span>
              </div>
            )}

            {/* Linked products */}
            {products.length > 0 && (
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">Linked Products</p>
                <div className="flex flex-wrap gap-1">
                  {products.map((p: { productType: string; accountNumber: string; status: string; balance: string }, i: number) => (
                    <span
                      key={i}
                      className={`inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[10px] ${
                        p.status === "active" ? "bg-background" : p.status === "arrears" ? "bg-red-50 border-red-200" : "bg-muted/50"
                      }`}
                    >
                      <span className="font-medium capitalize">{p.productType.replace("-", " ")}</span>
                      <span className="text-muted-foreground">{p.accountNumber}</span>
                      <span className="text-muted-foreground">{p.balance}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Success state
  if (status === "success") {
    return (
      <Card className="border-green-200 bg-green-50 w-full max-w-md">
        <CardContent className="pt-6 space-y-2">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <p className="font-medium text-green-800">Address updated</p>
          </div>
          <p className="text-sm text-green-600">{street}, {city}, {postcode}</p>
          <div className="space-y-1 text-xs text-green-600">
            <p>Reason: {reason} &middot; Effective: {effectiveDate}</p>
            <p>Experian score: {experianScore}/9 &middot; Change logged to audit trail</p>
            {applyToJoint && <p>Applied to joint account holders</p>}
          </div>
          {daysUntilEffective > 5 && (
            <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
              Confirmation letter will be sent to the existing address ({currentStreet}) as the change is more than 5 days out.
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Step 2: Confirmation screen
  if (step === "confirm") {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Confirm Address Change</CardTitle>
            <Badge variant="secondary">{tier}</Badge>
          </div>
          <p className="text-sm text-muted-foreground">{customerName} &middot; {customerId}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Before / After */}
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-md bg-red-50 border border-red-200 p-2.5">
              <p className="text-xs font-medium text-red-600 mb-1">Before</p>
              <p className="text-sm">{currentStreet}</p>
              <p className="text-xs text-muted-foreground">{currentCity}, {currentPostcode}</p>
            </div>
            <div className="rounded-md bg-green-50 border border-green-200 p-2.5">
              <p className="text-xs font-medium text-green-600 mb-1">After</p>
              <p className="text-sm">{street}</p>
              <p className="text-xs text-muted-foreground">{city}, {postcode}</p>
            </div>
          </div>

          {/* Experian score badge */}
          <div className={`flex items-center gap-2 rounded-md p-2 text-xs ${
            experianPass ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <span className={`font-mono font-bold ${experianPass ? "text-green-700" : "text-red-700"}`}>
              {experianScore}/9
            </span>
            <span className={experianPass ? "text-green-700" : "text-red-700"}>
              Experian Identity Hub &mdash; {experianPass ? "Address verified" : "Below threshold (min 6 required)"}
            </span>
          </div>

          <Separator />

          {/* Change details */}
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex justify-between">
              <span>Reason</span>
              <span className="font-medium text-foreground">{reason}</span>
            </div>
            <div className="flex justify-between">
              <span>Effective date</span>
              <span className="font-medium text-foreground">{effectiveDate}</span>
            </div>
            {applyToJoint && (
              <div className="flex justify-between">
                <span>Joint account</span>
                <span className="font-medium text-foreground">Applied to all holders</span>
              </div>
            )}
            {updateCorrespondence && (
              <div className="flex justify-between">
                <span>Correspondence address</span>
                <span className="font-medium text-foreground">
                  {updateCorrespondence === "auto" ? "Auto-updated" : "Kept separate"}
                </span>
              </div>
            )}
          </div>

          {/* Impact notices */}
          <div className="space-y-1.5">
            {daysUntilEffective > 5 ? (
              <div className="rounded-md bg-amber-50 border border-amber-200 p-2 text-xs text-amber-800">
                Confirmation letter will be sent to the <strong>existing address</strong> as the effective date is more than 5 days away.
              </div>
            ) : (
              <div className="rounded-md bg-blue-50 border border-blue-200 p-2 text-xs text-blue-800">
                Confirmation letter will be sent to the <strong>new address</strong>.
              </div>
            )}
            <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
              Any existing pending address changes for this customer will be deactivated.
            </div>
          </div>

          {status === "error" && (
            <p className="text-sm text-destructive">Something went wrong. Please try again.</p>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setStep("edit")} className="flex-1" disabled={status === "submitting"}>
              Back
            </Button>
            <Button onClick={handleSubmit} className="flex-1" disabled={status === "submitting"}>
              {status === "submitting" ? "Submitting..." : "Confirm & Submit"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Step 1: Edit form
  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Update Address</CardTitle>
          <Badge variant="secondary">{tier}</Badge>
        </div>
        <p className="text-sm text-muted-foreground">{customerName} &middot; {customerId}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Collapsible customer profile */}
        <ProfilePanel />

        {/* Current address */}
        <div className="rounded-md bg-muted/50 p-2 text-xs text-muted-foreground">
          Current: {currentStreet}, {currentCity}, {currentPostcode}
        </div>

        {/* Postcode-first entry (PAF lookup) */}
        <div className="relative">
          <Label htmlFor="postcode" className="text-xs">Postcode (PAF Lookup)</Label>
          <Input
            id="postcode"
            value={postcode}
            onChange={(e) => setPostcode(e.target.value.toUpperCase())}
            placeholder="Enter postcode to find address"
            autoFocus
            className={postcodeError ? "border-destructive" : ""}
          />
          {postcodeError && <p className="text-xs text-destructive mt-0.5">{postcodeError}</p>}

          {/* PAF dropdown */}
          {showPafDropdown && pafResults.length > 0 && (
            <div className="absolute z-10 mt-1 w-full rounded-md border bg-background shadow-lg">
              <p className="px-3 py-1.5 text-xs text-muted-foreground border-b">
                PAF — {pafResults.length} addresses found
              </p>
              {pafResults.map((r, i) => (
                <button
                  key={i}
                  onClick={() => handlePafSelect(r)}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-muted/50 transition-colors border-b last:border-0"
                >
                  {r.street}, {r.city}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Street and city */}
        <div className="space-y-2">
          <div>
            <Label htmlFor="street" className="text-xs">Street Address</Label>
            <Input
              id="street"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="e.g. 221B Baker Street"
              className={streetError ? "border-destructive" : ""}
            />
            {streetError && <p className="text-xs text-destructive mt-0.5">{streetError}</p>}
          </div>
          <div>
            <Label htmlFor="city" className="text-xs">City</Label>
            <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
          </div>
        </div>

        {/* Experian score indicator (live) */}
        {street && postcode && UK_POSTCODE_REGEX.test(postcode) && (
          <div className={`flex items-center gap-2 rounded-md p-2 text-xs ${
            experianPass ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
          }`}>
            <span className={`font-mono font-bold ${experianPass ? "text-green-700" : "text-red-700"}`}>
              {experianScore}/9
            </span>
            <span className={experianPass ? "text-green-700" : "text-red-700"}>
              Experian Identity Hub {experianPass ? "— Verified" : "— Below threshold"}
            </span>
          </div>
        )}

        <Separator />

        {/* Reason for change */}
        <div>
          <Label htmlFor="reason" className="text-xs">Reason for Change</Label>
          <select
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {CHANGE_REASONS.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </div>

        {/* Effective date */}
        <div>
          <Label htmlFor="effectiveDate" className="text-xs">Effective Date</Label>
          <Input
            id="effectiveDate"
            type="date"
            value={effectiveDate}
            onChange={(e) => setEffectiveDate(e.target.value)}
          />
        </div>

        {/* Correspondence address update prompt */}
        <div className="rounded-md border p-2.5 space-y-2">
          <p className="text-xs font-medium">Update correspondence address?</p>
          <div className="flex gap-2">
            <button
              onClick={() => setUpdateCorrespondence("auto")}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs border transition-colors ${
                updateCorrespondence === "auto"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              Yes, update both
            </button>
            <button
              onClick={() => setUpdateCorrespondence("prompt")}
              className={`flex-1 rounded-md px-2 py-1.5 text-xs border transition-colors ${
                updateCorrespondence === "prompt"
                  ? "bg-primary text-primary-foreground border-primary"
                  : "hover:bg-muted/50"
              }`}
            >
              No, keep separate
            </button>
          </div>
        </div>

        {/* Joint account option */}
        {isJointAccount === "true" && (
          <label className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={applyToJoint}
              onChange={(e) => setApplyToJoint(e.target.checked)}
              className="rounded border-input"
            />
            Apply this change to all joint account holders
          </label>
        )}

        {!experianPass && street && postcode && UK_POSTCODE_REGEX.test(postcode) && (
          <p className="text-xs text-destructive">
            Address verification failed. Please check the details or use the PAF lookup above.
          </p>
        )}

        <Button
          onClick={() => setStep("confirm")}
          disabled={!isValid}
          className="w-full"
        >
          Review Change
        </Button>
      </CardContent>
    </Card>
  );
}
