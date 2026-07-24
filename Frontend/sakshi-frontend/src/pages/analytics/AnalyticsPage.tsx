import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Shield, Target, AlertTriangle, BrainCircuit, ChevronDown } from "lucide-react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { RiskDashboard } from "./components/RiskDashboard";
import { ReadinessDashboard } from "./components/ReadinessDashboard";
import { MissingProceduresPanel } from "./components/MissingProceduresPanel";
import { RecommendationsPanel } from "./components/RecommendationsPanel";
import { CaseAISummary } from "./components/CaseAISummary";
import { CASES } from "@/data/cases.data";
import { cn } from "@/lib/utils";

const TABS = [
  { id:"summary",    label:"AI Summary",    icon: BrainCircuit  },
  { id:"risk",       label:"Risk Analysis", icon: Shield        },
  { id:"readiness",  label:"Readiness",     icon: Target        },
  { id:"missing",    label:"Missing Steps", icon: AlertTriangle },
  { id:"recommend",  label:"Recommendations",icon: BarChart3    },
] as const;
type TabId = typeof TABS[number]["id"];

export default function AnalyticsPage() {
  const [activeTab,    setActiveTab]    = useState<TabId>("summary");
  const [selectedCase, setSelectedCase] = useState(CASES[0].id);

  return (
    <DashboardLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">AI Analytics</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              AI-powered case insights, risk analysis, and procedural recommendations
            </p>
          </div>
          <div className="relative">
            <select value={selectedCase} onChange={e => setSelectedCase(e.target.value)}
              className="h-9 rounded-lg border border-border bg-card pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-[hsl(var(--primary))] appearance-none dark:bg-slate-900 dark:text-white min-w-48">
              {CASES.map(c => (
                <option key={c.id} value={c.id}>
                  {c.caseNumber.split("/").pop()} — {c.district}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </div>

        {/* Tab bar */}
        <div className="flex items-center gap-0 overflow-x-auto no-scrollbar border-b border-border">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 whitespace-nowrap px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
                activeTab === tab.id
                  ? "border-[hsl(var(--primary))] text-[hsl(var(--primary))]"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}>
              <tab.icon className="h-3.5 w-3.5" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          {activeTab === "summary"   && <CaseAISummary       caseId={selectedCase} />}
          {activeTab === "risk"      && <RiskDashboard       caseId={selectedCase} />}
          {activeTab === "readiness" && <ReadinessDashboard  caseId={selectedCase} />}
          {activeTab === "missing"   && <MissingProceduresPanel caseId={selectedCase} />}
          {activeTab === "recommend" && <RecommendationsPanel caseId={selectedCase} />}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
