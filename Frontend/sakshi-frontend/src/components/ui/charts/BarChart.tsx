import {
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ChartWrapper, type ChartWrapperProps } from "./ChartWrapper";
import { chartColors } from "@/theme/colors";
import { CustomTooltip } from "./CustomTooltip";

export interface BarChartSeries {
  key:    string;
  label?: string;
  color?: string;
}

export interface BarChartProps extends Omit<ChartWrapperProps, "children"> {
  data:        Record<string, unknown>[];
  series:      BarChartSeries[];
  xKey:        string;
  stacked?:    boolean;
  layout?:     "vertical" | "horizontal";
  grid?:       boolean;
  legend?:     boolean;
  yFormatter?: (v: number) => string;
}

export function BarChart({ data, series, xKey, stacked, layout = "horizontal", grid = true, legend, height = 220, loading, empty, yFormatter, className }: BarChartProps) {
  return (
    <ChartWrapper height={height} loading={loading} empty={empty || !data?.length} className={className}>
      <ReBarChart data={data} layout={layout} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
        <XAxis
          dataKey={layout === "horizontal" ? xKey : undefined}
          type={layout === "horizontal" ? "category" : "number"}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false} tickLine={false}
          tickFormatter={yFormatter as ((v: string) => string) | undefined}
        />
        <YAxis
          dataKey={layout === "vertical" ? xKey : undefined}
          type={layout === "vertical" ? "category" : "number"}
          tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
          axisLine={false} tickLine={false}
        />
        <Tooltip content={<CustomTooltip formatter={yFormatter} />} />
        {legend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.label ?? s.key}
            fill={s.color ?? chartColors[i % chartColors.length]}
            stackId={stacked ? "stack" : undefined}
            radius={stacked ? [0, 0, 0, 0] : [4, 4, 0, 0]}
            maxBarSize={40}
          />
        ))}
      </ReBarChart>
    </ChartWrapper>
  );
}
