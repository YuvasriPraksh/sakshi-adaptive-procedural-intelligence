import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { BarChart3 } from "lucide-react";
export default function AnalyticsPage() {
  return <DashboardLayout><PlaceholderPage icon={BarChart3} title="Analytics" description="Cross-agency analytics, SLA tracking, and compliance reporting — coming soon." badge="Analytics" /></DashboardLayout>;
}
