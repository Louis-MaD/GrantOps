"use client";

import { Bell, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface HeaderProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function Header({ title, description, action }: HeaderProps) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-sm px-6 gap-4">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-900 truncate">{title}</h1>
        {description && (
          <p className="text-xs text-slate-500 truncate">{description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {action}
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <Input
            placeholder="Quick search..."
            className="pl-8 w-48 h-8 text-xs"
          />
        </div>
        <Button variant="ghost" size="icon" className="relative h-8 w-8">
          <Bell className="h-4 w-4 text-slate-500" />
          <span className="absolute -top-0.5 -right-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white">3</span>
        </Button>
      </div>
    </header>
  );
}
