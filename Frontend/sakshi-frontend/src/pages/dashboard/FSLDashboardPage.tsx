import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { FlaskConical } from "lucide-react";
export default function FSLDashboardPage() {
  return <DashboardLayout><PlaceholderPage icon={FlaskConical} title="FSL Dashboard" description="Forensic Science Laboratory workspace — coming soon." badge="FSL" /></DashboardLayout>;
}
