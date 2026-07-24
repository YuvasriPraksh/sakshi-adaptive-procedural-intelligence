import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { FileText } from "lucide-react";
export default function DocumentsPage() {
  return <DashboardLayout><PlaceholderPage icon={FileText} title="Documents" description="Secure evidence documents and reports repository — coming soon." badge="Documents" /></DashboardLayout>;
}
