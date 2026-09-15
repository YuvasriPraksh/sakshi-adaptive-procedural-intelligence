import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { ToastContainer } from "@/components/ui/feedback/Toast";

export interface AuthLayoutProps {
  children:   ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gradient-to-br from-navy-900 via-navy-800 to-royal-900 flex", className)}>
      {/* Left panel — branding */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-20 h-64 w-64 rounded-full bg-royal-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 h-48 w-48 rounded-full bg-emerald-400 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white font-bold text-lg">
            S
          </div>
          <div>
            <p className="text-lg font-bold text-white">SAKSHI</p>
            <p className="text-xs text-white/60">Intelligence Platform</p>
          </div>
        </div>

        {/* Tagline */}
        <div className="relative space-y-4">
          <h1 className="text-4xl font-bold text-white leading-tight">
            AI-Powered Procedural Intelligence for POCSO Investigations
          </h1>
          <p className="text-base text-white/70 max-w-md leading-relaxed">
            Secure, structured, and compliant pre-court investigation support for law enforcement,
            medical professionals, and child welfare committees.
          </p>
          <div className="flex items-center gap-3 pt-2">
            {["Research Prototype", "POCSO Workflow", "Privacy-Preserving Design"].map(tag => (
              <span key={tag} className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs text-white/80">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Footer note */}
        <p className="relative text-xs text-white/40">
          Ministry of Women &amp; Child Development · Government of India
        </p>
      </div>

      {/* Right panel — form */}
      <div className="flex flex-1 items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white font-bold">
              S
            </div>
            <p className="text-lg font-bold text-white">SAKSHI</p>
          </div>
          {children}
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
