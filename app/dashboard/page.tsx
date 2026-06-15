import { loadDashboard } from "@/lib/dashboard";
import { DashboardView } from "@/components/dashboard-view";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const state = await loadDashboard();
  return <DashboardView state={state} />;
}
