import { Bot, Sparkles } from "lucide-react";
import { AppShell } from "@/components/workspace/app-shell";
import { BubbleInsightCard, RingScoreCard, StackedSignalCard, TrendAreaCard } from "@/components/workspace/analytics-cards";
import { AssistantConsole } from "@/components/workspace/assistant-console";
import { ModuleHero, ModuleInsightPanel } from "@/components/workspace/module-hero";
import { SectionHeader } from "@/components/workspace/section-header";
import { getCurrentUser } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/data";
import { workspaceHeading, workspaceNav, workspacePath } from "@/lib/workspace";

function compactMoney(value: number) {
  return `PKR ${Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 }).format(Number(value || 0))}`;
}

export default async function AssistantPage() {
  const user = await getCurrentUser();
  const snapshot = await getDashboardSnapshot(user!.shopId);
  const contextScore = Math.max(0, 100 - snapshot.metrics.stockRiskScore);

  return (
    <AppShell nav={workspaceNav(user?.role)} heading={workspaceHeading(user?.role)} currentPath={workspacePath(user?.role, "assistant")} user={user}>
      <SectionHeader
        eyebrow="AI Copilot"
        title="Ask questions and preview business actions"
        description="Use live shop data to plan reorders, understand dues, summarize sales, or preview safe inventory actions before database writes."
      />
      <div className="module-command-grid">
        <ModuleHero
          eyebrow="AI Copilot"
          title="Business action studio"
          description="Ask ShopIQ about stock, dues, suppliers, invoices and operational decisions. Database writes stay preview-first."
          icon={Bot}
          badge="Preview safe"
          stats={[
            { label: "Mode", value: "Context aware" },
            { label: "Writes", value: "Approval first" },
            { label: "Scope", value: "Live shop data" }
          ]}
        />
        <ModuleInsightPanel
          title="Copilot guardrails"
          description="The assistant can prepare business actions, but you stay in control before anything touches the database."
          icon={Sparkles}
          insights={[
            { label: "Reorders", value: "Supported" },
            { label: "Dues review", value: "Supported" },
            { label: "Safe actions", value: "Previewed" }
          ]}
        />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[0.82fr_1.18fr_0.9fr]">
        <RingScoreCard
          title="AI context readiness"
          description="How complete the live business context is for useful answers."
          score={contextScore}
          value={`${contextScore}%`}
          label="Ready"
          badge="Context"
        />
        <TrendAreaCard
          title="Sales context"
          description="The revenue window the assistant uses when answering business questions."
          value={compactMoney(snapshot.metrics.monthlyRevenue)}
          caption={snapshot.metrics.revenueWindowLabel}
          data={snapshot.charts.revenueTimeline}
          badge="Live data"
          format="money"
        />
        <StackedSignalCard
          title="Action balance"
          description="The assistant weighs reorder, collection and payable pressure together."
          data={[
            { name: "Reorder", value: snapshot.metrics.lowStockCount },
            { name: "Receivables", value: snapshot.metrics.customerDues },
            { name: "Payables", value: snapshot.metrics.supplierDues }
          ]}
          totalLabel="Decision mix"
          badge="Signals"
        />
      </div>
      <div className="mt-6">
        <BubbleInsightCard
          title="Copilot memory board"
          description="Key live numbers available to the assistant before it drafts an answer."
          bubbles={[
            { label: "Sales", value: compactMoney(snapshot.metrics.todaySales), size: "lg" },
            { label: "Inventory", value: compactMoney(snapshot.metrics.inventoryValue), size: "md" },
            { label: "Low stock", value: snapshot.metrics.lowStockCount, size: "sm" },
            { label: "Dues", value: compactMoney(snapshot.metrics.customerDues), size: "sm" }
          ]}
          badge="Context"
        />
      </div>
      <div className="mt-6">
        <AssistantConsole />
      </div>
    </AppShell>
  );
}
