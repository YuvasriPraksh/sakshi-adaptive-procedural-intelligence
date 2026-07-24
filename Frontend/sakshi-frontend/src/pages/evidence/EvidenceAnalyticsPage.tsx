import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { BarChart } from "@/components/ui/charts/BarChart";
import { PieChart } from "@/components/ui/charts/PieChart";
import { LineChart } from "@/components/ui/charts/LineChart";
import { ProgressBar } from "@/components/ui/feedback/ProgressBar";

const AGENCY_DATA = [
  { agency:"Police",count:18},{ agency:"Hospital",count:9},
  { agency:"FSL",   count:12},{ agency:"CWC",     count:5},{ agency:"Court",count:3},
];
const STATUS_PIE = [
  { label:"Sealed",          value:12, color:"#3b82f6" },
  { label:"Under Analysis",  value:8,  color:"#f59e0b" },
  { label:"Verified",        value:15, color:"#10b981" },
  { label:"In Transit",      value:4,  color:"#8b5cf6" },
  { label:"Court Submitted", value:8,  color:"#64748b" },
];
const MONTHLY = [
  { month:"Sep", collected:8,  verified:6  },
  { month:"Oct", collected:12, verified:10 },
  { month:"Nov", collected:9,  verified:8  },
  { month:"Dec", collected:15, verified:12 },
  { month:"Jan", collected:18, verified:16 },
  { month:"Feb", collected:11, verified:9  },
];
const TRANSFER_DATA = [
  { route:"Police → Hospital", count:8  },
  { route:"Police → FSL",      count:12 },
  { route:"Hospital → FSL",    count:6  },
  { route:"FSL → Police",      count:9  },
  { route:"Police → Court",    count:5  },
];

export default function EvidenceAnalyticsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-[hsl(var(--primary))]" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Evidence Analytics</h1>
            <p className="text-sm text-muted-foreground">Comprehensive analysis of evidence management across agencies</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.05 }}
            className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-1">Monthly Evidence Collection vs Verification</p>
            <p className="text-xs text-muted-foreground mb-4">Last 6 months</p>
            <LineChart data={MONTHLY} xKey="month" height={220} legend
              series={[
                { key:"collected", label:"Collected",color:"#3b82f6" },
                { key:"verified",  label:"Verified", color:"#10b981" },
              ]} />
          </motion.div>
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.1 }}
            className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-1">Evidence Status</p>
            <p className="text-xs text-muted-foreground mb-4">Current distribution</p>
            <PieChart data={STATUS_PIE} donut height={200} legend />
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.15 }}
            className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-1">Evidence by Agency</p>
            <p className="text-xs text-muted-foreground mb-4">Current custody distribution</p>
            <BarChart data={AGENCY_DATA} xKey="agency" height={220}
              series={[{ key:"count", label:"Evidence Items", color:"#1d4ed8" }]} />
          </motion.div>
          <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
            className="rounded-xl border border-border bg-card p-5">
            <p className="text-sm font-semibold text-foreground mb-1">Transfer Frequency</p>
            <p className="text-xs text-muted-foreground mb-4">Inter-agency transfers this month</p>
            <BarChart data={TRANSFER_DATA} xKey="route" height={220} layout="horizontal"
              series={[{ key:"count", label:"Transfers", color:"#7c3aed" }]} />
          </motion.div>
        </div>

        <motion.div initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.25 }}
          className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-4">Verification Success Rate by Agency</p>
          <div className="space-y-4">
            {[
              { agency:"Police",   rate:96, count:18 },
              { agency:"Hospital", rate:100,count:9  },
              { agency:"FSL",      rate:92, count:12 },
              { agency:"CWC",      rate:100,count:5  },
              { agency:"Court",    rate:100,count:3  },
            ].map(s => (
              <div key={s.agency} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{s.agency}</span>
                  <span className="text-muted-foreground">{s.count} items · <span className="font-bold text-foreground">{s.rate}%</span> verified</span>
                </div>
                <ProgressBar value={s.rate} color={s.rate>=95?"success":"warning"} size="sm" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
