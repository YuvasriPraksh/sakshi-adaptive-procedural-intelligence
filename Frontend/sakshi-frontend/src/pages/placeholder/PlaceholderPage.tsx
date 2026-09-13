import type { LucideIcon } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PlaceholderPageProps {
  title:       string;
  description?: string;
  icon?:       LucideIcon;
  badge?:      string;
  className?:  string;
}

export function PlaceholderPage({ title, description, icon: Icon, badge, className }: PlaceholderPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={cn("flex flex-col items-center justify-center min-h-[60vh] text-center gap-5", className)}
    >
      {Icon && (
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[hsl(var(--primary))]/10 text-[hsl(var(--primary))]">
          <Icon className="h-10 w-10" strokeWidth={1.5} />
        </div>
      )}
      <div className="space-y-2 max-w-md">
        {badge && (
          <span className="inline-block rounded-full border border-[hsl(var(--primary))]/20 bg-[hsl(var(--primary))]/10 px-3 py-0.5 text-xs font-medium text-[hsl(var(--primary))]">
            {badge}
          </span>
        )}
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">
          {description ?? "This page is under construction and will be available soon."}
        </p>
      </div>
    </motion.div>
  );
}
