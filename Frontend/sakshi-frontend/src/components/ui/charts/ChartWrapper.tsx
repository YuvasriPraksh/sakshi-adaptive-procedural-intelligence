import { type ReactNode } from "react";
import { ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/feedback/EmptyState";
import { BarChart2 } from "lucide-react";

export interface ChartWrapperProps {
  height?:    number;
  loading?:   boolean;
  empty?:     boolean;
  children:   ReactNode;
  className?: string;
}

export function ChartWrapper({ height = 220, loading, empty, children, className }: ChartWrapperProps) {
  if (loading) return <div className={cn("w-full rounded-xl shimmer", className)} style={{ height }} />;
  if (empty) return (
    <div style={{ height }} className={cn("flex items-center justify-center", className)}>
      <EmptyState icon={<BarChart2 className="h-6 w-6" />} title="No data available" size="sm" />
    </div>
  );
  return (
    <div className={cn("w-full", className)} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        {children as React.ReactElement}
      </ResponsiveContainer>
    </div>
  );
}
