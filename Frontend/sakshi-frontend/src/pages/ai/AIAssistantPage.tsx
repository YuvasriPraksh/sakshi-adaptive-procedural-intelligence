import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PlaceholderPage } from "@/pages/placeholder/PlaceholderPage";
import { BrainCircuit } from "lucide-react";
export default function AIAssistantPage() {
  return <DashboardLayout><PlaceholderPage icon={BrainCircuit} title="AI Assistant" description="Conversational AI for procedural guidance and case analysis — coming soon." badge="AI" /></DashboardLayout>;
}
