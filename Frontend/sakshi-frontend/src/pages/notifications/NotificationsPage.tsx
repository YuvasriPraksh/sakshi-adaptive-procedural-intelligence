import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Bell } from "lucide-react";
export default function NotificationsPage() {
  return <DashboardLayout><PlaceholderPage icon={Bell} title="Notifications" description="All system alerts, task reminders, and case updates — coming soon." badge="Notifications" /></DashboardLayout>;
}
