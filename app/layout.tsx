import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "GrantOps — AI-Powered Grant Intake Platform",
  description: "AI-powered intake and review automation for grant applications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-slate-50 antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
