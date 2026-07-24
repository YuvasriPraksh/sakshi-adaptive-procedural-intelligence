import {
  LineChart as ReLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from "recharts";
import { ChartWrapper, type ChartWrapperProps } from "./ChartWrapper";
import { chartColors } from "@/theme/colors";
import { CustomTooltip } from "./CustomTooltip";

export interface LineChartSeries {
  key:         string;
  label?:      string;
  color?:      string;
  strokeWidth?: number;
}

export interface LineChartProps extends Omit<ChartWrapperProps, "children"> {
  data:        Record<string, unknown>[];
  series:      LineChartSeries[];
  xKey:        string;
  grid?:       boolean;
  legend?:     boolean;
  yFormatter?: (v: number) => string;
  xFormatter?: (v: string) => string;
}

export function LineChart({ data, series, xKey, grid = true, legend, height = 220, loading, empty, yFormatter, xFormatter, className }: LineChartProps) {
  return (
    <ChartWrapper height={height} loading={loading} empty={empty || !data?.length} className={className}>
      <ReLineChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
        {grid && <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />}
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={xFormatter} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} tickFormatter={yFormatter} axisLine={false} tickLine={false} />
        <Tooltip content={<CustomTooltip formatter={yFormatter} />} />
        {legend && <Legend wrapperStyle={{ fontSize: 11 }} />}
        {series.map((s, i) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            name={s.label ?? s.key}
            stroke={s.color ?? chartColors[i % chartColors.length]}
            strokeWidth={s.strokeWidth ?? 2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        ))}
      </ReLineChart>
    </ChartWrapper>
  );
}
