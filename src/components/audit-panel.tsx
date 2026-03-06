"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { AuditEntry } from "@/lib/audit";

export function AuditPanel() {
  const [entries, setEntries] = useState<AuditEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  // Poll audit log every 2 seconds
  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/audit");
        if (res.ok) {
          const data = await res.json();
          setEntries(data);
        }
      } catch {
        // Silently fail
      }
    };

    poll();
    const interval = setInterval(poll, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full bg-foreground text-background px-4 py-2 text-sm font-medium shadow-lg hover:opacity-90 transition-opacity"
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        Audit Log
        {entries.length > 0 && (
          <Badge variant="secondary" className="ml-1 text-xs">
            {entries.length}
          </Badge>
        )}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-12 right-0 w-96 max-h-80 rounded-lg border bg-background shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <h3 className="text-sm font-semibold">Audit Trail</h3>
            <span className="text-xs text-muted-foreground">Guardrails Pillar</span>
          </div>
          <ScrollArea className="max-h-64 p-2">
            {entries.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                No actions recorded yet
              </p>
            ) : (
              <div className="space-y-1">
                {[...entries].reverse().map((entry) => (
                  <div
                    key={entry.id}
                    className={`rounded-md px-3 py-2 text-xs ${
                      entry.guardrailTriggered
                        ? "bg-red-50 border border-red-200"
                        : "bg-muted/50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium">
                        {entry.persona}
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(entry.timestamp).toLocaleTimeString("en-GB", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Badge
                        variant={entry.guardrailTriggered ? "destructive" : "secondary"}
                        className="text-[10px] px-1.5 py-0"
                      >
                        {entry.toolCalled}
                      </Badge>
                      <span className="text-muted-foreground">{entry.action}</span>
                    </div>
                    {entry.detail && (
                      <p className="text-muted-foreground mt-0.5">{entry.detail}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
