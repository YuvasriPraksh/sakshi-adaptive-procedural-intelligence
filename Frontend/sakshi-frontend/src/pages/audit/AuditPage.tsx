import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { ClipboardList } from "lucide-react";
export default function AuditPage() {
  return <DashboardLayout><PlaceholderPage icon={ClipboardList} title="Audit Trail" description="Tamper-proof activity log for all system actions — coming soon." badge="Audit" /></DashboardLayout>;
}
