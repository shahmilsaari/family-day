import { DashboardView } from "@/components/dashboard-view";
import { loadDashboard } from "@/lib/dashboard";

export const dynamic = "force-dynamic";

type DashboardPageProps = {
  searchParams: Promise<{ eventId?: string }>;
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const eventId = params.eventId ? Number.parseInt(params.eventId, 10) : undefined;
  const state = await loadDashboard(Number.isFinite(eventId) ? eventId : undefined);
  return <DashboardView state={state} />;
}
