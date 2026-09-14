import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { riskService } from "@/services/riskService";
import type { RiskAssessment } from "@/types/risk.types";
import { PageSpinner } from "@/components/ui/feedback/Spinner";
import { formatDate } from "@/utils/format";

interface Props {
  caseId: string;
}

export function RiskHistoryChart({ caseId }: Props) {
  const [history, setHistory] = useState<RiskAssessment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const res = await riskService.getRiskHistory(caseId, 1, 100);
        // Backend returns desc order (newest first). Recharts plots left to right.
        setHistory(res.data.slice().reverse());
      } catch (err) {
        console.error("Failed to load risk history", err);
      } finally {
        setLoading(false);
      }
    }
    fetchHistory();
  }, [caseId]);

  if (loading) {
    return <div className="h-[250px] flex items-center justify-center"><PageSpinner /></div>;
  }

  if (history.length === 0) {
    return (
      <div className="h-[250px] flex items-center justify-center text-sm text-muted-foreground">
        No risk history available.
      </div>
    );
  }

  const data = history.map(h => ({
    date: formatDate(h.generatedAt),
    score: h.riskScore,
    level: h.riskLevel,
  }));

  return (
    <div className="rounded-xl border border-border bg-card p-5 mt-4">
      <p className="text-sm font-semibold text-foreground mb-4">Risk Trajectory</p>
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip
              contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: "8px" }}
              itemStyle={{ color: "hsl(var(--foreground))" }}
              labelStyle={{ color: "hsl(var(--muted-foreground))", marginBottom: "4px" }}
              formatter={(value: number, name: string, props: any) => [`${value} (${props.payload.level})`, "Score"]}
            />
            <Area type="monotone" dataKey="score" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorScore)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
