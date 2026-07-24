import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Network } from "lucide-react";
export default function GraphPage() {
  return <DashboardLayout><PlaceholderPage icon={Network} title="Procedural Graph" description="AI-generated dynamic procedural investigation graph — coming soon." badge="Graph" /></DashboardLayout>;
}
