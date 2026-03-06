// Memory Pillar: Customer data layer
// Reads from src/data/customers.json — 5 customers with full 8-category schema.
// In production, replace with API calls to a backend service.

import customersData from "@/data/customers.json";

export interface Address {
  street: string;
  city: string;
  postcode: string;
}

export interface PendingChange extends Address {
  submittedBy: string;
  submittedAt: string;
  reason: string;
  origin: "call-centre" | "ebanking" | "branch";
  taskId?: string;
  experianScore?: number;
}

export interface CustomerIdentity {
  legalName: string;
  preferredName: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  taxId: string;
  kycStatus: "verified" | "pending" | "expired" | "failed";
  kycLastChecked: string;
}

export interface ContactInfo {
  currentAddress: Address;
  correspondenceAddress: Address | null;
  phoneMobile: string;
  phoneLandline: string | null;
  email: string;
  preferredChannel: "sms" | "email" | "post" | "phone";
  marketingConsent: boolean;
  digitalStatements: boolean;
}

export interface RelationshipInfo {
  customerType: "individual" | "corporate" | "joint";
  linkedAccountIds: string[];
  householdGroupId: string | null;
  relationshipManager: { name: string; employeeId: string; branch: string } | null;
  isJointAccount: boolean;
  jointHolders: { name: string; id: string }[];
}

export interface ComplianceData {
  amlFlag: "clear" | "review" | "alert" | "blocked";
  amlLastScreened: string;
  riskRating: "low" | "medium" | "high" | "very-high";
  sanctionsStatus: "clear" | "potential-match" | "confirmed-match";
  sanctionsLastScreened: string;
  pepStatus: boolean;
  consentPrivacy: boolean;
  dataRetentionPolicy: string;
}

export interface FinancialProfile {
  annualIncome: string;
  creditScore: number;
  creditScoreProvider: string;
  occupation: string;
  employerName: string;
  sourceOfFunds: string;
  sourceOfWealth: string;
}

export interface LinkedProduct {
  productType: string;
  accountNumber: string;
  sortCode: string;
  balance: string;
  status: "active" | "dormant" | "closed" | "arrears";
  linkedTo?: string;
}

export interface BehaviouralData {
  segment: "retail" | "sme" | "corporate" | "private-banking";
  primaryChannel: "branch" | "mobile" | "online" | "telephone";
  lastLoginChannel: string;
  lastLoginDate: string;
  monthlyTransactions: number;
  averageBalance: string;
  lastBranchVisit: string | null;
  customerSince: string;
}

export interface SecurityData {
  authMethod: "password" | "biometric" | "2fa";
  lastPasswordChange: string;
  failedLoginAttempts: number;
  fraudFlag: "clear" | "under-review" | "confirmed";
  fraudAlertDetail: string | null;
  deviceRegistered: boolean;
  lastSecurityReview: string;
}

export interface Customer {
  id: string;
  identity: CustomerIdentity;
  contact: ContactInfo;
  relationship: RelationshipInfo;
  compliance: ComplianceData;
  financial: FinancialProfile;
  products: LinkedProduct[];
  behaviour: BehaviouralData;
  security: SecurityData;
  pendingChange: PendingChange | null;
  // Convenience fields
  name: string;
  address: Address;
  tier: string;
  status: string;
  isJointAccount: boolean;
}

// Load all customers from the JSON data file
function loadCustomers(): Customer[] {
  return (customersData as unknown[]).map((raw) => {
    const c = raw as Record<string, unknown>;
    const identity = c.identity as CustomerIdentity;
    const contact = c.contact as ContactInfo;
    const relationship = c.relationship as RelationshipInfo;
    return {
      id: c.id as string,
      identity,
      contact,
      relationship,
      compliance: c.compliance as ComplianceData,
      financial: c.financial as FinancialProfile,
      products: c.products as LinkedProduct[],
      behaviour: c.behaviour as BehaviouralData,
      security: c.security as SecurityData,
      pendingChange: (c.pendingChange as PendingChange) || null,
      // Convenience
      name: identity.preferredName,
      address: contact.currentAddress,
      tier: c.tier as string,
      status: c.status as string,
      isJointAccount: relationship.isJointAccount,
    };
  });
}

const customers = loadCustomers();

// Get a single customer by ID (defaults to CUST-123 for backward compatibility)
export function getCustomer(customerId?: string): Customer {
  const id = customerId || "CUST-123";
  const found = customers.find((c) => c.id === id);
  if (!found) return customers[0]; // fallback
  return found;
}

// Get all customers (for future use — e.g. customer picker)
export function getAllCustomers(): Customer[] {
  return customers;
}

export function submitAddressUpdate(data: {
  customerId: string;
  updatedBy: string;
  street: string;
  city: string;
  postcode: string;
  action?: string;
}) {
  return {
    status: "success",
    message: `Address ${data.action === "rejected" ? "change rejected" : "updated"} successfully`,
    timestamp: new Date().toISOString(),
    updatedBy: data.updatedBy,
  };
}
