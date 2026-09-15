import { motion } from "framer-motion";
import { ShieldCheck, ShieldAlert, Lock, Fingerprint, Zap } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { ProgressBar } from "@/components/ui/feedback/ProgressBar";
import { StatusBadge } from "@/components/ui/feedback/StatusBadge";

const SECURITY_STATS = [
  { label:"Encrypted", value: 86, color:"success" },
  { label:"Verified", value: 72, color:"success" },
  { label:"Pending", value: 14, color:"warning" },
  { label:"Tampering Attempts", value: 3, color:"danger" },
  { label:"Access Attempts", value: 24, color:"primary" },
  { label:"Transfer Success", value: 92, color:"success" },
];

const ALERTS = [
  { label:"Integrity Failure", value:"EVD-2024-001842-01", status:"critical" },
  { label:"Transfer Delay", value:"TRF-2024-003", status:"warning" },
  { label:"Unauthorized Access", value:"EVD-2024-001841-01", status:"danger" },
];

export default function EvidenceSecurityPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <ShieldCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evidence Security</h1>
            <p className="text-sm text-muted-foreground">Monitor encryption, verification, and security alerts for evidence custody.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {SECURITY_STATS.map((stat, i) => (
            <motion.div key={stat.label} initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:i * 0.05 }}
              className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-foreground">{stat.value}%</p>
                </div>
                <div className="rounded-2xl bg-muted px-3 py-2 text-xs font-semibold text-muted-foreground">{stat.color}</div>
              </div>
              <ProgressBar value={stat.value} color={stat.color as any} size="sm" className="mt-4" />
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <p className="text-sm font-semibold text-foreground">Active Security Alerts</p>
            </div>
            <div className="space-y-3">
              {ALERTS.map(alert => (
                <div key={alert.label} className="rounded-xl border border-border bg-muted/50 p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{alert.label}</p>
                    <StatusBadge variant={alert.status === "danger" ? "danger" : alert.status === "warning" ? "warning" : "info"} size="xs">{alert.status.toUpperCase()}</StatusBadge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">Reference: {alert.value}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Lock className="h-4 w-4 text-[hsl(var(--primary))]" />
              <p className="text-sm font-semibold text-foreground">Protection Overview</p>
            </div>
            <div className="space-y-4 text-sm text-muted-foreground">
              <p>All evidence assets are encrypted at rest and verified periodically using SHA-256 integrity checks.</p>
              <p>Unauthorized access attempts are logged and alerted to supervisory officers in real time.</p>
              <p>Cross-agency transfers use digital signatures and chain-of-custody health indicators.</p>
            </div>
          </motion.div>
        </div>

        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Fingerprint className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-foreground">Verification Summary</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-xl border border-border bg-muted p-4">
              <p className="text-xs text-muted-foreground">Original Hash</p>
              <p className="mt-2 text-sm font-medium text-foreground break-all">a3f5b8c2d9e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6</p>
            </div>
            <div className="rounded-xl border border-border bg-muted p-4">
              <p className="text-xs text-muted-foreground">Current Hash</p>
              <p className="mt-2 text-sm font-medium text-foreground break-all">a3f5b8c2d9e1f4a7b0c3d6e9f2a5b8c1d4e7f0a3b6c9d2e5f8a1b4c7d0e3f6</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-foreground">
            <Zap className="h-4 w-4 text-emerald-500" /> Verified
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
