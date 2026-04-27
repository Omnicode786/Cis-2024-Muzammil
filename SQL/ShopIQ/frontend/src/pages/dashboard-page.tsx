import { useQuery } from "@tanstack/react-query";
import { MessageSquareText } from "lucide-react";
import { PageCard } from "@/components/page-card";
import { StatCard } from "@/components/stat-card";
import { api } from "@/lib/http";
import { prettyDate } from "@/lib/utils";

type DashboardData = {
  stats: {
    customers: number;
    suppliers: number;
    activeUsers: number;
    monthBilling: string;
    monthCollections: string;
    totalReceivables: string;
    totalPayables: string;
  };
  recentThreads: Array<{ aiThreadId: string; title: string; updatedAt: string }>;
};

export function DashboardPage() {
  const { data } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => api.get<DashboardData>("/dashboard")
  });

  const stats = data?.stats;

  return (
    <div className="page-stack">
      <div className="hero panel">
        <div>
          <span className="eyebrow">Control center</span>
          <h1>Run your shop with one clean operating dashboard.</h1>
          <p>Track dues, collections, suppliers, team health, and AI activity in one place.</p>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard label="Customers" value={stats?.customers ?? 0} />
        <StatCard label="Suppliers" value={stats?.suppliers ?? 0} />
        <StatCard label="Active users" value={stats?.activeUsers ?? 0} />
        <StatCard label="Monthly billing" value={stats?.monthBilling ?? 0} moneyMode />
        <StatCard label="Monthly collections" value={stats?.monthCollections ?? 0} moneyMode />
        <StatCard label="Receivables" value={stats?.totalReceivables ?? 0} moneyMode />
        <StatCard label="Payables" value={stats?.totalPayables ?? 0} moneyMode />
      </div>

      <PageCard title="Recent AI threads" subtitle="Stored assistant conversations from your workspace.">
        <div className="list-stack">
          {data?.recentThreads?.length ? data.recentThreads.map((thread) => (
            <div key={thread.aiThreadId} className="list-item">
              <div className="list-item__icon">
                <MessageSquareText size={16} />
              </div>
              <div>
                <strong>{thread.title}</strong>
                <p>Updated {prettyDate(thread.updatedAt)}</p>
              </div>
            </div>
          )) : <p className="muted">No assistant activity yet.</p>}
        </div>
      </PageCard>
    </div>
  );
}
