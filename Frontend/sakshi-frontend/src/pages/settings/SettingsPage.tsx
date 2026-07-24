import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Settings } from "lucide-react";
export default function SettingsPage() {
  return <DashboardLayout><PlaceholderPage icon={Settings} title="Settings" description="Account, team, security, and API configuration — coming soon." badge="Settings" /></DashboardLayout>;
}
