"use client";

import { useEffect, useState, useCallback } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge, RiskBadge } from "@/components/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Search, Upload, ArrowRight, SlidersHorizontal, ChevronUp, ChevronDown } from "lucide-react";
import Link from "next/link";

interface Application {
  id: string;
  applicantName: string;
  organizationName: string;
  grantProgram: string;
  requestedAmount: number;
  status: string;
  riskLevel: string;
  eligibilityScore: number | null;
  assignedReviewer: { name: string } | null;
  createdAt: string;
}

const GRANT_PROGRAMS = [
  "Community Health Innovation Fund",
  "Climate Resilience Microgrant",
  "STEM Access Fellowship",
  "Small Business Recovery Grant",
  "Rural Connectivity Initiative",
];

type SortKey = "applicantName" | "requestedAmount" | "createdAt" | "eligibilityScore";

function SortIcon({
  column,
  sortKey,
  sortDirection,
}: {
  column: SortKey;
  sortKey: SortKey;
  sortDirection: "asc" | "desc";
}) {
  if (sortKey !== column) {
    return <ChevronDown className="h-3 w-3 inline ml-1 opacity-30" />;
  }

  return sortDirection === "asc" ? (
    <ChevronUp className="h-3 w-3 inline ml-1" />
  ) : (
    <ChevronDown className="h-3 w-3 inline ml-1" />
  );
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [riskFilter, setRiskFilter] = useState("all");
  const [programFilter, setProgramFilter] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const fetchApplications = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (statusFilter !== "all") params.set("status", statusFilter);
      if (riskFilter !== "all") params.set("riskLevel", riskFilter);
      if (programFilter !== "all") params.set("grantProgram", programFilter);
      const res = await fetch(`/api/applications?${params}`);
      const data = await res.json();
      setApplications(data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, riskFilter, programFilter]);

  useEffect(() => {
    const timer = setTimeout(fetchApplications, 300);
    return () => clearTimeout(timer);
  }, [fetchApplications]);

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const sorted = [...applications].sort((a, b) => {
    let valA: string | number = a[sortKey] ?? "";
    let valB: string | number = b[sortKey] ?? "";
    if (sortKey === "requestedAmount") { valA = Number(valA); valB = Number(valB); }
    if (sortKey === "eligibilityScore") { valA = Number(valA ?? 0); valB = Number(valB ?? 0); }
    if (valA < valB) return sortDir === "asc" ? -1 : 1;
    if (valA > valB) return sortDir === "asc" ? 1 : -1;
    return 0;
  });

  return (
    <div className="animate-fade-in">
      <Header
        title="Applications"
        description={`${applications.length} grant application${applications.length !== 1 ? "s" : ""}`}
        action={
          <Link href="/upload">
            <Button size="sm" className="gap-2">
              <Upload className="h-3.5 w-3.5" />
              New Intake
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-4">
        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-wrap gap-3 items-center">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                <Input
                  placeholder="Search applicant, org, or program..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-9"
                />
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                <span>Filters:</span>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-36 h-9">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="In Review">In Review</SelectItem>
                  <SelectItem value="Needs Info">Needs Info</SelectItem>
                  <SelectItem value="Approved">Approved</SelectItem>
                  <SelectItem value="Rejected">Rejected</SelectItem>
                </SelectContent>
              </Select>
              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="w-32 h-9">
                  <SelectValue placeholder="Risk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All risks</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                </SelectContent>
              </Select>
              <Select value={programFilter} onValueChange={setProgramFilter}>
                <SelectTrigger className="w-48 h-9">
                  <SelectValue placeholder="Grant Program" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All programs</SelectItem>
                  {GRANT_PROGRAMS.map((p) => (
                    <SelectItem key={p} value={p}>{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {(statusFilter !== "all" || riskFilter !== "all" || programFilter !== "all" || search) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 text-slate-500"
                  onClick={() => { setSearch(""); setStatusFilter("all"); setRiskFilter("all"); setProgramFilter("all"); }}
                >
                  Clear
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-sm text-slate-400">Loading applications...</div>
              </div>
            ) : sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-48 gap-3">
                <div className="text-slate-400 text-sm">No applications found</div>
                <Link href="/upload">
                  <Button size="sm" variant="outline">Submit New Application</Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer select-none" onClick={() => handleSort("applicantName")}>
                        Applicant <SortIcon column="applicantName" sortKey={sortKey} sortDirection={sortDir} />
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">
                        Program
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell cursor-pointer select-none" onClick={() => handleSort("requestedAmount")}>
                        Amount <SortIcon column="requestedAmount" sortKey={sortKey} sortDirection={sortDir} />
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        Status
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">
                        Risk
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell cursor-pointer select-none" onClick={() => handleSort("eligibilityScore")}>
                        Eligibility <SortIcon column="eligibilityScore" sortKey={sortKey} sortDirection={sortDir} />
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">
                        Reviewer
                      </th>
                      <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell cursor-pointer select-none" onClick={() => handleSort("createdAt")}>
                        Submitted <SortIcon column="createdAt" sortKey={sortKey} sortDirection={sortDir} />
                      </th>
                      <th className="px-6 py-3"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {sorted.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/80 transition-colors group">
                        <td className="px-6 py-4">
                          <div>
                            <div className="font-medium text-slate-900">{app.applicantName}</div>
                            <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[200px]">{app.organizationName}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 hidden md:table-cell">
                          <span className="text-slate-600 text-xs max-w-[180px] truncate block">{app.grantProgram}</span>
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          <span className="font-semibold text-slate-900">{formatCurrency(app.requestedAmount)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={app.status} />
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <RiskBadge risk={app.riskLevel} />
                        </td>
                        <td className="px-6 py-4 hidden lg:table-cell">
                          {app.eligibilityScore != null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full bg-indigo-500"
                                  style={{ width: `${app.eligibilityScore}%` }}
                                />
                              </div>
                              <span className="text-xs font-medium text-slate-600">{app.eligibilityScore}</span>
                            </div>
                          ) : (
                            <span className="text-slate-300 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell">
                          {app.assignedReviewer ? (
                            <span className="text-slate-600 text-xs">{app.assignedReviewer.name}</span>
                          ) : (
                            <span className="text-slate-400 text-xs italic">Unassigned</span>
                          )}
                        </td>
                        <td className="px-6 py-4 hidden xl:table-cell">
                          <span className="text-slate-500 text-xs">{formatDate(app.createdAt)}</span>
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/applications/${app.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs text-indigo-600"
                            >
                              View <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
