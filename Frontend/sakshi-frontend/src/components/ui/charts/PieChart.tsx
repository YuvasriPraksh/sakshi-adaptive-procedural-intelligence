import {
  PieChart as RePieChart, Pie, Cell, Tooltip, Legend,
} from "recharts";
import { ChartWrapper, type ChartWrapperProps } from "./ChartWrapper";
import { chartColors } from "@/theme/colors";
import { CustomTooltip } from "./CustomTooltip";

export interface PieChartDatum {
  label:   string;
  value:   number;
  color?:  string;
}

export interface PieChartProps extends Omit<ChartWrapperProps, "children"> {
  data:        PieChartDatum[];
  donut?:      boolean;
  legend?:     boolean;
  formatter?:  (v: number) => string;
}

export function PieChart({ data, donut, legend, height = 220, loading, empty, formatter, className }: PieChartProps) {
  return (
    <ChartWrapper height={height} loading={loading} empty={empty || !data?.length} className={className}>
      <RePieChart margin={{ top: 4, right: 8, bottom: 4, left: 8 }}>
        <Tooltip content={<CustomTooltip formatter={formatter} />} />
        {legend && <Legend wrapperStyle={{ fontSize: 11 }} formatter={v => v} />}
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={donut ? "55%" : 0}
          outerRadius="80%"
          dataKey="value"
          nameKey="label"
          paddingAngle={donut ? 2 : 0}
          strokeWidth={0}
        >
          {data.map((entry, i) => (
            <Cell key={entry.label} fill={entry.color ?? chartColors[i % chartColors.length]} />
          ))}
        </Pie>
      </RePieChart>
    </ChartWrapper>
  );
}
