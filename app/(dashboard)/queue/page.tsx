"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge, RiskBadge } from "@/components/status-badge";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { ArrowRight, Loader2, RefreshCw, UserCheck } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface Application {
  id: string;
  applicantName: string;
  organizationName: string;
  grantProgram: string;
  requestedAmount: number;
  status: string;
  riskLevel: string;
  eligibilityScore: number | null;
  assignedReviewer: { id: string; name: string } | null;
  createdAt: string;
}

interface Reviewer {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

const COLUMNS: { status: string; color: string; bg: string }[] = [
  { status: "New", color: "text-slate-600", bg: "bg-slate-50 border-slate-200" },
  { status: "In Review", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  { status: "Needs Info", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  { status: "Approved", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-200" },
  { status: "Rejected", color: "text-red-700", bg: "bg-red-50 border-red-200" },
];

export default function QueuePage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [apps, revs] = await Promise.all([
        fetch("/api/applications").then((r) => r.json()),
        fetch("/api/reviewers").then((r) => r.json()),
      ]);
      setApplications(apps);
      setReviewers(revs.filter((r: Reviewer) => r.active));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const updateStatus = async (appId: string, newStatus: string) => {
    setUpdating(appId);
    try {
      await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, actor: "Admin Console" }),
      });
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, status: newStatus } : a)
      );
      toast.success(`Status updated to "${newStatus}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setUpdating(null);
    }
  };

  const assignReviewer = async (appId: string, reviewerId: string) => {
    setUpdating(appId);
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedReviewerId: reviewerId, actor: "Admin Console" }),
      });
      const updated = await res.json();
      setApplications((prev) =>
        prev.map((a) => a.id === appId ? { ...a, assignedReviewer: updated.assignedReviewer } : a)
      );
      toast.success(`Assigned to ${updated.assignedReviewer?.name}`);
    } catch {
      toast.error("Failed to assign reviewer");
    } finally {
      setUpdating(null);
    }
  };

  const byStatus = (status: string) => applications.filter((a) => a.status === status);

  return (
    <div className="animate-fade-in">
      <Header
        title="Reviewer Queue"
        description="Manage and triage grant applications across review stages"
        action={
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
        }
      />

      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {COLUMNS.map(({ status, color, bg }) => {
              const items = byStatus(status);
              return (
                <div key={status} className="flex-1 min-w-[260px] max-w-[320px]">
                  <div className={`rounded-xl border ${bg} p-4 min-h-[500px]`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-sm font-semibold ${color}`}>{status}</h3>
                      <Badge variant="outline" className="text-xs">{items.length}</Badge>
                    </div>

                    <div className="space-y-3">
                      {items.length === 0 ? (
                        <div className="text-center py-8">
                          <div className="text-xs text-slate-400">No applications</div>
                        </div>
                      ) : (
                        items.map((app) => (
                          <div
                            key={app.id}
                            className="bg-white rounded-lg border border-slate-200 p-3.5 shadow-sm hover:shadow-md transition-shadow space-y-3"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-900 truncate">{app.applicantName}</div>
                              <div className="text-xs text-slate-400 truncate mt-0.5">{app.organizationName}</div>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              <StatusBadge status={app.status} />
                              <RiskBadge risk={app.riskLevel} />
                            </div>

                            <div className="text-xs text-slate-500">
                              <span className="font-medium">{formatCurrency(app.requestedAmount)}</span>
                              <span className="text-slate-300 mx-1">·</span>
                              <span className="truncate">{app.grantProgram.split(" ").slice(0, 3).join(" ")}…</span>
                            </div>

                            {app.eligibilityScore !== null && (
                              <div className="flex items-center gap-2">
                                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-indigo-500 rounded-full"
                                    style={{ width: `${app.eligibilityScore}%` }}
                                  />
                                </div>
                                <span className="text-[10px] text-slate-500 shrink-0">Elig: {app.eligibilityScore}</span>
                              </div>
                            )}

                            <div className="space-y-2">
                              {/* Reviewer assignment */}
                              <Select
                                value={app.assignedReviewer?.id ?? ""}
                                onValueChange={(v) => assignReviewer(app.id, v)}
                                disabled={updating === app.id}
                              >
                                <SelectTrigger className="h-7 text-xs w-full">
                                  <UserCheck className="h-3 w-3 mr-1 text-slate-400 shrink-0" />
                                  <SelectValue placeholder="Assign reviewer" />
                                </SelectTrigger>
                                <SelectContent>
                                  {reviewers.map((r) => (
                                    <SelectItem key={r.id} value={r.id} className="text-xs">
                                      {r.name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>

                              {/* Status change */}
                              <Select
                                value={app.status}
                                onValueChange={(v) => updateStatus(app.id, v)}
                                disabled={updating === app.id}
                              >
                                <SelectTrigger className="h-7 text-xs w-full">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {["New", "In Review", "Needs Info", "Approved", "Rejected"].map((s) => (
                                    <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>

                            <Link href={`/applications/${app.id}`}>
                              <Button variant="ghost" size="sm" className="w-full h-7 text-xs text-indigo-600 hover:text-indigo-700">
                                View Details <ArrowRight className="h-3 w-3 ml-1" />
                              </Button>
                            </Link>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
