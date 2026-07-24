import {
  AreaChart as ReAreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ChartWrapper, type ChartWrapperProps } from "./ChartWrapper";
import { chartColors } from "@/theme/colors";
import { CustomTooltip } from "./CustomTooltip";

export interface AreaChartSeries {
  key:    string;
  label?: string;
  color?: string;
}

export interface AreaChartProps extends Omit<ChartWrapperProps, "children"> {
  data:        Record<string, unknown>[];
  series:      AreaChartSeries[];
  xKey:        string;
  stacked?:    boolean;
  grid?:       boolean;
  legend?:     boolean;
  yFormatter?: (v: number) => string;
}

export function AreaChart({ data, series, xKey, stacked, grid = true, legend, height = 220, loading, empty, yFormatter, className }: AreaChartProps) {
  return (
    <ChartWrapper height={height} loading={loading} empty={empty || !data?.length} className={className}>
      <ReAreaChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        <defs>
          {series.map((s, i) => {
            const color = s.color ?? chartColors[i % chartColors.length];
            return (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
                <stop offset="95%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={yFormatter} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip formatter={yFormatter} />} />
        {legend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => {
          const color = s.color ?? chartColors[i % chartColors.length];
          return (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label ?? s.key}
              stroke={color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              stackId={stacked ? "stack" : undefined}
              dot={false}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          );
        })}
      </ReAreaChart>
    </ChartWrapper>
  );
}
