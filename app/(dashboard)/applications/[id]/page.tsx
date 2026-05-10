"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { StatusBadge, RiskBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  ArrowLeft, Zap, UserCheck, CheckCircle, XCircle, Info, FileWarning,
  FileText, Clock, Building2, User, DollarSign, Shield, ChevronRight,
  AlertTriangle, Loader2
} from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface AuditLog {
  id: string;
  actor: string;
  action: string;
  details: string | null;
  createdAt: string;
}

interface Application {
  id: string;
  applicantName: string;
  organizationName: string;
  grantProgram: string;
  requestedAmount: number;
  status: string;
  riskLevel: string;
  eligibilityScore: number | null;
  riskScore: number | null;
  aiSummary: string | null;
  rawApplicationText: string | null;
  extractedFields: string | null;
  missingDocuments: string | null;
  reviewerNotes: string | null;
  assignedReviewer: { id: string; name: string; email: string; role: string } | null;
  auditLogs: AuditLog[];
  createdAt: string;
  updatedAt: string;
}

interface Reviewer {
  id: string;
  name: string;
  role: string;
  active: boolean;
}

const ACTION_ICONS: Record<string, React.ReactNode> = {
  "Application Submitted": <FileText className="h-3.5 w-3.5 text-slate-500" />,
  "AI Review Generated": <Zap className="h-3.5 w-3.5 text-indigo-500" />,
  "AI Review Re-generated": <Zap className="h-3.5 w-3.5 text-indigo-500" />,
  "Reviewer Assigned": <UserCheck className="h-3.5 w-3.5 text-blue-500" />,
  "Status Changed": <ChevronRight className="h-3.5 w-3.5 text-slate-400" />,
  "Application Approved": <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />,
  "Application Rejected": <XCircle className="h-3.5 w-3.5 text-red-500" />,
  "Additional Info Requested": <Info className="h-3.5 w-3.5 text-amber-500" />,
  "Missing Document Flagged": <FileWarning className="h-3.5 w-3.5 text-red-400" />,
  "High Risk Alert Triggered": <AlertTriangle className="h-3.5 w-3.5 text-red-500" />,
  "Reviewer Notes Added": <FileText className="h-3.5 w-3.5 text-slate-400" />,
};

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [app, setApp] = useState<Application | null>(null);
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch(`/api/applications/${id}`).then((r) => r.json()),
      fetch("/api/reviewers").then((r) => r.json()),
    ]).then(([appData, reviewerData]) => {
      setApp(appData);
      setReviewers(reviewerData.filter((r: Reviewer) => r.active));
      setLoading(false);
    });
  }, [id]);

  const runReview = async () => {
    setActionLoading("review");
    try {
      const res = await fetch(`/api/applications/${id}/run-review`, { method: "POST" });
      const data = await res.json();
      setApp(data.application);
      toast.success("AI review completed", { description: `Eligibility: ${data.application.eligibilityScore} | Risk: ${data.application.riskScore}` });
      const updatedApp = await fetch(`/api/applications/${id}`).then(r => r.json());
      setApp(updatedApp);
    } catch {
      toast.error("AI review failed");
    } finally {
      setActionLoading(null);
    }
  };

  const updateStatus = async (status: string) => {
    setActionLoading(status);
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, actor: "Admin Console" }),
      });
      const updated = await res.json();
      setApp((prev) => prev ? { ...prev, status: updated.status } : prev);
      const refreshed = await fetch(`/api/applications/${id}`).then(r => r.json());
      setApp(refreshed);
      toast.success(`Status updated to "${status}"`);
    } catch {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const assignReviewer = async (reviewerId: string) => {
    setActionLoading("assign");
    try {
      const res = await fetch(`/api/applications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignedReviewerId: reviewerId, actor: "Admin Console" }),
      });
      const updated = await res.json();
      setApp((prev) => prev ? { ...prev, assignedReviewer: updated.assignedReviewer } : prev);
      const refreshed = await fetch(`/api/applications/${id}`).then(r => r.json());
      setApp(refreshed);
      toast.success(`Assigned to ${updated.assignedReviewer?.name ?? "reviewer"}`);
    } catch {
      toast.error("Failed to assign reviewer");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!app) {
    return (
      <div className="p-6">
        <div className="text-slate-500">Application not found.</div>
        <Link href="/applications"><Button variant="outline" className="mt-4">Back to Applications</Button></Link>
      </div>
    );
  }

  const extractedFields = app.extractedFields ? JSON.parse(app.extractedFields) as Record<string, string> : {};
  const missingDocs = app.missingDocuments ? JSON.parse(app.missingDocuments) as string[] : [];

  return (
    <div className="animate-fade-in">
      <Header
        title={app.applicantName}
        description={`${app.organizationName} · ${app.grantProgram}`}
        action={
          <Link href="/applications">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ArrowLeft className="h-3.5 w-3.5" />
              Back
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* Action Bar */}
        <div className="flex flex-wrap gap-2 items-center justify-between bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="default"
              onClick={runReview}
              disabled={actionLoading === "review"}
              className="gap-2"
            >
              {actionLoading === "review" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
              Run AI Review
            </Button>
            <Button
              size="sm"
              variant="success"
              onClick={() => updateStatus("Approved")}
              disabled={!!actionLoading || app.status === "Approved"}
              className="gap-2"
            >
              {actionLoading === "Approved" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle className="h-3.5 w-3.5" />}
              Approve
            </Button>
            <Button
              size="sm"
              variant="warning"
              onClick={() => updateStatus("Needs Info")}
              disabled={!!actionLoading || app.status === "Needs Info"}
              className="gap-2"
            >
              {actionLoading === "Needs Info" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Info className="h-3.5 w-3.5" />}
              Request Info
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => updateStatus("Rejected")}
              disabled={!!actionLoading || app.status === "Rejected"}
              className="gap-2"
            >
              {actionLoading === "Rejected" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
              Reject
            </Button>
          </div>
          <div className="flex gap-2 items-center">
            <Select onValueChange={assignReviewer} defaultValue={app.assignedReviewer?.id ?? ""}>
              <SelectTrigger className="w-44 h-8 text-xs">
                <UserCheck className="h-3.5 w-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Assign Reviewer" />
              </SelectTrigger>
              <SelectContent>
                {reviewers.map((r) => (
                  <SelectItem key={r.id} value={r.id}>
                    {r.name} <span className="text-slate-400">({r.role})</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Applicant Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <User className="h-4 w-4 text-slate-400" />
                  Applicant Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Applicant Name</div>
                    <div className="text-sm font-medium text-slate-900">{app.applicantName}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Organization</div>
                    <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-slate-400" />
                      {app.organizationName}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Grant Program</div>
                    <div className="text-sm font-medium text-slate-900">{app.grantProgram}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Requested Amount</div>
                    <div className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                      {formatCurrency(app.requestedAmount)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Submitted</div>
                    <div className="text-sm text-slate-600 flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-slate-400" />
                      {formatDateTime(app.createdAt)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-1">Assigned Reviewer</div>
                    {app.assignedReviewer ? (
                      <div className="text-sm text-slate-900 flex items-center gap-1.5">
                        <UserCheck className="h-3.5 w-3.5 text-blue-500" />
                        {app.assignedReviewer.name}
                        <span className="text-slate-400 text-xs">({app.assignedReviewer.role})</span>
                      </div>
                    ) : (
                      <div className="text-sm text-slate-400 italic">Not assigned</div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Summary */}
            {app.aiSummary && (
              <Card className="border-indigo-100 bg-indigo-50/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    AI Executive Summary
                    <Badge variant="default" className="text-[10px] ml-auto">AI Generated</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed">{app.aiSummary}</p>
                </CardContent>
              </Card>
            )}

            {/* Extracted Fields */}
            {Object.keys(extractedFields).length > 0 && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Extracted Application Fields
                    <Badge variant="secondary" className="text-[10px] ml-auto">Auto-parsed</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {Object.entries(extractedFields).map(([key, value]) => (
                      <div key={key} className="flex flex-col gap-0.5">
                        <span className="text-[10px] uppercase tracking-wide font-semibold text-slate-400">{key}</span>
                        <span className="text-sm text-slate-800">{value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Missing Documents */}
            {missingDocs.length > 0 && (
              <Card className="border-amber-100">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileWarning className="h-4 w-4 text-amber-500" />
                    Missing Documents
                    <Badge variant="warning" className="text-[10px] ml-auto">{missingDocs.length} missing</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {missingDocs.map((doc) => (
                      <li key={doc} className="flex items-start gap-2 text-sm text-slate-700">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                        {doc}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Reviewer Notes */}
            {app.reviewerNotes && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Reviewer Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-700 leading-relaxed italic">&ldquo;{app.reviewerNotes}&rdquo;</p>
                  {app.assignedReviewer && (
                    <p className="text-xs text-slate-400 mt-2">— {app.assignedReviewer.name}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Raw Text */}
            {app.rawApplicationText && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4 text-slate-400" />
                    Original Application Text
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-600 font-mono leading-relaxed whitespace-pre-wrap border border-slate-100 max-h-64 overflow-y-auto">
                    {app.rawApplicationText}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status & Risk */}
            <Card>
              <CardContent className="p-5 space-y-4">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Status</div>
                  <StatusBadge status={app.status} className="text-sm px-3 py-1" />
                </div>
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wide font-medium mb-2">Risk Level</div>
                  <RiskBadge risk={app.riskLevel} className="text-sm px-3 py-1" />
                </div>
              </CardContent>
            </Card>

            {/* Scores */}
            {(app.eligibilityScore !== null || app.riskScore !== null) && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-slate-400" />
                    AI Scores
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {app.eligibilityScore !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Eligibility Score</span>
                        <span className="text-lg font-bold text-slate-900">{app.eligibilityScore}<span className="text-sm font-normal text-slate-400">/100</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${app.eligibilityScore >= 75 ? "bg-emerald-500" : app.eligibilityScore >= 50 ? "bg-amber-500" : "bg-red-500"}`}
                          style={{ width: `${app.eligibilityScore}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {app.eligibilityScore >= 75 ? "Strong eligibility" : app.eligibilityScore >= 50 ? "Moderate eligibility" : "Weak eligibility"}
                      </div>
                    </div>
                  )}
                  {app.riskScore !== null && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-500 font-medium">Risk Score</span>
                        <span className="text-lg font-bold text-slate-900">{app.riskScore}<span className="text-sm font-normal text-slate-400">/100</span></span>
                      </div>
                      <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${app.riskScore >= 65 ? "bg-red-500" : app.riskScore >= 40 ? "bg-amber-500" : "bg-emerald-500"}`}
                          style={{ width: `${app.riskScore}%` }}
                        />
                      </div>
                      <div className="text-xs text-slate-400 mt-1">
                        {app.riskScore >= 65 ? "High risk — senior review required" : app.riskScore >= 40 ? "Moderate risk" : "Low risk"}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Audit Timeline */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-400" />
                  Activity Timeline
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {app.auditLogs.length === 0 ? (
                    <p className="text-xs text-slate-400">No activity yet</p>
                  ) : (
                    [...app.auditLogs].reverse().map((log, idx) => (
                      <div key={log.id} className="flex gap-3">
                        <div className="flex flex-col items-center">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            {ACTION_ICONS[log.action] ?? <ChevronRight className="h-3 w-3 text-slate-400" />}
                          </div>
                          {idx < app.auditLogs.length - 1 && (
                            <div className="w-px flex-1 bg-slate-100 mt-1" />
                          )}
                        </div>
                        <div className="pb-3 min-w-0">
                          <div className="text-xs font-medium text-slate-800">{log.action}</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">{log.actor}</div>
                          {log.details && (
                            <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">{log.details}</div>
                          )}
                          <div className="text-[10px] text-slate-300 mt-1">{formatDateTime(log.createdAt)}</div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
