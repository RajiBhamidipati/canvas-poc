// Guardrails Pillar: In-app audit log
// Replaces LangSmith for the POC — every AI decision is logged and visible in the UI.

export interface AuditEntry {
  id: string;
  timestamp: string;
  persona: string;
  action: string;
  toolCalled: string;
  customerId: string;
  guardrailTriggered: boolean;
  detail?: string;
}

// In-memory audit log (resets on server restart — fine for POC)
const auditLog: AuditEntry[] = [];

export function logAudit(entry: Omit<AuditEntry, "id" | "timestamp">): AuditEntry {
  const fullEntry: AuditEntry = {
    ...entry,
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  auditLog.push(fullEntry);
  console.log(`[AUDIT] ${fullEntry.persona} → ${fullEntry.action} (${fullEntry.toolCalled})`);
  return fullEntry;
}

export function getAuditLog(): AuditEntry[] {
  return [...auditLog];
}

export function clearAuditLog(): void {
  auditLog.length = 0;
}
