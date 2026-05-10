"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import {
  FileText, Zap, UserCheck, ChevronRight, CheckCircle, XCircle,
  Info, FileWarning, AlertTriangle, RefreshCw, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface AuditLog {
  id: string;
  applicationId: string | null;
  actor: string;
  action: string;
  details: string | null;
  createdAt: string;
  application: {
    applicantName: string;
    organizationName: string;
    grantProgram: string;
  } | null;
}

const ACTION_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  "Application Submitted": { icon: <FileText className="h-4 w-4" />, color: "text-slate-600", bg: "bg-slate-100" },
  "AI Review Generated": { icon: <Zap className="h-4 w-4" />, color: "text-indigo-600", bg: "bg-indigo-100" },
  "AI Review Re-generated": { icon: <Zap className="h-4 w-4" />, color: "text-indigo-600", bg: "bg-indigo-100" },
  "Reviewer Assigned": { icon: <UserCheck className="h-4 w-4" />, color: "text-blue-600", bg: "bg-blue-100" },
  "Status Changed": { icon: <ChevronRight className="h-4 w-4" />, color: "text-slate-500", bg: "bg-slate-100" },
  "Application Approved": { icon: <CheckCircle className="h-4 w-4" />, color: "text-emerald-600", bg: "bg-emerald-100" },
  "Application Rejected": { icon: <XCircle className="h-4 w-4" />, color: "text-red-600", bg: "bg-red-100" },
  "Additional Info Requested": { icon: <Info className="h-4 w-4" />, color: "text-amber-600", bg: "bg-amber-100" },
  "Missing Document Flagged": { icon: <FileWarning className="h-4 w-4" />, color: "text-red-500", bg: "bg-red-50" },
  "High Risk Alert Triggered": { icon: <AlertTriangle className="h-4 w-4" />, color: "text-red-700", bg: "bg-red-100" },
  "Reviewer Notes Added": { icon: <FileText className="h-4 w-4" />, color: "text-slate-500", bg: "bg-slate-100" },
};

const ACTOR_COLORS: Record<string, string> = {
  "System": "bg-slate-100 text-slate-600",
  "AI Engine": "bg-indigo-100 text-indigo-700",
  "Sarah Chen": "bg-blue-100 text-blue-700",
  "Marcus Williams": "bg-violet-100 text-violet-700",
  "Dr. Priya Nair": "bg-emerald-100 text-emerald-700",
  "James Okafor": "bg-amber-100 text-amber-700",
  "Elena Vasquez": "bg-pink-100 text-pink-700",
  "Admin Console": "bg-slate-100 text-slate-600",
};

function actorColor(actor: string): string {
  return ACTOR_COLORS[actor] ?? "bg-slate-100 text-slate-600";
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/audit-logs?limit=100");
      const data = await res.json();
      setLogs(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLogs(); }, []);

  const actionCounts = logs.reduce<Record<string, number>>((acc, log) => {
    acc[log.action] = (acc[log.action] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="animate-fade-in">
      <Header
        title="Audit Logs"
        description="Complete system event timeline and activity trail"
        action={
          <Button variant="outline" size="sm" onClick={fetchLogs} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      <div className="p-6 space-y-6">
        {/* Summary cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Events", value: logs.length, color: "text-slate-900" },
            { label: "AI Reviews", value: (actionCounts["AI Review Generated"] ?? 0) + (actionCounts["AI Review Re-generated"] ?? 0), color: "text-indigo-600" },
            { label: "Status Changes", value: actionCounts["Status Changed"] ?? 0, color: "text-blue-600" },
            { label: "High Risk Alerts", value: actionCounts["High Risk Alert Triggered"] ?? 0, color: "text-red-600" },
          ].map(({ label, value, color }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className={`text-2xl font-bold ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-0.5">{label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Timeline */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Event Timeline</CardTitle>
            <CardDescription>Most recent system events first</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
              </div>
            ) : (
              <div className="space-y-0">
                {logs.map((log, idx) => {
                  const config = ACTION_CONFIG[log.action] ?? { icon: <ChevronRight className="h-4 w-4" />, color: "text-slate-500", bg: "bg-slate-100" };
                  return (
                    <div key={log.id} className="flex gap-4 group">
                      {/* Timeline line */}
                      <div className="flex flex-col items-center">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${config.bg} ${config.color} mt-4`}>
                          {config.icon}
                        </div>
                        {idx < logs.length - 1 && (
                          <div className="w-px flex-1 bg-slate-100 my-1" />
                        )}
                      </div>

                      {/* Event content */}
                      <div className="flex-1 py-4 border-b border-slate-50 group-last:border-0">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-medium text-slate-900">{log.action}</span>
                              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${actorColor(log.actor)}`}>
                                {log.actor}
                              </span>
                            </div>
                            {log.details && (
                              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{log.details}</p>
                            )}
                            {log.application && (
                              <div className="flex items-center gap-1.5 mt-1.5">
                                <FileText className="h-3 w-3 text-slate-300" />
                                {log.applicationId ? (
                                  <Link href={`/applications/${log.applicationId}`} className="text-xs text-indigo-600 hover:text-indigo-700 hover:underline truncate">
                                    {log.application.applicantName} — {log.application.organizationName}
                                  </Link>
                                ) : (
                                  <span className="text-xs text-slate-400">{log.application.applicantName}</span>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400 whitespace-nowrap shrink-0">
                            {formatDateTime(log.createdAt)}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
