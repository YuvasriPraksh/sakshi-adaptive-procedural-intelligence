import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Building2 } from "lucide-react";
export default function HospitalDashboardPage() {
  return <DashboardLayout><PlaceholderPage icon={Building2} title="Hospital Dashboard" description="Medical examination and evidence dashboard — coming soon." badge="Hospital" /></DashboardLayout>;
}
