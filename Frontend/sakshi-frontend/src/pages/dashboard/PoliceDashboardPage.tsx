import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Shield } from "lucide-react";
export default function PoliceDashboardPage() {
  return <DashboardLayout><PlaceholderPage icon={Shield} title="Police Dashboard" description="Police station command view — coming soon." badge="Police" /></DashboardLayout>;
}
