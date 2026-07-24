import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { UserCog } from "lucide-react";
export default function ProfilePage() {
  return <DashboardLayout><PlaceholderPage icon={UserCog} title="My Profile" description="User profile, credentials, and preferences — coming soon." badge="Profile" /></DashboardLayout>;
}
