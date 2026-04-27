
import type { AIContextResponse, ERPWorkspaceData, ViewState } from '../types/vantage';

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    Number(value || 0),
  );

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(value || 0));

export const formatPercent = (value: number | string) => `${Number(value || 0).toFixed(1)}%`;

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

export const initials = (name = 'U') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase())
    .join('');

export const normalizeWorkspace = (workspace?: ERPWorkspaceData | null): ERPWorkspaceData => ({
  analytics: {
    revenue: {
      total: Number(workspace?.analytics?.revenue?.total || 0),
      growth: Number(workspace?.analytics?.revenue?.growth || 0),
      history: workspace?.analytics?.revenue?.history || [0, 0, 0, 0, 0, 0, 0],
    },
    users: {
      active: Number(workspace?.analytics?.users?.active || 0),
      growth: Number(workspace?.analytics?.users?.growth || 0),
      distribution: {
        mobile: Number(workspace?.analytics?.users?.distribution?.mobile || 0),
        desktop: Number(workspace?.analytics?.users?.distribution?.desktop || 0),
      },
    },
    regions:
      workspace?.analytics?.regions?.map((region) => ({
        name: region.name,
        value: Number(region.value || 0),
      })) || [],
  },
  reports: workspace?.reports || [],
  customers: workspace?.customers || [],
  inventory: workspace?.inventory || [],
  orders: workspace?.orders || [],
  employees: workspace?.employees || [],
  transactions: workspace?.transactions || [],
  notifications: workspace?.notifications || [],
  admin: workspace?.admin || {
    roleMatrix: ['Finance Lead', 'Ops Manager', 'HR Admin'],
    auditTrailEnabled: true,
    approvalFlow: true,
  },
  settings: {
    theme: workspace?.settings?.theme === 'light' ? 'light' : 'dark',
    notifications: workspace?.settings?.notifications ?? true,
    compactSidebar: workspace?.settings?.compactSidebar ?? false,
    aiEnabled: workspace?.settings?.aiEnabled ?? true,
    companyName: workspace?.settings?.companyName || 'Vantage Enterprise',
  },
});

export function computeLowStockCount(data: ERPWorkspaceData) {
  return (data.inventory || []).filter((item) => Number(item.stock) <= Number(item.reorderLevel || 0)).length;
}

export function computeRevenueForecast(data: ERPWorkspaceData) {
  const history = data.analytics.revenue.history || [];
  if (!history.length) return 0;
  const recent = history.slice(-3);
  return Math.round(recent.reduce((sum, value) => sum + value, 0) / recent.length);
}

export function computeTopCustomer(data: ERPWorkspaceData) {
  return [...(data.customers || [])].sort((a, b) => b.ltv - a.ltv)[0] || null;
}

export function computeTopRegion(data: ERPWorkspaceData) {
  return [...(data.analytics.regions || [])].sort((a, b) => b.value - a.value)[0] || null;
}

export function buildModuleSummary(module: ViewState, data: ERPWorkspaceData) {
  const topCustomer = computeTopCustomer(data);
  const topRegion = computeTopRegion(data);
  const forecast = computeRevenueForecast(data);
  const lowStock = computeLowStockCount(data);
  const pendingTransactions = (data.transactions || []).filter((item) => item.status === 'Pending').length;
  const openOrders = (data.orders || []).filter((item) => item.status !== 'Fulfilled' && item.status !== 'Cancelled').length;

  const base = [
    `Revenue ${formatCurrency(data.analytics.revenue.total)} with ${formatPercent(data.analytics.revenue.growth)} growth.`,
    `${formatCompactNumber(data.analytics.users.active)} active users and ${data.customers.length} CRM records.`,
    `${lowStock} low-stock items, ${openOrders} open orders, and ${pendingTransactions} pending transactions.`,
    `Top customer: ${topCustomer?.name || 'n/a'}. Strongest region: ${topRegion?.name || 'n/a'}.`,
    `Forecasted next revenue period: ${formatCurrency(forecast * 1000)}.`,
  ];

  switch (module) {
    case 'INVENTORY':
      return `${base[2]} Inventory focus: keep replenishment ahead of demand spikes.`;
    case 'ORDERS':
      return `${base[2]} Order focus: convert processing orders faster and push pending deals to paid.`;
    case 'FINANCE':
      return `${base[0]} ${base[2]} Finance focus: reduce pending cash movement.`;
    case 'CUSTOMERS':
      return `${base[1]} ${base[3]} CRM focus: prioritize upsell on the strongest accounts.`;
    case 'HR':
      return `${data.employees.length} employees tracked. Team health looks ${(data.employees || []).length ? 'active' : 'uninitialized'}.`;
    default:
      return base.join(' ');
  }
}

export function fallbackAssistantAnswer(module: ViewState, question: string, data: ERPWorkspaceData): string {
  const lower = question.toLowerCase();
  const topRegion = computeTopRegion(data);
  const topCustomer = computeTopCustomer(data);
  const openOrders = (data.orders || []).filter((item) => item.status !== 'Fulfilled' && item.status !== 'Cancelled');
  const lowStock = (data.inventory || []).filter((item) => Number(item.stock) <= Number(item.reorderLevel || 0));

  if (lower.includes('highest revenue') || lower.includes('region')) {
    return `${topRegion?.name || 'No region'} leads the regional mix at ${topRegion?.value || 0}%.`;
  }

  if (lower.includes('customer') && lower.includes('highest')) {
    return `${topCustomer?.name || 'No customer'} is the highest-value customer at ${formatCurrency(topCustomer?.ltv || 0)} LTV.`;
  }

  if (lower.includes('low stock') || lower.includes('inventory')) {
    return lowStock.length
      ? `Low-stock alert: ${lowStock.map((item) => `${item.name} (${item.stock})`).join(', ')}.`
      : 'No low-stock items detected in the current inventory snapshot.';
  }

  if (lower.includes('orders') || lower.includes('sales')) {
    return openOrders.length
      ? `There are ${openOrders.length} active orders. Largest active order: ${formatCurrency(
          [...openOrders].sort((a, b) => b.amount - a.amount)[0].amount,
        )}.`
      : 'No active orders are open right now.';
  }

  return `Module ${module}: ${buildModuleSummary(module, data)}`;
}

export function deriveAIContext(module: ViewState, data: ERPWorkspaceData): AIContextResponse {
  const topRegion = computeTopRegion(data);
  const topCustomer = computeTopCustomer(data);
  const lowStockCount = computeLowStockCount(data);
  const openOrders = (data.orders || []).filter((item) => item.status !== 'Fulfilled' && item.status !== 'Cancelled').length;
  const pendingTransactions = (data.transactions || []).filter((item) => item.status === 'Pending').length;

  return {
    module,
    summary: buildModuleSummary(module, data),
    highlights: [
      `${formatCurrency(data.analytics.revenue.total)} total revenue`,
      `${formatCompactNumber(data.analytics.users.active)} active users`,
      `${data.reports.length} reports generated`,
      `${data.customers.length} customers in CRM`,
    ],
    joinedInsights: [
      `Top region ${topRegion?.name || 'n/a'} aligns with strongest growth visibility.`,
      `Top customer ${topCustomer?.name || 'n/a'} can anchor the next upsell motion.`,
      `${lowStockCount} inventory alerts can directly affect ${openOrders} open orders.`,
    ],
    metrics: {
      topRegionByRevenue: topRegion?.name || 'N/A',
      topCustomerByLtv: topCustomer?.name || 'N/A',
      lowStockCount,
      openOrders,
      pendingTransactions,
    },
  };
}
