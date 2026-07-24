import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { GitBranch } from "lucide-react";
export default function TimelinePage() {
  return <DashboardLayout><PlaceholderPage icon={GitBranch} title="Case Timeline" description="Chronological procedural timeline for each case — coming soon." badge="Timeline" /></DashboardLayout>;
}
