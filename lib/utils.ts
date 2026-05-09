import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date));
}

export function getRiskColor(risk: string): string {
  switch (risk) {
    case "High":
      return "destructive";
    case "Medium":
      return "warning";
    case "Low":
      return "success";
    default:
      return "secondary";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "Approved":
      return "success";
    case "Rejected":
      return "destructive";
    case "In Review":
      return "info";
    case "Needs Info":
      return "warning";
    case "New":
      return "secondary";
    default:
      return "secondary";
  }
}
