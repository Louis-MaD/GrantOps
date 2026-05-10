"use client";

import { useState } from "react";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  Shield, Users, Zap, Bell, FileCheck, AlertTriangle, Lock, ChevronRight, Settings2
} from "lucide-react";

interface ToggleSetting {
  id: string;
  label: string;
  description: string;
  defaultValue: boolean;
}

const AUTOMATION_SETTINGS: ToggleSetting[] = [
  {
    id: "auto-assign",
    label: "Auto-assign reviewers",
    description: "Automatically assign new applications to the reviewer with the lowest queue load",
    defaultValue: true,
  },
  {
    id: "require-human-approval",
    label: "Require human approval before final decision",
    description: "AI recommendations must be confirmed by a human reviewer before status is finalized",
    defaultValue: true,
  },
  {
    id: "schema-validation",
    label: "Enable schema validation",
    description: "Validate submitted application structure against required field schema before processing",
    defaultValue: true,
  },
  {
    id: "high-risk-alerts",
    label: "Enable high-risk alerts",
    description: "Automatically notify the admin team when an application scores above risk threshold (70+)",
    defaultValue: true,
  },
];

const NOTIFICATION_SETTINGS: ToggleSetting[] = [
  {
    id: "email-new",
    label: "Email on new application",
    description: "Send notification when a new application is submitted",
    defaultValue: true,
  },
  {
    id: "email-ai-review",
    label: "Email when AI review completes",
    description: "Receive a summary email after each AI review generation",
    defaultValue: false,
  },
  {
    id: "email-approval",
    label: "Email on approval or rejection",
    description: "Notify assigned reviewer when final status decision is made",
    defaultValue: true,
  },
  {
    id: "slack-high-risk",
    label: "Slack alert for high-risk flags",
    description: "Post to #grant-ops Slack channel when high-risk threshold is triggered",
    defaultValue: false,
  },
];

const ROLES = [
  {
    role: "Admin",
    color: "bg-indigo-100 text-indigo-700",
    permissions: ["View all applications", "Approve/Reject applications", "Assign reviewers", "Access audit logs", "Manage settings", "Manage team members"],
    members: ["Admin Console"],
  },
  {
    role: "Senior Reviewer",
    color: "bg-blue-100 text-blue-700",
    permissions: ["View assigned applications", "Add reviewer notes", "Request more info", "Run AI review", "Recommend approval/rejection"],
    members: ["Sarah Chen", "Dr. Priya Nair"],
  },
  {
    role: "Reviewer",
    color: "bg-violet-100 text-violet-700",
    permissions: ["View assigned applications", "Add reviewer notes", "Request more info", "Run AI review"],
    members: ["Marcus Williams", "Elena Vasquez"],
  },
  {
    role: "Analyst",
    color: "bg-emerald-100 text-emerald-700",
    permissions: ["View all applications (read-only)", "View audit logs", "Export data"],
    members: ["James Okafor"],
  },
];

function SettingsToggle({ setting, value, onChange }: { setting: ToggleSetting; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-4">
      <div className="flex-1 min-w-0">
        <Label className="text-sm font-medium text-slate-900 cursor-pointer" htmlFor={setting.id}>
          {setting.label}
        </Label>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{setting.description}</p>
      </div>
      <Switch
        id={setting.id}
        checked={value}
        onCheckedChange={onChange}
        className="shrink-0 mt-0.5"
      />
    </div>
  );
}

export default function SettingsPage() {
  const [automation, setAutomation] = useState<Record<string, boolean>>(
    Object.fromEntries(AUTOMATION_SETTINGS.map((s) => [s.id, s.defaultValue]))
  );
  const [notifications, setNotifications] = useState<Record<string, boolean>>(
    Object.fromEntries(NOTIFICATION_SETTINGS.map((s) => [s.id, s.defaultValue]))
  );

  const handleSave = () => {
    toast.success("Settings saved", { description: "Configuration updated successfully." });
  };

  return (
    <div className="animate-fade-in">
      <Header
        title="Settings"
        description="Configure platform behavior, permissions, and notifications"
      />

      <div className="p-6 space-y-6 max-w-4xl">
        {/* Automation Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Zap className="h-4 w-4 text-indigo-600" />
              Automation & AI Settings
            </CardTitle>
            <CardDescription>Control how AI and automated workflows operate</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {AUTOMATION_SETTINGS.map((setting) => (
              <SettingsToggle
                key={setting.id}
                setting={setting}
                value={automation[setting.id]}
                onChange={(v) => setAutomation((prev) => ({ ...prev, [setting.id]: v }))}
              />
            ))}
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Bell className="h-4 w-4 text-amber-500" />
              Notification Preferences
            </CardTitle>
            <CardDescription>Configure email and integration alerts</CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-slate-100">
            {NOTIFICATION_SETTINGS.map((setting) => (
              <SettingsToggle
                key={setting.id}
                setting={setting}
                value={notifications[setting.id]}
                onChange={(v) => setNotifications((prev) => ({ ...prev, [setting.id]: v }))}
              />
            ))}
          </CardContent>
        </Card>

        {/* Risk Thresholds */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Risk Thresholds
            </CardTitle>
            <CardDescription>Configure AI risk scoring boundaries</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: "High Risk Threshold", value: 70, color: "bg-red-500", description: "Applications scoring above this trigger senior review escalation" },
                { label: "Medium Risk Threshold", value: 40, color: "bg-amber-500", description: "Applications between medium and high thresholds require additional checks" },
                { label: "Minimum Eligibility Score", value: 50, color: "bg-indigo-500", description: "Applications scoring below this are flagged for manual review" },
              ].map(({ label, value, color, description }) => (
                <div key={label} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium text-slate-700">{label}</Label>
                    <Badge variant="outline" className="font-mono text-xs">{value}</Badge>
                  </div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
                  </div>
                  <p className="text-xs text-slate-500">{description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Role-Based Permissions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Shield className="h-4 w-4 text-slate-500" />
              Role-Based Permissions
            </CardTitle>
            <CardDescription>Access control matrix for team members</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {ROLES.map(({ role, color, permissions, members }) => (
              <div key={role} className="border border-slate-100 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={`${color} border-0 font-medium`}>{role}</Badge>
                    <div className="flex -space-x-1">
                      {members.map((m) => (
                        <Avatar key={m} className="h-6 w-6 border-2 border-white">
                          <AvatarFallback className="text-[9px]">{m.split(" ").map(w => w[0]).join("")}</AvatarFallback>
                        </Avatar>
                      ))}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-7 text-xs text-slate-500">
                    <Settings2 className="h-3 w-3 mr-1" /> Edit
                  </Button>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {permissions.map((perm) => (
                    <span key={perm} className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 rounded-full px-2.5 py-1 border border-slate-100">
                      <FileCheck className="h-2.5 w-2.5 text-emerald-500" />
                      {perm}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Team Members */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Users className="h-4 w-4 text-slate-400" />
              Team Members
            </CardTitle>
            <CardDescription>Active staff with platform access</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="divide-y divide-slate-50">
              {[
                { name: "Sarah Chen", email: "sarah.chen@grantops.org", role: "Senior Reviewer", active: true },
                { name: "Marcus Williams", email: "marcus.williams@grantops.org", role: "Reviewer", active: true },
                { name: "Dr. Priya Nair", email: "priya.nair@grantops.org", role: "Senior Reviewer", active: true },
                { name: "James Okafor", email: "james.okafor@grantops.org", role: "Analyst", active: true },
                { name: "Elena Vasquez", email: "elena.vasquez@grantops.org", role: "Reviewer", active: false },
              ].map(({ name, email, role, active }) => (
                <div key={email} className="flex items-center justify-between py-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">{name.split(" ").map(w => w[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="text-sm font-medium text-slate-900">{name}</div>
                      <div className="text-xs text-slate-400">{email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">{role}</Badge>
                    <div className={`h-2 w-2 rounded-full ${active ? "bg-emerald-400" : "bg-slate-200"}`} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button onClick={handleSave} className="gap-2">
            Save Settings
          </Button>
          <Button variant="outline" onClick={() => toast.info("Settings reset to defaults")}>
            Reset to Defaults
          </Button>
        </div>
      </div>
    </div>
  );
}
