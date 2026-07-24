import { PublicLayout } from "@/components/layout/PublicLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { Globe } from "lucide-react";
export default function CitizenPortalPage() {
  return <PublicLayout><PlaceholderPage icon={Globe} title="Citizen Portal" description="Public-facing portal for case status tracking and support — coming soon." badge="Citizen" /></PublicLayout>;
}
