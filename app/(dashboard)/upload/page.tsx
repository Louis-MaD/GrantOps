"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Upload, Zap, FileText, AlertCircle, CheckCircle2, Loader2, Info
} from "lucide-react";

const GRANT_PROGRAMS = [
  "Community Health Innovation Fund",
  "Climate Resilience Microgrant",
  "STEM Access Fellowship",
  "Small Business Recovery Grant",
  "Rural Connectivity Initiative",
];

const EXAMPLE_TEXT = `Our organization, Riverside Youth Initiative, has served at-risk youth in the greater Sacramento area for 12 years. We operate after-school programs across 8 schools serving 1,200 students annually, focusing on STEM education, mental health support, and career readiness.

The requested funding of $95,000 will allow us to expand our digital literacy curriculum to 4 additional Title I schools, hire 2 part-time instructors, and purchase 60 laptop computers for student use. We anticipate reaching 340 additional students in year one.

We hold 501(c)(3) tax-exempt status and have audited financial statements available for FY2022-2024. Our board of directors includes 9 members with backgrounds in education, technology, and nonprofit management. A full project budget breakdown is attached.

Letters of support from Sacramento City Unified School District and two community foundations are enclosed. This project directly addresses the digital divide in underserved communities and aligns with the program's goals of expanding STEM access.`;

export default function UploadPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    applicantName: "",
    organizationName: "",
    grantProgram: "",
    requestedAmount: "",
    rawApplicationText: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.applicantName.trim()) errs.applicantName = "Applicant name is required";
    if (!form.organizationName.trim()) errs.organizationName = "Organization name is required";
    if (!form.grantProgram) errs.grantProgram = "Please select a grant program";
    if (!form.requestedAmount || isNaN(Number(form.requestedAmount)) || Number(form.requestedAmount) <= 0) {
      errs.requestedAmount = "Enter a valid requested amount";
    }
    return errs;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    setErrors({});
    setSubmitting(true);

    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          requestedAmount: Number(form.requestedAmount),
        }),
      });

      if (!res.ok) throw new Error("Submission failed");
      const app = await res.json();
      toast.success("Application submitted", { description: "AI review generated automatically." });
      router.push(`/applications/${app.id}`);
    } catch {
      toast.error("Submission failed", { description: "Please try again." });
    } finally {
      setSubmitting(false);
    }
  };

  const loadExample = () => {
    setForm({
      applicantName: "Maria Nguyen",
      organizationName: "Riverside Youth Initiative",
      grantProgram: "STEM Access Fellowship",
      requestedAmount: "95000",
      rawApplicationText: EXAMPLE_TEXT,
    });
    toast.info("Example application loaded");
  };

  const wordCount = form.rawApplicationText.trim().split(/\s+/).filter(Boolean).length;
  const qualityLevel = wordCount < 50 ? "poor" : wordCount < 150 ? "fair" : wordCount < 300 ? "good" : "excellent";
  const qualityColor = { poor: "text-red-500", fair: "text-amber-500", good: "text-blue-500", excellent: "text-emerald-500" }[qualityLevel];

  return (
    <div className="animate-fade-in">
      <Header
        title="New Application Intake"
        description="Submit a grant application for AI-powered parsing and review"
      />

      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-sm">Applicant Details</CardTitle>
                    <CardDescription>Basic information about the applicant and application</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label htmlFor="applicantName">Applicant Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="applicantName"
                          placeholder="Dr. Jane Smith"
                          value={form.applicantName}
                          onChange={(e) => setForm((f) => ({ ...f, applicantName: e.target.value }))}
                          className={errors.applicantName ? "border-red-400" : ""}
                        />
                        {errors.applicantName && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{errors.applicantName}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="organizationName">Organization Name <span className="text-red-500">*</span></Label>
                        <Input
                          id="organizationName"
                          placeholder="Community Health Nonprofit"
                          value={form.organizationName}
                          onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
                          className={errors.organizationName ? "border-red-400" : ""}
                        />
                        {errors.organizationName && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{errors.organizationName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label>Grant Program <span className="text-red-500">*</span></Label>
                        <Select value={form.grantProgram} onValueChange={(v) => setForm((f) => ({ ...f, grantProgram: v }))}>
                          <SelectTrigger className={errors.grantProgram ? "border-red-400" : ""}>
                            <SelectValue placeholder="Select a program" />
                          </SelectTrigger>
                          <SelectContent>
                            {GRANT_PROGRAMS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.grantProgram && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{errors.grantProgram}
                          </p>
                        )}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="requestedAmount">Requested Amount (USD) <span className="text-red-500">*</span></Label>
                        <Input
                          id="requestedAmount"
                          type="number"
                          placeholder="50000"
                          min="1"
                          value={form.requestedAmount}
                          onChange={(e) => setForm((f) => ({ ...f, requestedAmount: e.target.value }))}
                          className={errors.requestedAmount ? "border-red-400" : ""}
                        />
                        {errors.requestedAmount && (
                          <p className="text-xs text-red-500 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />{errors.requestedAmount}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm">Application Narrative</CardTitle>
                        <CardDescription>Paste the full grant application text for AI parsing</CardDescription>
                      </div>
                      <Button type="button" variant="outline" size="sm" onClick={loadExample} className="text-xs gap-1.5">
                        <FileText className="h-3.5 w-3.5" />
                        Load Example
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Textarea
                      placeholder="Paste the full grant application text here. Include project description, organization background, budget overview, and any supporting narrative. The AI will extract structured fields, assess eligibility, and flag missing documents automatically."
                      value={form.rawApplicationText}
                      onChange={(e) => setForm((f) => ({ ...f, rawApplicationText: e.target.value }))}
                      className="min-h-[240px] font-mono text-xs leading-relaxed"
                    />
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-400">{wordCount} words</span>
                      {form.rawApplicationText && (
                        <span className={`font-medium ${qualityColor} flex items-center gap-1`}>
                          {qualityLevel === "excellent" && <CheckCircle2 className="h-3 w-3" />}
                          Narrative quality: {qualityLevel}
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="gap-2 flex-1 sm:flex-none">
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    {submitting ? "Processing..." : "Submit Application"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setForm({ applicantName: "", organizationName: "", grantProgram: "", requestedAmount: "", rawApplicationText: "" })}>
                    Clear Form
                  </Button>
                </div>
              </form>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-indigo-100 bg-gradient-to-br from-indigo-50 to-white">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Zap className="h-4 w-4 text-indigo-600" />
                    What happens next
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { icon: Upload, text: "Application is ingested and stored" },
                    { icon: Zap, text: "AI parses narrative and extracts structured fields" },
                    { icon: AlertCircle, text: "Missing documents are flagged automatically" },
                    { icon: CheckCircle2, text: "Eligibility and risk scores are computed" },
                    { icon: FileText, text: "Executive summary is generated for reviewers" },
                  ].map(({ text }, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 mt-0.5">
                        <span className="text-[10px] font-bold text-indigo-600">{i + 1}</span>
                      </div>
                      <span className="text-xs text-slate-600 leading-relaxed">{text}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Info className="h-4 w-4 text-slate-400" />
                    Tips for better AI results
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {[
                    "Include 200+ words for accurate eligibility scoring",
                    "Mention specific dollar amounts and timelines",
                    "Reference required documents (501c3, audits, etc.)",
                    "Include number of beneficiaries and staff",
                    "Describe geographic focus and project duration",
                  ].map((tip, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                      <span className="text-indigo-400 font-bold mt-0.5">·</span>
                      {tip}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">Programs accepting applications</Badge>
                  </div>
                  <div className="space-y-1.5">
                    {GRANT_PROGRAMS.map((p) => (
                      <div key={p} className="text-xs text-slate-600 flex items-center gap-1.5">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
                        {p}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
