import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge, RiskBadge } from "@/components/status-badge";
import { formatCurrency } from "@/lib/utils";
import {
  FileText,
  Clock,
  Users,
  AlertTriangle,
  TrendingUp,
  Upload,
  Zap,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Info,
} from "lucide-react";
import Link from "next/link";

async function getDashboardData() {
  const [applications, totalCount] = await Promise.all([
    prisma.application.findMany({
      include: { assignedReviewer: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.application.count(),
  ]);

  const statusCounts = await prisma.application.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  const pendingQueue = await prisma.application.count({
    where: { status: { in: ["New", "In Review"] } },
  });

  const highRisk = await prisma.application.count({
    where: { riskLevel: "High" },
  });

  return { applications, totalCount, statusCounts, pendingQueue, highRisk };
}

const statusOrder = ["New", "In Review", "Needs Info", "Approved", "Rejected"];
const statusColors: Record<string, string> = {
  New: "bg-slate-400",
  "In Review": "bg-blue-500",
  "Needs Info": "bg-amber-500",
  Approved: "bg-emerald-500",
  Rejected: "bg-red-500",
};

export default async function DashboardPage() {
  const { applications, totalCount, statusCounts, pendingQueue, highRisk } = await getDashboardData();

  const statusMap = Object.fromEntries(statusCounts.map((s) => [s.status, s._count.status]));
  const approved = statusMap["Approved"] ?? 0;
  const rejected = statusMap["Rejected"] ?? 0;

  return (
    <div className="animate-fade-in">
      <Header
        title="Dashboard"
        description="Overview of grant application pipeline"
        action={
          <Link href="/upload">
            <Button size="sm" className="gap-2">
              <Upload className="h-3.5 w-3.5" />
              New Intake
            </Button>
          </Link>
        }
      />

      <div className="p-6 space-y-6">
        {/* KPI Cards */}
        <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50">
                  <FileText className="h-4.5 w-4.5 text-indigo-600" />
                </div>
                <Badge variant="secondary" className="text-xs">All time</Badge>
              </div>
              <div className="text-2xl font-bold text-slate-900">{totalCount}</div>
              <div className="text-sm text-slate-500 mt-0.5">Applications processed</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>+12% this month</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
                  <Clock className="h-4.5 w-4.5 text-emerald-600" />
                </div>
                <Badge variant="success" className="text-xs">AI-powered</Badge>
              </div>
              <div className="text-2xl font-bold text-slate-900">4.2 hrs</div>
              <div className="text-sm text-slate-500 mt-0.5">Avg. review time saved</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>Per application</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-50">
                  <Users className="h-4.5 w-4.5 text-amber-600" />
                </div>
                <Badge variant="warning" className="text-xs">Action needed</Badge>
              </div>
              <div className="text-2xl font-bold text-slate-900">{pendingQueue}</div>
              <div className="text-sm text-slate-500 mt-0.5">Pending reviewer queue</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                <Info className="h-3 w-3" />
                <span>Awaiting assignment or review</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-red-50">
                  <AlertTriangle className="h-4.5 w-4.5 text-red-600" />
                </div>
                <Badge variant="destructive" className="text-xs">Flagged</Badge>
              </div>
              <div className="text-2xl font-bold text-slate-900">{highRisk}</div>
              <div className="text-sm text-slate-500 mt-0.5">High-risk applications</div>
              <div className="flex items-center gap-1 mt-2 text-xs text-red-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Requires senior review</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Status breakdown */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Pipeline Status</CardTitle>
              <CardDescription>Distribution across review stages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {statusOrder.map((status) => {
                const count = statusMap[status] ?? 0;
                const pct = totalCount > 0 ? Math.round((count / totalCount) * 100) : 0;
                return (
                  <div key={status}>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-slate-600">{status}</span>
                      <span className="font-medium text-slate-900">{count} <span className="text-slate-400 font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${statusColors[status] ?? "bg-slate-400"}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
              <div className="pt-2 border-t border-slate-100 flex justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3 text-emerald-500" />{approved} approved</span>
                <span className="flex items-center gap-1"><XCircle className="h-3 w-3 text-red-500" />{rejected} rejected</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Quick Actions</CardTitle>
              <CardDescription>Common operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link href="/upload">
                <Button variant="outline" className="w-full justify-start gap-3 h-10">
                  <Upload className="h-4 w-4 text-indigo-500" />
                  <span>Upload New Application</span>
                </Button>
              </Link>
              <Link href="/queue">
                <Button variant="outline" className="w-full justify-start gap-3 h-10">
                  <Users className="h-4 w-4 text-amber-500" />
                  <span>View Reviewer Queue</span>
                </Button>
              </Link>
              <Link href="/applications?riskLevel=High">
                <Button variant="outline" className="w-full justify-start gap-3 h-10">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Review High-Risk Items</span>
                </Button>
              </Link>
              <Link href="/audit-logs">
                <Button variant="outline" className="w-full justify-start gap-3 h-10">
                  <FileText className="h-4 w-4 text-slate-400" />
                  <span>View Audit Trail</span>
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* AI Stats */}
          <Card className="bg-gradient-to-br from-indigo-600 to-indigo-700 border-0 text-white">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-indigo-300" />
                <CardTitle className="text-sm text-white">AI Review Engine</CardTitle>
              </div>
              <CardDescription className="text-indigo-200">Automated processing stats</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-white/10 p-3">
                  <div className="text-2xl font-bold">{totalCount}</div>
                  <div className="text-xs text-indigo-200 mt-0.5">AI reviews run</div>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <div className="text-2xl font-bold">98%</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Parse accuracy</div>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <div className="text-2xl font-bold">2.1s</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Avg. review time</div>
                </div>
                <div className="rounded-lg bg-white/10 p-3">
                  <div className="text-2xl font-bold">87%</div>
                  <div className="text-xs text-indigo-200 mt-0.5">Reviewer agreement</div>
                </div>
              </div>
              <Link href="/upload">
                <Button size="sm" variant="secondary" className="w-full bg-white text-indigo-700 hover:bg-indigo-50 mt-1">
                  <Zap className="h-3.5 w-3.5 mr-1.5" />
                  Run AI Review
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Recent Applications Table */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-sm">Recent Applications</CardTitle>
                <CardDescription>Latest grant intake submissions</CardDescription>
              </div>
              <Link href="/applications">
                <Button variant="ghost" size="sm" className="gap-1 text-indigo-600 hover:text-indigo-700">
                  View all
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Applicant</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Program</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Amount</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Risk</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden xl:table-cell">Reviewer</th>
                    <th className="px-6 py-3"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {applications.map((app) => (
                    <tr key={app.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-3.5">
                        <div>
                          <div className="font-medium text-slate-900">{app.applicantName}</div>
                          <div className="text-xs text-slate-400 mt-0.5 truncate max-w-[180px]">{app.organizationName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5 hidden md:table-cell">
                        <span className="text-slate-600 text-xs max-w-[160px] truncate block">{app.grantProgram}</span>
                      </td>
                      <td className="px-6 py-3.5 hidden lg:table-cell">
                        <span className="font-medium text-slate-900">{formatCurrency(app.requestedAmount)}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-3.5 hidden sm:table-cell">
                        <RiskBadge risk={app.riskLevel} />
                      </td>
                      <td className="px-6 py-3.5 hidden xl:table-cell">
                        {app.assignedReviewer ? (
                          <span className="text-slate-600 text-xs">{app.assignedReviewer.name}</span>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Unassigned</span>
                        )}
                      </td>
                      <td className="px-6 py-3.5">
                        <Link href={`/applications/${app.id}`}>
                          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity h-7 px-2 text-xs text-indigo-600">
                            View <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
