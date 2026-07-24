import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { UserCog } from "lucide-react";
export default function SupervisorDashboardPage() {
  return <DashboardLayout><PlaceholderPage icon={UserCog} title="Supervisor Dashboard" description="Oversight and escalation view — coming soon." badge="Supervisor" /></DashboardLayout>;
}
