import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Users } from "lucide-react";
export default function CWCDashboardPage() {
  return <DashboardLayout><PlaceholderPage icon={Users} title="CWC Dashboard" description="Child Welfare Committee workspace — coming soon." badge="CWC" /></DashboardLayout>;
}
