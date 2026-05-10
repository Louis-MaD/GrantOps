import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const variantMap: Record<string, "success" | "destructive" | "info" | "warning" | "secondary"> = {
    Approved: "success",
    Rejected: "destructive",
    "In Review": "info",
    "Needs Info": "warning",
    New: "secondary",
  };

  const variant = variantMap[status] ?? "secondary";
  return (
    <Badge variant={variant} className={className}>
      {status}
    </Badge>
  );
}

interface RiskBadgeProps {
  risk: string;
  className?: string;
}

export function RiskBadge({ risk, className }: RiskBadgeProps) {
  const variantMap: Record<string, "destructive" | "warning" | "success"> = {
    High: "destructive",
    Medium: "warning",
    Low: "success",
  };

  const variant = variantMap[risk] ?? "secondary";
  return (
    <Badge variant={variant} className={className}>
      {risk} Risk
    </Badge>
  );
}
