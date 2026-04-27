import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import * as THREE from 'three';
import {
  Bell,
  Boxes,
  BrainCircuit,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LayoutGrid,
  LineChart,
  Moon,
  Package,
  Search,
  Settings,
  Sparkles,
  Sun,
  Users,
  UserCircle2,
  Warehouse,
} from 'lucide-react';
import { Chart, registerables } from 'chart.js';
import { authApi, erpApi } from './services/api';
import { useERPData } from './hooks/useERPData';
import type {
  AIJoinResponse,
  AnalyticsData,
  Customer,
  Employee,
  InventoryItem,
  NotificationItem,
  OrderItem,
  PremiumViewState,
  Theme,
  TransactionItem,
  VendorItem,
  ProcurementRequest,
  ProjectItem,
  User,
  WorkspaceInfo,
  WorkspaceMember,
  RolePermissions,
} from './types';

Chart.register(...registerables);

type ChartKind = 'line' | 'bar' | 'doughnut';

type ChartPanelProps = {
  type: ChartKind;
  data: Record<string, unknown>;
  options: Record<string, unknown>;
  height?: number;
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const compactCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});

const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function getLastNMonths(n: number) {
  const values: string[] = [];
  const currentDate = new Date();
  for (let i = n - 1; i >= 0; i -= 1) {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
    values.push(monthsShort[date.getMonth()]);
  }
  return values;
}

function toNumber(value: number | string | undefined) {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') return Number(value) || 0;
  return 0;
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ');
}


function canAccess(permission: 'none' | 'view' | 'edit' | undefined, level: 'view' | 'edit' = 'view') {
  if (!permission) return false;
  return level === 'edit' ? permission === 'edit' : permission === 'view' || permission === 'edit';
}

function getRoleBadgeTone(role?: string) {
  if (role === 'owner' || role === 'admin') return 'bg-violet-500/10 text-violet-700 dark:text-violet-300';
  if (role === 'manager') return 'bg-sky-500/10 text-sky-700 dark:text-sky-300';
  if (role === 'viewer') return 'bg-slate-500/10 text-slate-700 dark:text-slate-300';
  return 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
}

function getChartBaseOptions(theme: Theme) {
  const dark = theme === 'dark';
  const gridColor = dark ? 'rgba(148,163,184,0.12)' : 'rgba(15,23,42,0.08)';
  const textColor = dark ? '#cbd5e1' : '#475569';
  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: { duration: 700, easing: 'easeOutQuart' as const },
    interaction: { intersect: false, mode: 'index' as const },
    plugins: {
      legend: {
        labels: {
          color: textColor,
          usePointStyle: true,
          boxWidth: 10,
          boxHeight: 10,
          padding: 18,
          font: { family: 'Inter, sans-serif', size: 11, weight: '600' as const },
        },
      },
      tooltip: {
        backgroundColor: dark ? 'rgba(15,23,42,0.94)' : 'rgba(255,255,255,0.96)',
        titleColor: dark ? '#f8fafc' : '#0f172a',
        bodyColor: dark ? '#e2e8f0' : '#334155',
        borderColor: dark ? 'rgba(148,163,184,0.18)' : 'rgba(15,23,42,0.08)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 14,
        displayColors: true,
      },
    },
    scales: {
      x: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { size: 11 } },
      },
      y: {
        grid: { color: gridColor, drawBorder: false },
        ticks: { color: textColor, font: { size: 11 } },
      },
    },
  };
}

function createChartImage(type: ChartKind, data: Record<string, unknown>, options: Record<string, unknown>) {
  return new Promise<string>((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 600;
    canvas.style.position = 'fixed';
    canvas.style.left = '-99999px';
    canvas.style.top = '-99999px';
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      document.body.removeChild(canvas);
      resolve('');
      return;
    }

    const chart = new Chart(ctx, {
      type,
      data: data as never,
      options: {
        ...(options as object),
        animation: false,
        responsive: false,
        maintainAspectRatio: false,
      } as never,
    });

    setTimeout(() => {
      try {
        const image = canvas.toDataURL('image/png', 1);
        chart.destroy();
        document.body.removeChild(canvas);
        resolve(image);
      } catch {
        chart.destroy();
        if (document.body.contains(canvas)) document.body.removeChild(canvas);
        resolve('');
      }
    }, 300);
  });
}

function ChartPanel({ type, data, options, height = 300 }: ChartPanelProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const chartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return undefined;
    if (chartRef.current) chartRef.current.destroy();
    const chart = new Chart(canvasRef.current, {
      type,
      data: data as never,
      options: options as never,
    });
    chartRef.current = chart;

    return () => {
      chart.destroy();
    };
  }, [data, options, type]);

  return (
    <div style={{ height }} className="relative w-full">
      <canvas ref={canvasRef} />
    </div>
  );
}

function buildInsights(data: AnalyticsData | null) {
  if (!data) return [] as string[];
  const revenueGrowth = toNumber(data.analytics.revenue.growth);
  const userGrowth = toNumber(data.analytics.users.growth);
  const topRegion = [...data.analytics.regions].sort((a, b) => b.value - a.value)[0];
  const lowStock = (data.inventory || []).filter((item) => item.stock <= item.reorderLevel).length;
  return [
    `${revenueGrowth >= 10 ? 'Strong' : 'Moderate'} revenue growth at ${revenueGrowth.toFixed(1)}% this period.`,
    `${userGrowth >= 5 ? 'Healthy' : 'Soft'} user growth at ${userGrowth.toFixed(1)}%, with ${data.analytics.users.active.toLocaleString()} active users.`,
    `${topRegion?.name || 'No region'} is the strongest region by current share at ${topRegion?.value || 0}%.`,
    lowStock > 0 ? `${lowStock} inventory item${lowStock > 1 ? 's are' : ' is'} below reorder threshold.` : 'Inventory levels look stable across tracked items.',
  ];
}

function frontendJoinAssistant(question: string, data: AnalyticsData | null, currentView: PremiumViewState) {
  if (!data) return 'I need dashboard data before I can answer that.';

  const text = question.toLowerCase();
  const topRegion = [...data.analytics.regions].sort((a, b) => b.value - a.value)[0];
  const topCustomer = [...data.customers].sort((a, b) => b.ltv - a.ltv)[0];
  const latestReport = data.reports[0];
  const lowStock = (data.inventory || []).filter((item) => item.stock <= item.reorderLevel);
  const pendingOrders = (data.orders || []).filter((order) => order.status === 'pending' || order.status === 'processing');
  const financeIncome = (data.transactions || []).filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
  const financeExpenses = (data.transactions || []).filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);

  if (text.includes('region') && text.includes('revenue')) {
    return `${topRegion?.name || 'Unknown region'} currently leads regional share at ${topRegion?.value || 0}%. Active users overall are ${data.analytics.users.active.toLocaleString()}, so I would prioritize that region for retention and upsell.`;
  }

  if (text.includes('customer') && (text.includes('highest sales') || text.includes('highest revenue') || text.includes('top customer'))) {
    return `${topCustomer?.name || 'No customer'} is your top customer by LTV at ${currency.format(topCustomer?.ltv || 0)}. The freshest report is ${latestReport?.name || 'not available'}, so that customer should be highlighted in the next executive review.`;
  }

  if (text.includes('stock') || text.includes('inventory')) {
    return lowStock.length
      ? `You have ${lowStock.length} low-stock item(s): ${lowStock.slice(0, 3).map((item) => item.name).join(', ')}.`
      : 'No low-stock items are currently flagged.';
  }

  if (text.includes('order')) {
    return `${pendingOrders.length} orders are still open in ${currentView}. Total tracked orders: ${(data.orders || []).length}.`;
  }

  if (text.includes('finance') || text.includes('cash') || text.includes('transaction')) {
    return `Tracked income is ${currency.format(financeIncome)} and tracked expenses are ${currency.format(financeExpenses)}, leaving net cash flow at ${currency.format(financeIncome - financeExpenses)}.`;
  }

  return `Across ${currentView}, revenue stands at ${currency.format(Number(data.analytics.revenue.total))}, active users are ${data.analytics.users.active.toLocaleString()}, customers tracked are ${data.customers.length}, and reports available are ${data.reports.length}.`;
}

async function createBeautifulPdfReport(report: { name: string; date: string; type: string; status: string }, data: AnalyticsData, theme: Theme, aiSummary: string) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const revenueData = {
    labels: getLastNMonths(data.analytics.revenue.history.length),
    datasets: [
      {
        label: 'Revenue',
        data: data.analytics.revenue.history,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.15)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 5,
      },
    ],
  };

  const regionData = {
    labels: data.analytics.regions.map((item) => item.name),
    datasets: [
      {
        label: 'Regional share',
        data: data.analytics.regions.map((item) => item.value),
        backgroundColor: ['#7c3aed', '#6366f1', '#22c55e', '#f59e0b'],
        borderColor: '#ffffff',
        borderWidth: 2,
      },
    ],
  };

  const deviceData = {
    labels: ['Mobile', 'Desktop'],
    datasets: [
      {
        label: 'Users',
        data: [data.analytics.users.distribution.mobile, data.analytics.users.distribution.desktop],
        backgroundColor: ['#0ea5e9', '#8b5cf6'],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  };

  const basePdfOptions = getChartBaseOptions(theme);
  const revenueImage = await createChartImage('line', revenueData, {
    ...basePdfOptions,
    plugins: { ...basePdfOptions.plugins, legend: { display: false } },
  });
  const regionImage = await createChartImage('doughnut', regionData, {
    ...basePdfOptions,
    cutout: '65%',
    scales: undefined,
  });
  const deviceImage = await createChartImage('bar', deviceData, {
    ...basePdfOptions,
    plugins: { ...basePdfOptions.plugins, legend: { display: false } },
  });

  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');
  doc.setFillColor(124, 58, 237);
  doc.roundedRect(margin, 10, 46, 12, 4, 4, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('VANTAGE ERP', margin + 4, 18);
  doc.setFontSize(24);
  doc.text('Executive Intelligence Report', margin, 31);

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Report: ${report.name}`, margin, 52);
  doc.text(`Generated: ${report.date}`, margin, 58);
  doc.text(`Type: ${report.type} • Status: ${report.status}`, margin, 64);

  const kpiY = 74;
  const kpis = [
    { label: 'Revenue', value: compactCurrency.format(Number(data.analytics.revenue.total)), color: [124, 58, 237] as const },
    { label: 'Growth', value: `${toNumber(data.analytics.revenue.growth).toFixed(1)}%`, color: [16, 185, 129] as const },
    { label: 'Users', value: data.analytics.users.active.toLocaleString(), color: [14, 165, 233] as const },
    { label: 'Customers', value: data.customers.length.toString(), color: [245, 158, 11] as const },
  ];

  kpis.forEach((kpi, index) => {
    const x = margin + index * 46;
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, kpiY, 40, 22, 4, 4, 'F');
    doc.setFillColor(...kpi.color);
    doc.roundedRect(x + 2, kpiY + 2, 2, 18, 1, 1, 'F');
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.text(kpi.label, x + 6, kpiY + 8);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text(kpi.value, x + 6, kpiY + 16);
  });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(15, 23, 42);
  doc.text('Executive summary', margin, 107);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  const summaryLines = doc.splitTextToSize(aiSummary, 178);
  doc.text(summaryLines, margin, 114);

  let currentY = 128 + summaryLines.length * 4.2;
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('Revenue trend', margin, currentY);
  if (revenueImage) doc.addImage(revenueImage, 'PNG', margin, currentY + 4, 182, 54);

  doc.addPage();
  doc.setFillColor(248, 250, 252);
  doc.rect(0, 0, pageWidth, pageHeight, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42);
  doc.text('Distribution & operating health', margin, 18);

  if (regionImage) doc.addImage(regionImage, 'PNG', margin, 26, 86, 60);
  if (deviceImage) doc.addImage(deviceImage, 'PNG', 104, 26, 92, 60);

  const insights = buildInsights(data);
  doc.setFontSize(12);
  doc.text('Key observations', margin, 98);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(71, 85, 105);
  insights.forEach((insight, index) => {
    doc.text(`• ${insight}`, margin, 106 + index * 8);
  });

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('Regional breakdown', margin, 144);
  doc.setFont('helvetica', 'normal');
  data.analytics.regions.forEach((region, index) => {
    doc.text(`${region.name}`, margin, 152 + index * 7);
    doc.text(`${region.value}%`, 80, 152 + index * 7);
  });

  doc.setFont('helvetica', 'bold');
  doc.text('Top customers', 104, 144);
  doc.setFont('helvetica', 'normal');
  [...data.customers]
    .sort((a, b) => b.ltv - a.ltv)
    .slice(0, 4)
    .forEach((customer, index) => {
      doc.text(customer.name, 104, 152 + index * 7);
      doc.text(currency.format(customer.ltv), 168, 152 + index * 7, { align: 'right' });
    });

  for (let page = 1; page <= doc.getNumberOfPages(); page += 1) {
    doc.setPage(page);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, pageHeight - 14, pageWidth - margin, pageHeight - 14);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 116, 139);
    doc.text('Generated by Vantage Premium ERP', margin, pageHeight - 8);
    doc.text(`Page ${page} of ${doc.getNumberOfPages()}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  doc.save(report.name.endsWith('.pdf') ? report.name : `${report.name}.pdf`);
}

const cardMotion = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.35 },
};

function GlassCard({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <motion.div
      {...cardMotion}
      className={cn(
        'rounded-[28px] border border-slate-200/70 bg-white/90 shadow-[0_10px_40px_rgba(15,23,42,0.07)] backdrop-blur-sm dark:border-white/10 dark:bg-slate-900/75 dark:shadow-[0_10px_40px_rgba(2,6,23,0.45)]',
        className,
      )}
    >
      {children}
    </motion.div>
  );
}

function MetricCard({ title, value, sub, icon, tone = 'purple' }: { title: string; value: string; sub: string; icon: ReactNode; tone?: 'purple' | 'blue' | 'green' | 'amber'; }) {
  const tones = {
    purple: 'from-violet-500/20 to-fuchsia-500/10 text-violet-700 dark:text-violet-300',
    blue: 'from-sky-500/20 to-blue-500/10 text-sky-700 dark:text-sky-300',
    green: 'from-emerald-500/20 to-teal-500/10 text-emerald-700 dark:text-emerald-300',
    amber: 'from-amber-500/20 to-orange-500/10 text-amber-700 dark:text-amber-300',
  };

  return (
    <GlassCard className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{title}</p>
          <h3 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">{value}</h3>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{sub}</p>
        </div>
        <div className={cn('rounded-2xl bg-gradient-to-br p-3', tones[tone])}>{icon}</div>
      </div>
    </GlassCard>
  );
}

function AuthView({
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  handleLogin,
  loading,
  authError,
}: {
  isLogin: boolean;
  setIsLogin: (value: boolean) => void;
  email: string;
  setEmail: (value: string) => void;
  password: string;
  setPassword: (value: string) => void;
  handleLogin: (event: FormEvent) => Promise<void>;
  loading: boolean;
  authError: string;
}) {
  return (
    <div className="grid min-h-screen bg-slate-950 text-white md:grid-cols-[1.2fr_0.8fr]">
      <div className="relative hidden overflow-hidden md:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.45),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(14,165,233,0.32),_transparent_26%),linear-gradient(135deg,#020617,#0f172a_55%,#111827)]" />
        <div className="relative z-10 flex flex-col justify-between p-12">
          <div className="inline-flex w-fit items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 backdrop-blur">
            <Sparkles size={16} /> Premium ERP Workspace
          </div>
          <div>
            <h1 className="max-w-2xl text-6xl font-semibold leading-[1.02] tracking-tight">
              Vantage turns raw business activity into a live operating system.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-slate-300">
              Beautiful analytics, context-aware AI, polished reports, and operational modules in one enterprise shell.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-4">
            {['Revenue intelligence', 'Smart operations', 'Executive reports'].map((item) => (
              <div key={item} className="rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur">
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-[32px] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-sm uppercase tracking-[0.24em] text-violet-300">Vantage ERP</p>
            <h2 className="mt-3 text-4xl font-semibold tracking-tight">{isLogin ? 'Welcome back' : 'Create your workspace'}</h2>
            <p className="mt-2 text-slate-300">Modern SaaS aesthetics with ERP depth and AI assistance.</p>
          </div>
          <form className="space-y-4" onSubmit={handleLogin}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-white outline-none ring-0 transition focus:border-violet-400"
              placeholder="admin@vantage.com"
            />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="h-14 w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 text-white outline-none ring-0 transition focus:border-violet-400"
              placeholder="••••••••"
            />
            {authError ? <p className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-300">{authError}</p> : null}
            <button disabled={loading} className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:scale-[0.99] disabled:opacity-60">
              {loading ? 'Authenticating…' : isLogin ? 'Access workspace' : 'Create account'}
            </button>
          </form>
          <div className="mt-6 flex items-center justify-between text-sm text-slate-300">
            <button onClick={() => setIsLogin(!isLogin)} className="transition hover:text-white">
              {isLogin ? 'Create account' : 'Back to login'}
            </button>
            <Link to="/" className="transition hover:text-white">Home</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Sidebar({
  view,
  setView,
  user,
  permissions,
  collapsed,
  setCollapsed,
}: {
  view: PremiumViewState;
  setView: (view: PremiumViewState) => void;
  user: User | null;
  permissions?: RolePermissions | null;
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
}) {
  const groups = [
    {
      title: 'Workspace',
      items: [
        { id: 'DASHBOARD', label: 'Overview', icon: <Home size={18} /> },
        { id: 'ANALYTICS', label: 'Analytics', icon: <LineChart size={18} /> },
        { id: 'REPORTS', label: 'Reports', icon: <FileText size={18} /> },
        { id: 'IMMERSIVE', label: 'Immersive', icon: <Sparkles size={18} /> },
      ],
    },
    {
      title: 'Operations',
      items: [
        { id: 'CUSTOMERS', label: 'CRM', icon: <Users size={18} /> },
        { id: 'INVENTORY', label: 'Inventory', icon: <Warehouse size={18} /> },
        { id: 'ORDERS', label: 'Orders', icon: <Briefcase size={18} /> },
        { id: 'HR', label: 'HR', icon: <UserCircle2 size={18} /> },
        { id: 'FINANCE', label: 'Finance', icon: <CreditCard size={18} />, visible: canAccess(permissions?.finance) },
        { id: 'VENDORS', label: 'Vendors', icon: <Boxes size={18} />, visible: canAccess(permissions?.vendors) },
        { id: 'PROCUREMENT', label: 'Procurement', icon: <Package size={18} />, visible: canAccess(permissions?.procurement) },
        { id: 'PROJECTS', label: 'Projects', icon: <Sparkles size={18} />, visible: canAccess(permissions?.projects) },
        { id: 'ADMIN', label: 'Admin', icon: <Settings size={18} />, visible: Boolean(permissions?.workspaceAdmin) },
      ],
    },
  ] as const;

  return (
    <aside className={cn('hidden border-r border-slate-200/70 bg-white/85 px-3 py-4 shadow-xl backdrop-blur-xl transition-all dark:border-white/10 dark:bg-slate-950/70 lg:flex lg:flex-col', collapsed ? 'w-[92px]' : 'w-[280px]')}>
      <div className="flex items-center justify-between px-2 pb-4">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
            <LayoutGrid size={20} />
          </div>
          {!collapsed ? (
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">Vantage</p>
              <p className="text-lg font-semibold text-slate-900 dark:text-white">ERP</p>
            </div>
          ) : null}
        </div>
        <button onClick={() => setCollapsed(!collapsed)} className="grid h-10 w-10 place-items-center rounded-2xl border border-slate-200 text-slate-600 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto px-1">
        {groups.map((group) => (
          <div key={group.title}>
            {!collapsed ? <p className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{group.title}</p> : null}
            <div className="space-y-1.5">
              {group.items.filter((item: any) => item.visible !== false).map((item) => {
                const active = view === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setView(item.id as PremiumViewState)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left text-sm font-medium transition',
                      active
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-900/25'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/5',
                      collapsed && 'justify-center px-0',
                    )}
                  >
                    {item.icon}
                    {!collapsed ? <span>{item.label}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-[28px] border border-slate-200/70 bg-slate-50/90 p-3 dark:border-white/10 dark:bg-white/5">
        <button onClick={() => setView('PROFILE')} className={cn('flex w-full items-center gap-3 rounded-2xl p-2 transition hover:bg-white dark:hover:bg-white/5', collapsed && 'justify-center')}>
          <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 font-semibold text-white">
            {user?.name?.[0] || 'V'}
          </div>
          {!collapsed ? (
            <div className="min-w-0 text-left">
              <p className="truncate font-semibold text-slate-900 dark:text-white">{user?.name || 'Workspace User'}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user?.role || 'Operator'}</p>
            </div>
          ) : null}
        </button>
        {!collapsed ? (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <button onClick={() => setView('SETTINGS')} className="rounded-2xl bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-100 dark:bg-white/10 dark:text-slate-200 dark:hover:bg-white/15">Settings</button>
            <button onClick={() => setView('AUTH')} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm font-medium text-rose-600 transition hover:bg-rose-500/15 dark:text-rose-300">Logout</button>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function NotificationDropdown({ items, onRead }: { items: NotificationItem[]; onRead: (id: string) => void }) {
  return (
    <div className="absolute right-0 top-12 z-30 w-[360px] rounded-[28px] border border-slate-200/70 bg-white/95 p-3 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/90">
      <div className="mb-2 flex items-center justify-between px-2">
        <div>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Operational events and alerts</p>
        </div>
      </div>
      <div className="max-h-96 space-y-2 overflow-y-auto pr-1">
        {items.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-500 dark:bg-white/5 dark:text-slate-400">You are all caught up.</div>
        ) : items.map((item) => (
          <button key={item.id} onClick={() => onRead(item.id)} className={cn('w-full rounded-2xl border p-3 text-left transition', item.read ? 'border-slate-200 bg-slate-50 dark:border-white/10 dark:bg-white/5' : 'border-violet-200 bg-violet-50 dark:border-violet-500/20 dark:bg-violet-500/10')}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{item.title}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.body}</p>
              </div>
              <span className={cn('mt-0.5 rounded-full px-2 py-1 text-[10px] uppercase tracking-[0.18em]', item.level === 'critical' ? 'bg-rose-500/10 text-rose-500' : item.level === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-sky-500/10 text-sky-600')}>{item.level}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function Topbar({
  theme,
  toggleTheme,
  title,
  searchQuery,
  setSearchQuery,
  onSearch,
  onOpenAI,
  notifications,
  onReadNotification,
  workspaceName,
  memberCount,
}: {
  theme: Theme;
  toggleTheme: () => void;
  title: string;
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  onSearch: () => void;
  onOpenAI: () => void;
  notifications: NotificationItem[];
  onReadNotification: (id: string) => void;
  workspaceName?: string;
  memberCount?: number;
}) {
  const [showNotifications, setShowNotifications] = useState(false);
  const unread = notifications.filter((item) => !item.read).length;

  return (
    <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 px-4 py-4 backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/70 sm:px-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex flex-col gap-2">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <Users size={14} />
            {workspaceName || 'Workspace'} • {memberCount || 1} member{(memberCount || 1) > 1 ? 's' : ''}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Enterprise control center</p>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-12 min-w-[260px] items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 shadow-sm dark:border-white/10 dark:bg-white/5">
            <Search size={17} className="text-slate-400" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              onKeyDown={(event) => event.key === 'Enter' && onSearch()}
              placeholder="Search customers, reports, inventory…"
              className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400 dark:text-white"
            />
          </div>

          <button onClick={onOpenAI} className="inline-flex h-12 items-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 font-medium text-white shadow-lg shadow-violet-900/25 transition hover:scale-[0.99]">
            <BrainCircuit size={18} />
            AI Assistant
          </button>

          <div className="relative">
            <button onClick={() => setShowNotifications((prev) => !prev)} className="relative grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
              <Bell size={18} />
              {unread > 0 ? <span className="absolute right-2 top-2 grid h-5 min-w-5 place-items-center rounded-full bg-rose-500 px-1 text-[10px] font-semibold text-white">{unread}</span> : null}
            </button>
            {showNotifications ? <NotificationDropdown items={notifications} onRead={onReadNotification} /> : null}
          </div>

          <button onClick={toggleTheme} className="grid h-12 w-12 place-items-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:bg-white/10">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function AIAssistantDrawer({
  open,
  onClose,
  question,
  setQuestion,
  answer,
  loading,
  onSubmit,
  currentView,
  contextUsed,
}: {
  open: boolean;
  onClose: () => void;
  question: string;
  setQuestion: (value: string) => void;
  answer: string;
  loading: boolean;
  onSubmit: () => void;
  currentView: PremiumViewState;
  contextUsed: string[];
}) {
  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm" onClick={onClose} />
          <motion.aside initial={{ x: 460 }} animate={{ x: 0 }} exit={{ x: 460 }} transition={{ type: 'spring', stiffness: 220, damping: 28 }} className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[440px] flex-col border-l border-white/10 bg-slate-950/95 p-5 text-white shadow-2xl backdrop-blur-xl">
            <div className="flex items-start justify-between gap-4 pb-5">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Context-aware AI</p>
                <h3 className="mt-2 text-2xl font-semibold">Business Copilot</h3>
                <p className="mt-2 text-sm text-slate-300">Current module: {currentView}</p>
              </div>
              <button onClick={onClose} className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/5 text-slate-200">✕</button>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-white/5 p-4">
              <p className="text-sm text-slate-300">Ask questions such as:</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  'Which region has highest revenue and most active users?',
                  'What needs attention in inventory today?',
                  'Summarize finance and customer health.',
                ].map((example) => (
                  <button key={example} onClick={() => setQuestion(example)} className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-slate-200 transition hover:bg-white/10">
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 flex-1 rounded-[28px] border border-white/10 bg-slate-900/80 p-4">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-sm font-medium text-white">Response</p>
                {contextUsed.length ? <p className="text-xs text-slate-400">Using: {contextUsed.join(', ')}</p> : null}
              </div>
              <div className="h-[calc(100%-24px)] overflow-y-auto whitespace-pre-wrap text-sm leading-7 text-slate-200">
                {answer || 'I can combine analytics, customers, reports, inventory, orders, HR, and finance context.'}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <textarea
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                className="h-32 w-full rounded-[24px] border border-white/10 bg-white/5 p-4 text-sm text-white outline-none placeholder:text-slate-400"
                placeholder="Ask something strategic…"
              />
              <button onClick={onSubmit} disabled={loading || !question.trim()} className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-semibold text-white shadow-lg shadow-violet-900/25 disabled:opacity-60">
                <BrainCircuit size={18} />
                {loading ? 'Thinking…' : 'Run context-aware analysis'}
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}

function DashboardView({
  data,
  theme,
  derived,
  onNavigate,
  workspace,
}: {
  data: AnalyticsData;
  theme: Theme;
  derived: ReturnType<typeof useERPData>['derived'];
  onNavigate: (view: PremiumViewState) => void;
  workspace: WorkspaceInfo | null;
}) {
  const baseOptions = getChartBaseOptions(theme);
  const revenueData = useMemo(() => ({
    labels: getLastNMonths(data.analytics.revenue.history.length),
    datasets: [
      {
        label: 'Revenue',
        data: data.analytics.revenue.history,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.16)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointBackgroundColor: '#7c3aed',
        pointHoverRadius: 5,
      },
    ],
  }), [data.analytics.revenue.history]);

  const regionData = useMemo(() => ({
    labels: data.analytics.regions.map((item) => item.name),
    datasets: [
      {
        label: 'Regional share',
        data: data.analytics.regions.map((item) => item.value),
        backgroundColor: ['#7c3aed', '#0ea5e9', '#22c55e', '#f59e0b'],
        borderColor: '#ffffff',
        borderWidth: 2,
        hoverOffset: 6,
      },
    ],
  }), [data.analytics.regions]);

  const orderSeries = useMemo(() => ({
    labels: ['Pending', 'Processing', 'Fulfilled', 'Cancelled'],
    datasets: [
      {
        label: 'Orders',
        data: [
          (data.orders || []).filter((order) => order.status === 'pending').length,
          (data.orders || []).filter((order) => order.status === 'processing').length,
          (data.orders || []).filter((order) => order.status === 'fulfilled').length,
          (data.orders || []).filter((order) => order.status === 'cancelled').length,
        ],
        backgroundColor: ['#f59e0b', '#38bdf8', '#22c55e', '#f43f5e'],
        borderRadius: 10,
        borderSkipped: false,
      },
    ],
  }), [data.orders]);

  const insights = buildInsights(data);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      <section className="grid gap-4 xl:grid-cols-12">
        <div className="xl:col-span-3"><MetricCard title="Revenue" value={compactCurrency.format(Number(data.analytics.revenue.total))} sub={`${toNumber(data.analytics.revenue.growth).toFixed(1)}% growth vs prior period`} icon={<DollarSign size={20} />} tone="purple" /></div>
        <div className="xl:col-span-3"><MetricCard title="Active users" value={data.analytics.users.active.toLocaleString()} sub={`${toNumber(data.analytics.users.growth).toFixed(1)}% growth and healthy engagement`} icon={<Users size={20} />} tone="blue" /></div>
        <div className="xl:col-span-3"><MetricCard title="Open orders" value={String(derived?.pendingOrders.length || 0)} sub={`${(data.orders || []).length} total tracked orders`} icon={<Briefcase size={20} />} tone="green" /></div>
        <div className="xl:col-span-3"><MetricCard title="Low stock" value={String(derived?.lowStockItems.length || 0)} sub="Items that need replenishment attention" icon={<Boxes size={20} />} tone="amber" /></div>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <GlassCard className="xl:col-span-4 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Workspace quick actions</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Jump straight into real work instead of using the dashboard like a static showcase.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:bg-white/10 dark:text-slate-300">{workspace?.memberCount || 1} teammates</span>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <button onClick={() => onNavigate('CUSTOMERS')} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-white/5">
              <p className="font-medium text-slate-900 dark:text-white">Add or edit customers</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage CRM, value, region, and status.</p>
            </button>
            <button onClick={() => onNavigate('ORDERS')} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-white/5">
              <p className="font-medium text-slate-900 dark:text-white">Create orders</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track pipeline, ownership, and sales execution.</p>
            </button>
            <button onClick={() => onNavigate('INVENTORY')} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-white/5">
              <p className="font-medium text-slate-900 dark:text-white">Manage inventory</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Update stock, price, reorder levels, and suppliers.</p>
            </button>
            <button onClick={() => onNavigate('ADMIN')} className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:border-violet-300 dark:border-white/10 dark:bg-white/5">
              <p className="font-medium text-slate-900 dark:text-white">Invite teammates</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add team members and control workspace access.</p>
            </button>
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-8 p-5">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Revenue performance</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">A clean time-series view with accurate scale and month labels.</p>
            </div>
            <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-600 dark:text-violet-300">Momentum {(derived?.revenueMomentum || 0) >= 0 ? 'up' : 'down'}</span>
          </div>
          <ChartPanel type="line" data={revenueData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } }, scales: { ...baseOptions.scales, y: { ...baseOptions.scales.y, ticks: { ...baseOptions.scales.y.ticks, callback: (value: string | number) => `$${value}k` } } } }} height={320} />
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <GlassCard className="xl:col-span-5 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Regional mix</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Weighted distribution by share, shown without decorative distortion.</p>
          </div>
          <ChartPanel type="doughnut" data={regionData} options={{ ...baseOptions, cutout: '68%', scales: undefined }} height={320} />
        </GlassCard>

        <GlassCard className="xl:col-span-4 p-5">
          <div className="mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
            <Sparkles size={18} className="text-violet-500" />
            <p className="text-sm font-semibold">AI-ready operating insights</p>
          </div>
          <div className="space-y-3">
            {insights.map((insight) => (
              <div key={insight} className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm leading-6 text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                {insight}
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="xl:col-span-3 p-5">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Priority queue</p>
          <div className="mt-4 space-y-3">
            {(derived?.lowStockItems || []).slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
                <p className="font-medium text-slate-900 dark:text-white">{item.name}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Stock {item.stock} / reorder level {item.reorderLevel}</p>
              </div>
            ))}
            {!(derived?.lowStockItems || []).length ? (
              <div className="rounded-2xl border border-slate-200/70 bg-slate-50/90 p-4 text-sm text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400">No urgent stock risks right now.</div>
            ) : null}
          </div>
        </GlassCard>
      </section>

      <section className="grid gap-4 xl:grid-cols-12">
        <GlassCard className="xl:col-span-5 p-5">
          <div className="mb-4">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Operational order mix</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Order pipeline by lifecycle status.</p>
          </div>
          <ChartPanel type="bar" data={orderSeries} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } }} height={290} />
        </GlassCard>

        <GlassCard className="xl:col-span-7 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent shared workspace activity</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Live operational context that the team can actually act on.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {(data.orders || []).slice(0, 3).map((order) => (
              <div key={order.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-medium text-slate-900 dark:text-white">{order.customerName}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{order.status} • {currency.format(order.amount)} • {order.region || '—'}</p>
              </div>
            ))}
            {(data.customers || []).slice(0, 3).map((customer) => (
              <div key={customer.id} className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5">
                <p className="font-medium text-slate-900 dark:text-white">{customer.name}</p>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.region || '—'} • {currency.format(customer.ltv)} • {customer.status || 'active'}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function AnalyticsView({
  data,
  theme,
  derived,
  onSaveAnalytics,
}: {
  data: AnalyticsData;
  theme: Theme;
  derived: ReturnType<typeof useERPData>['derived'];
  onSaveAnalytics: (payload: Partial<AnalyticsData['analytics']>) => Promise<void>;
}) {
  const baseOptions = getChartBaseOptions(theme);
  const [form, setForm] = useState({
    active: String(data.analytics.users.active),
    growth: String(data.analytics.users.growth),
    mobile: String(data.analytics.users.distribution.mobile),
    desktop: String(data.analytics.users.distribution.desktop),
    mobileDefinition: data.analytics.meta?.deviceDefinitions?.mobile || 'Mobile users are active users whose latest tracked session came from a phone browser or mobile app.',
    desktopDefinition: data.analytics.meta?.deviceDefinitions?.desktop || 'Desktop users are active users whose latest tracked session came from a desktop or laptop browser.',
  });

  useEffect(() => {
    setForm({
      active: String(data.analytics.users.active),
      growth: String(data.analytics.users.growth),
      mobile: String(data.analytics.users.distribution.mobile),
      desktop: String(data.analytics.users.distribution.desktop),
      mobileDefinition: data.analytics.meta?.deviceDefinitions?.mobile || 'Mobile users are active users whose latest tracked session came from a phone browser or mobile app.',
      desktopDefinition: data.analytics.meta?.deviceDefinitions?.desktop || 'Desktop users are active users whose latest tracked session came from a desktop or laptop browser.',
    });
  }, [data]);

  const mobileCount = derived?.deviceCounts.mobile || 0;
  const desktopCount = derived?.deviceCounts.desktop || 0;
  const deviceData = {
    labels: ['Mobile users', 'Desktop users'],
    datasets: [
      {
        label: 'Active users',
        data: [mobileCount, desktopCount],
        backgroundColor: ['#0ea5e9', '#8b5cf6'],
        borderRadius: 14,
      },
    ],
  };
  const revenueVsUsers = {
    labels: getLastNMonths(data.analytics.revenue.history.length),
    datasets: [
      {
        label: 'Revenue ($k)',
        data: data.analytics.revenue.history,
        borderColor: '#7c3aed',
        backgroundColor: 'rgba(124,58,237,0.12)',
        yAxisID: 'y',
        tension: 0.3,
      },
      {
        label: 'Active users',
        data: data.analytics.revenue.history.map((_, index) => Math.round((Number(data.analytics.users.active || 0) * (0.62 + index * 0.05)) / 1.2)),
        borderColor: '#0ea5e9',
        backgroundColor: 'rgba(14,165,233,0.12)',
        yAxisID: 'y1',
        tension: 0.3,
      },
    ],
  };

  const save = async () => {
    await onSaveAnalytics({
      users: {
        active: Number(form.active),
        growth: Number(form.growth),
        distribution: {
          mobile: Number(form.mobile),
          desktop: Number(form.desktop),
        },
      },
      meta: {
        deviceDefinitions: {
          mobile: form.mobileDefinition,
          desktop: form.desktopDefinition,
        },
      },
    } as never);
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-8 p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Revenue and active user trajectory</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Dual-axis chart for trend comparison with clean scales and exact meaning.</p>
        </div>
        <ChartPanel type="line" data={revenueVsUsers} options={{
          ...baseOptions,
          scales: {
            x: baseOptions.scales.x,
            y: {
              ...baseOptions.scales.y,
              position: 'left',
              ticks: { ...baseOptions.scales.y.ticks, callback: (value: string | number) => `$${value}k` },
            },
            y1: {
              position: 'right',
              grid: { display: false },
              ticks: { color: theme === 'dark' ? '#cbd5e1' : '#475569', font: { size: 11 } },
            },
          },
        }} height={360} />
      </GlassCard>

      <GlassCard className="xl:col-span-4 p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Device audience explained</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">These are not vague percentages anymore — they map to tracked active users.</p>
        </div>
        <div className="grid gap-3">
          <div className="rounded-2xl bg-sky-50 p-4 dark:bg-sky-500/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Mobile users</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{mobileCount.toLocaleString()}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{form.mobileDefinition}</p>
          </div>
          <div className="rounded-2xl bg-violet-50 p-4 dark:bg-violet-500/10">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Desktop users</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{desktopCount.toLocaleString()}</p>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{form.desktopDefinition}</p>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="xl:col-span-5 p-5">
        <div className="mb-4">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Active users by device</p>
          <p className="text-sm text-slate-500 dark:text-slate-400">Absolute counts based on the workspace’s active users and your distribution settings.</p>
        </div>
        <ChartPanel type="bar" data={deviceData} options={{ ...baseOptions, plugins: { ...baseOptions.plugins, legend: { display: false } } }} height={300} />
      </GlassCard>

      <GlassCard className="xl:col-span-7 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Editable analytics model</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Adjust user counts and device logic so the dashboard reflects your business, not placeholder demo values.</p>
          </div>
          <button onClick={save} className="rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-4 py-2 text-sm font-medium text-white">Save analytics</button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <input value={form.active} onChange={(e) => setForm({ ...form, active: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Active users" type="number" />
            <input value={form.growth} onChange={(e) => setForm({ ...form, growth: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="User growth %" type="number" />
            <div className="grid grid-cols-2 gap-3">
              <input value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Mobile %" type="number" />
              <input value={form.desktop} onChange={(e) => setForm({ ...form, desktop: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Desktop %" type="number" />
            </div>
          </div>
          <div className="space-y-3">
            <textarea value={form.mobileDefinition} onChange={(e) => setForm({ ...form, mobileDefinition: e.target.value })} className="h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Explain what counts as a mobile user" />
            <textarea value={form.desktopDefinition} onChange={(e) => setForm({ ...form, desktopDefinition: e.target.value })} className="h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Explain what counts as a desktop user" />
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ReportsView({
  data,
  theme,
  apiKey,
  createReport,
}: {
  data: AnalyticsData;
  theme: Theme;
  apiKey: string;
  createReport: (type: string) => Promise<void>;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (report: { id: string; name: string; date: string; type: string; status: string }) => {
    setDownloadingId(report.id);
    let aiSummary = `Revenue is ${currency.format(Number(data.analytics.revenue.total))}, active users are ${data.analytics.users.active.toLocaleString()}, and customer portfolio size is ${data.customers.length}. Regional mix remains led by ${(data.analytics.regions.sort((a, b) => b.value - a.value)[0] || { name: 'N/A' }).name}.`;

    if (apiKey.trim()) {
      try {
        const result = await erpApi.askContextAI('local', `Write a polished 2 sentence executive summary for this ERP report using revenue ${data.analytics.revenue.total}, growth ${data.analytics.revenue.growth}, users ${data.analytics.users.active}, customers ${data.customers.length}.`, apiKey, 'REPORTS');
        aiSummary = result.answer || aiSummary;
      } catch {
        // ignore and use fallback
      }
    }

    await createBeautifulPdfReport(report, data, theme, aiSummary);
    setDownloadingId(null);
  };

  return (
    <div className="space-y-4 p-4 sm:p-6">
      <GlassCard className="p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Premium reports</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Styled export with executive summary, KPI blocks, and clean charts.</p>
          </div>
          <button onClick={() => createReport('FINANCIAL')} className="inline-flex h-12 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 px-5 font-medium text-white shadow-lg shadow-violet-900/25">Generate PDF report</button>
        </div>
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Name</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {data.reports.map((report) => (
                <tr key={report.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5">
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{report.name}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{report.date}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{report.type}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-600 dark:text-emerald-300">{report.status}</span></td>
                  <td className="px-5 py-4">
                    <button onClick={() => handleDownload(report)} className="rounded-2xl bg-slate-900 px-4 py-2 font-medium text-white transition hover:bg-slate-800 dark:bg-white dark:text-slate-900">
                      {downloadingId === report.id ? 'Preparing…' : 'Download beautiful PDF'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function CustomersView({
  customers,
  onAdd,
  onUpdate,
  onDelete,
}: {
  customers: Customer[];
  onAdd: (payload: Pick<Customer, 'name' | 'email' | 'ltv'> & Partial<Customer>) => Promise<void>;
  onUpdate: (id: string, payload: Partial<Customer>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [form, setForm] = useState({ name: '', email: '', ltv: '0', region: 'North America', status: 'active' as const });
  const [editingId, setEditingId] = useState<string | null>(null);

  const reset = () => {
    setForm({ name: '', email: '', ltv: '0', region: 'North America', status: 'active' });
    setEditingId(null);
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = {
      name: form.name,
      email: form.email,
      ltv: Number(form.ltv),
      region: form.region,
      status: form.status,
    };
    if (editingId) {
      await onUpdate(editingId, payload);
    } else {
      await onAdd(payload);
    }
    reset();
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Customer workspace</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">CRM that keeps the original add flow but now supports region and status.</p>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Customer name" required />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Email" required />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.ltv} type="number" onChange={(e) => setForm({ ...form, ltv: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="LTV" required />
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option>North America</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>
          <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Customer['status'] })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
            <option value="active">Active</option>
            <option value="new">New</option>
            <option value="at-risk">At risk</option>
          </select>
          <div className="flex gap-3">
            <button className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">{editingId ? 'Update customer' : 'Add customer'}</button>
            {editingId ? <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-4 font-medium text-slate-700 dark:border-white/10 dark:text-slate-200">Cancel</button> : null}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="xl:col-span-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Customer</th>
                <th className="px-5 py-4 font-semibold">Region</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">LTV</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {customers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{customer.name}</div>
                    <div className="text-slate-500 dark:text-slate-400">{customer.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{customer.region || '—'}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-white/10 dark:text-slate-300">{customer.status || 'active'}</span></td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{currency.format(customer.ltv)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(customer.id); setForm({ name: customer.name, email: customer.email, ltv: String(customer.ltv), region: customer.region || 'North America', status: customer.status || 'active' }); }} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Edit</button>
                      <button onClick={() => onDelete(customer.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function InventoryView({ inventory, onAdd, onUpdate, onDelete }: { inventory: InventoryItem[]; onAdd: (payload: Omit<InventoryItem, 'id'>) => Promise<void>; onUpdate: (id: string, payload: Partial<InventoryItem>) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
  const [form, setForm] = useState({ sku: '', name: '', category: 'Software', stock: 0, reorderLevel: 5, price: 0, supplier: 'Internal', status: 'healthy' as const });

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Inventory management</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Low stock alerts and reorder thresholds are preserved and expanded.</p>
        <div className="mt-5 space-y-3">
          <input value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="SKU" />
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Item name" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.stock} type="number" onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Stock" />
            <input value={form.reorderLevel} type="number" onChange={(e) => setForm({ ...form, reorderLevel: Number(e.target.value) })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Reorder" />
          </div>
          <input value={form.price} type="number" onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Unit price" />
          <button onClick={() => onAdd(form)} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">Add inventory item</button>
        </div>
      </GlassCard>

      <div className="xl:col-span-8 grid gap-4 md:grid-cols-2">
        {inventory.map((item) => (
          <GlassCard key={item.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.sku}</p>
                <h3 className="mt-2 text-lg font-semibold text-slate-900 dark:text-white">{item.name}</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{item.category}</p>
              </div>
              <span className={cn('rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]', item.stock <= item.reorderLevel ? 'bg-amber-500/10 text-amber-600 dark:text-amber-300' : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-300')}>{item.stock <= item.reorderLevel ? 'Low' : 'Healthy'}</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-300">
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">Stock: {item.stock}</div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">Reorder: {item.reorderLevel}</div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">Price: {currency.format(item.price)}</div>
              <div className="rounded-2xl bg-slate-50 p-3 dark:bg-white/5">Supplier: {item.supplier || '—'}</div>
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => onUpdate(item.id, { stock: item.stock + 1 })} className="rounded-2xl border border-slate-200 px-3 py-2 text-sm text-slate-700 dark:border-white/10 dark:text-slate-200">+1 stock</button>
              <button onClick={() => onDelete(item.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-sm text-rose-600 dark:text-rose-300">Delete</button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}

function OrdersView({
  data,
  onAdd,
  onUpdate,
  onDelete,
}: {
  data: AnalyticsData;
  onAdd: (payload: Omit<OrderItem, 'id'>) => Promise<void>;
  onUpdate: (id: string, payload: Partial<OrderItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ customerName: '', amount: '0', status: 'pending' as OrderItem['status'], date: new Date().toISOString().split('T')[0], region: 'North America', notes: '' });

  const reset = () => {
    setEditingId(null);
    setForm({ customerName: '', amount: '0', status: 'pending', date: new Date().toISOString().split('T')[0], region: 'North America', notes: '' });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { customerName: form.customerName, amount: Number(form.amount), status: form.status, date: form.date, region: form.region, notes: form.notes };
    if (editingId) await onUpdate(editingId, payload);
    else await onAdd(payload as Omit<OrderItem, 'id'>);
    reset();
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Sales order workspace</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create, edit, and remove real orders so the sales pipeline is actually operable.</p>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Customer name" required />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Amount" required />
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as OrderItem['status'] })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <select value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option>North America</option>
              <option>Europe</option>
              <option>Asia</option>
            </select>
          </div>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className="h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Notes" />
          <div className="flex gap-3">
            <button className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">{editingId ? 'Update order' : 'Create order'}</button>
            {editingId ? <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-4 font-medium text-slate-700 dark:border-white/10 dark:text-slate-200">Cancel</button> : null}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="xl:col-span-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Order</th>
                <th className="px-5 py-4 font-semibold">Region</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {(data.orders || []).map((order) => (
                <tr key={order.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{order.customerName}</div>
                    <div className="text-slate-500 dark:text-slate-400">{order.date}{order.notes ? ` • ${order.notes}` : ''}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{order.region || '—'}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-white/10 dark:text-slate-300">{order.status}</span></td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{currency.format(order.amount)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(order.id); setForm({ customerName: order.customerName, amount: String(order.amount), status: order.status, date: order.date, region: order.region || 'North America', notes: order.notes || '' }); }} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Edit</button>
                      <button onClick={() => onDelete(order.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function HRView({
  employees,
  onAdd,
  onUpdate,
  onDelete,
}: {
  employees: Employee[];
  onAdd: (payload: Omit<Employee, 'id'>) => Promise<void>;
  onUpdate: (id: string, payload: Partial<Employee>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: '', email: '', department: 'Operations', role: 'Manager', salary: '0', status: 'active' as Employee['status'], title: '' });

  const reset = () => {
    setEditingId(null);
    setForm({ name: '', email: '', department: 'Operations', role: 'Manager', salary: '0', status: 'active', title: '' });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { name: form.name, email: form.email, department: form.department, role: form.role, salary: Number(form.salary), status: form.status, title: form.title || form.role };
    if (editingId) await onUpdate(editingId, payload);
    else await onAdd(payload as Omit<Employee, 'id'>);
    reset();
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">People operations</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Manage employees, departments, status, and salary in one place.</p>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Employee name" required />
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Email" required />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Department" />
            <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Role" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} type="number" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Salary" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Employee['status'] })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="active">Active</option>
              <option value="leave">Leave</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Job title" />
          <div className="flex gap-3">
            <button className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">{editingId ? 'Update employee' : 'Add employee'}</button>
            {editingId ? <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-4 font-medium text-slate-700 dark:border-white/10 dark:text-slate-200">Cancel</button> : null}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="xl:col-span-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Employee</th>
                <th className="px-5 py-4 font-semibold">Department</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Salary</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {employees.map((employee) => (
                <tr key={employee.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{employee.name}</div>
                    <div className="text-slate-500 dark:text-slate-400">{employee.email} • {employee.title || employee.role}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{employee.department}</td>
                  <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 dark:bg-white/10 dark:text-slate-300">{employee.status}</span></td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{currency.format(employee.salary)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(employee.id); setForm({ name: employee.name, email: employee.email, department: employee.department, role: employee.role, salary: String(employee.salary), status: employee.status, title: employee.title || '' }); }} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Edit</button>
                      <button onClick={() => onDelete(employee.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function FinanceView({
  data,
  derived,
  onAdd,
  onUpdate,
  onDelete,
}: {
  data: AnalyticsData;
  derived: ReturnType<typeof useERPData>['derived'];
  onAdd: (payload: Omit<TransactionItem, 'id'>) => Promise<void>;
  onUpdate: (id: string, payload: Partial<TransactionItem>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ type: 'income' as TransactionItem['type'], amount: '0', category: 'Subscription', date: new Date().toISOString().split('T')[0], note: '', status: 'posted' as TransactionItem['status'] });

  const reset = () => {
    setEditingId(null);
    setForm({ type: 'income', amount: '0', category: 'Subscription', date: new Date().toISOString().split('T')[0], note: '', status: 'posted' });
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const payload = { type: form.type, amount: Number(form.amount), category: form.category, date: form.date, note: form.note, status: form.status };
    if (editingId) await onUpdate(editingId, payload);
    else await onAdd(payload as Omit<TransactionItem, 'id'>);
    reset();
  };

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <div className="xl:col-span-4"><MetricCard title="Income" value={currency.format(derived?.income || 0)} sub="Tracked across finance transactions" icon={<DollarSign size={20} />} tone="green" /></div>
      <div className="xl:col-span-4"><MetricCard title="Expenses" value={currency.format(derived?.expenses || 0)} sub="Operating cost load" icon={<CreditCard size={20} />} tone="amber" /></div>
      <div className="xl:col-span-4"><MetricCard title="Net cash flow" value={currency.format(derived?.netCashFlow || 0)} sub="Income minus expenses" icon={<LineChart size={20} />} tone="purple" /></div>

      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Transaction editor</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Post, update, or remove finance records from the ERP workspace.</p>
        <form className="mt-5 space-y-3" onSubmit={submit}>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as TransactionItem['type'] })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <input value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} type="number" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Amount" />
          </div>
          <input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Category" />
          <div className="grid grid-cols-2 gap-3">
            <input value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} type="date" className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as TransactionItem['status'] })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="posted">Posted</option>
              <option value="draft">Draft</option>
            </select>
          </div>
          <textarea value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} className="h-24 w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Note" />
          <div className="flex gap-3">
            <button className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">{editingId ? 'Update transaction' : 'Add transaction'}</button>
            {editingId ? <button type="button" onClick={reset} className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 px-4 font-medium text-slate-700 dark:border-white/10 dark:text-slate-200">Cancel</button> : null}
          </div>
        </form>
      </GlassCard>

      <GlassCard className="xl:col-span-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Transaction</th>
                <th className="px-5 py-4 font-semibold">Type</th>
                <th className="px-5 py-4 font-semibold">Category</th>
                <th className="px-5 py-4 font-semibold">Date</th>
                <th className="px-5 py-4 font-semibold">Amount</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {(data.transactions || []).map((transaction) => (
                <tr key={transaction.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5">
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{transaction.note || transaction.id}</td>
                  <td className="px-5 py-4 text-slate-600 dark:text-slate-300">{transaction.type}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{transaction.category}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{transaction.date}</td>
                  <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{currency.format(transaction.amount)}</td>
                  <td className="px-5 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditingId(transaction.id); setForm({ type: transaction.type, amount: String(transaction.amount), category: transaction.category, date: transaction.date, note: transaction.note || '', status: transaction.status || 'posted' }); }} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Edit</button>
                      <button onClick={() => onDelete(transaction.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}


function VendorsView({ vendors, canEditModule, onAdd, onUpdate, onDelete }: { vendors: VendorItem[]; canEditModule: boolean; onAdd: (payload: Omit<VendorItem, 'id'>) => Promise<void>; onUpdate: (id: string, payload: Partial<VendorItem>) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
  const [form, setForm] = useState({ name: '', email: '', category: 'General', rating: '4.5', status: 'active', region: 'North America', spend: '0' });
  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Vendor registry</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Track supplier quality, region coverage, and spend to support large-scale operations.</p>
        <div className="mt-5 space-y-3">
          <input disabled={!canEditModule} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Vendor name" />
          <input disabled={!canEditModule} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Vendor email" />
          <div className="grid grid-cols-2 gap-3">
            <input disabled={!canEditModule} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Category" />
            <input disabled={!canEditModule} value={form.region} onChange={(e) => setForm({ ...form, region: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Region" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <input disabled={!canEditModule} value={form.rating} type="number" onChange={(e) => setForm({ ...form, rating: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Rating" />
            <input disabled={!canEditModule} value={form.spend} type="number" onChange={(e) => setForm({ ...form, spend: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Spend" />
            <select disabled={!canEditModule} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="active">Active</option><option value="onboarding">Onboarding</option><option value="blocked">Blocked</option></select>
          </div>
          <button disabled={!canEditModule || !form.name.trim()} onClick={async () => { await onAdd({ name: form.name, email: form.email, category: form.category, rating: Number(form.rating), status: form.status as VendorItem['status'], region: form.region, spend: Number(form.spend) }); setForm({ name: '', email: '', category: 'General', rating: '4.5', status: 'active', region: 'North America', spend: '0' }); }} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white disabled:opacity-60">{canEditModule ? 'Add vendor' : 'Read only access'}</button>
        </div>
      </GlassCard>
      <GlassCard className="xl:col-span-8 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400"><tr><th className="px-5 py-4 font-semibold">Vendor</th><th className="px-5 py-4 font-semibold">Category</th><th className="px-5 py-4 font-semibold">Region</th><th className="px-5 py-4 font-semibold">Spend</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">{vendors.map((vendor) => (<tr key={vendor.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5"><td className="px-5 py-4"><div className="font-medium text-slate-900 dark:text-white">{vendor.name}</div><div className="text-slate-500 dark:text-slate-400">{vendor.email || '—'} • rating {vendor.rating || 0}</div></td><td className="px-5 py-4 text-slate-500 dark:text-slate-400">{vendor.category}</td><td className="px-5 py-4 text-slate-500 dark:text-slate-400">{vendor.region}</td><td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{compactCurrency.format(vendor.spend || 0)}</td><td className="px-5 py-4"><div className="flex gap-2">{canEditModule ? <button onClick={() => onUpdate(vendor.id, { status: vendor.status === 'active' ? 'blocked' : 'active' })} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Toggle</button> : null}{canEditModule ? <button onClick={() => onDelete(vendor.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button> : <span className="text-slate-400">View only</span>}</div></td></tr>))}</tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function ProcurementView({ items, vendors, canEditModule, onAdd, onUpdate, onDelete }: { items: ProcurementRequest[]; vendors: VendorItem[]; canEditModule: boolean; onAdd: (payload: Omit<ProcurementRequest, 'id'>) => Promise<void>; onUpdate: (id: string, payload: Partial<ProcurementRequest>) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
  const [form, setForm] = useState({ title: '', vendorId: '', amount: '0', priority: 'medium', status: 'requested', requestedBy: '', date: new Date().toISOString().split('T')[0] });
  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Procurement control tower</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Create purchasing requests, manage priority, and convert operational needs into traceable spend.</p>
        <div className="mt-5 space-y-3">
          <input disabled={!canEditModule} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Request title" />
          <select disabled={!canEditModule} value={form.vendorId} onChange={(e) => setForm({ ...form, vendorId: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="">Select vendor</option>{vendors.map((vendor) => <option key={vendor.id} value={vendor.id}>{vendor.name}</option>)}</select>
          <div className="grid grid-cols-2 gap-3"><input disabled={!canEditModule} value={form.amount} type="number" onChange={(e) => setForm({ ...form, amount: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Amount" /><select disabled={!canEditModule} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
          <button disabled={!canEditModule || !form.title.trim()} onClick={async () => { const vendor = vendors.find((item) => item.id === form.vendorId); await onAdd({ title: form.title, vendorId: form.vendorId, vendorName: vendor?.name || 'Unassigned vendor', amount: Number(form.amount), priority: form.priority as ProcurementRequest['priority'], status: form.status as ProcurementRequest['status'], requestedBy: form.requestedBy || 'Operations', date: form.date }); setForm({ title: '', vendorId: '', amount: '0', priority: 'medium', status: 'requested', requestedBy: '', date: new Date().toISOString().split('T')[0] }); }} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white disabled:opacity-60">{canEditModule ? 'Create request' : 'Read only access'}</button>
        </div>
      </GlassCard>
      <GlassCard className="xl:col-span-8 overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400"><tr><th className="px-5 py-4 font-semibold">Request</th><th className="px-5 py-4 font-semibold">Vendor</th><th className="px-5 py-4 font-semibold">Priority</th><th className="px-5 py-4 font-semibold">Amount</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-200/70 dark:divide-white/10">{items.map((item) => (<tr key={item.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5"><td className="px-5 py-4"><div className="font-medium text-slate-900 dark:text-white">{item.title}</div><div className="text-slate-500 dark:text-slate-400">{item.status} • {item.date}</div></td><td className="px-5 py-4 text-slate-500 dark:text-slate-400">{item.vendorName}</td><td className="px-5 py-4 text-slate-500 dark:text-slate-400">{item.priority}</td><td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{compactCurrency.format(item.amount || 0)}</td><td className="px-5 py-4"><div className="flex gap-2">{canEditModule ? <button onClick={() => onUpdate(item.id, { status: item.status === 'approved' ? 'ordered' : 'approved' })} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Advance</button> : null}{canEditModule ? <button onClick={() => onDelete(item.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button> : <span className="text-slate-400">View only</span>}</div></td></tr>))}</tbody></table></div></GlassCard>
    </div>
  );
}

function ProjectsView({ projects, canEditModule, onAdd, onUpdate, onDelete }: { projects: ProjectItem[]; canEditModule: boolean; onAdd: (payload: Omit<ProjectItem, 'id'>) => Promise<void>; onUpdate: (id: string, payload: Partial<ProjectItem>) => Promise<void>; onDelete: (id: string) => Promise<void>; }) {
  const [form, setForm] = useState({ name: '', owner: '', budget: '0', progress: '0', status: 'planning', dueDate: '', health: 'healthy' });
  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Portfolio and delivery</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Run large-scale operations with project health, budget ownership, and progress tracking in one place.</p>
        <div className="mt-5 space-y-3">
          <input disabled={!canEditModule} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Project name" />
          <div className="grid grid-cols-2 gap-3"><input disabled={!canEditModule} value={form.owner} onChange={(e) => setForm({ ...form, owner: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Owner" /><input disabled={!canEditModule} value={form.budget} type="number" onChange={(e) => setForm({ ...form, budget: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Budget" /></div>
          <div className="grid grid-cols-3 gap-3"><input disabled={!canEditModule} value={form.progress} type="number" onChange={(e) => setForm({ ...form, progress: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Progress" /><select disabled={!canEditModule} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="planning">Planning</option><option value="active">Active</option><option value="blocked">Blocked</option><option value="completed">Completed</option></select><select disabled={!canEditModule} value={form.health} onChange={(e) => setForm({ ...form, health: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"><option value="healthy">Healthy</option><option value="risk">Risk</option><option value="critical">Critical</option></select></div>
          <button disabled={!canEditModule || !form.name.trim()} onClick={async () => { await onAdd({ name: form.name, owner: form.owner || 'Unassigned', budget: Number(form.budget), progress: Number(form.progress), status: form.status as ProjectItem['status'], dueDate: form.dueDate, health: form.health as ProjectItem['health'] }); setForm({ name: '', owner: '', budget: '0', progress: '0', status: 'planning', dueDate: '', health: 'healthy' }); }} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white disabled:opacity-60">{canEditModule ? 'Create project' : 'Read only access'}</button>
        </div>
      </GlassCard>
      <GlassCard className="xl:col-span-8 overflow-hidden"><div className="overflow-x-auto"><table className="min-w-full text-left text-sm"><thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400"><tr><th className="px-5 py-4 font-semibold">Project</th><th className="px-5 py-4 font-semibold">Owner</th><th className="px-5 py-4 font-semibold">Progress</th><th className="px-5 py-4 font-semibold">Budget</th><th className="px-5 py-4 font-semibold">Actions</th></tr></thead><tbody className="divide-y divide-slate-200/70 dark:divide-white/10">{projects.map((project) => (<tr key={project.id} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5"><td className="px-5 py-4"><div className="font-medium text-slate-900 dark:text-white">{project.name}</div><div className="text-slate-500 dark:text-slate-400">{project.status} • {project.health}</div></td><td className="px-5 py-4 text-slate-500 dark:text-slate-400">{project.owner}</td><td className="px-5 py-4 text-slate-500 dark:text-slate-400">{project.progress}%</td><td className="px-5 py-4 font-medium text-slate-900 dark:text-white">{compactCurrency.format(project.budget || 0)}</td><td className="px-5 py-4"><div className="flex gap-2">{canEditModule ? <button onClick={() => onUpdate(project.id, { progress: Math.min(100, (project.progress || 0) + 10), status: (project.progress || 0) >= 90 ? 'completed' : project.status })} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">+10%</button> : null}{canEditModule ? <button onClick={() => onDelete(project.id)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Delete</button> : <span className="text-slate-400">View only</span>}</div></td></tr>))}</tbody></table></div></GlassCard>
    </div>
  );
}

function AdminView({
  data,
  workspace,
  user,
  onInviteMember,
  onUpdateMember,
  onRemoveMember,
  onSaveWorkspace,
  onSaveSettings,
  onNavigate,
}: {
  data: AnalyticsData;
  workspace: WorkspaceInfo | null;
  user: User;
  onInviteMember: (payload: { email: string; name?: string; role?: WorkspaceMember['role']; title?: string }) => Promise<void>;
  onUpdateMember: (memberUserId: string, payload: { role?: WorkspaceMember['role']; title?: string }) => Promise<void>;
  onRemoveMember: (memberUserId: string) => Promise<void>;
  onSaveWorkspace: (payload: { name?: string }) => Promise<void>;
  onSaveSettings: (payload: Partial<NonNullable<AnalyticsData['settings']>>) => Promise<void>;
  onNavigate: (view: PremiumViewState) => void;
}) {
  const [workspaceName, setWorkspaceName] = useState(workspace?.name || data.settings?.workspaceName || 'Workspace');
  const [invite, setInvite] = useState({ email: '', name: '', role: 'member' as WorkspaceMember['role'], title: 'Operator' });
  const [settingsForm, setSettingsForm] = useState({
    notifications: data.settings?.notifications ?? true,
    accent: data.settings?.accent || 'violet',
  });

  useEffect(() => {
    setWorkspaceName(workspace?.name || data.settings?.workspaceName || 'Workspace');
  }, [workspace?.name, data.settings?.workspaceName]);

  useEffect(() => {
    setSettingsForm({ notifications: data.settings?.notifications ?? true, accent: data.settings?.accent || 'violet' });
  }, [data.settings]);

  return (
    <div className="grid gap-4 p-4 sm:p-6 xl:grid-cols-12">
      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Workspace controls</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">This is where teams are actually enabled. Everyone in the workspace shares the same live ERP data.</p>
        <div className="mt-5 space-y-3">
          <input value={workspaceName} onChange={(e) => setWorkspaceName(e.target.value)} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Workspace name" />
          <button onClick={() => onSaveWorkspace({ name: workspaceName })} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">Save workspace</button>
        </div>
        <div className="mt-6 grid gap-3">
          <button onClick={() => onNavigate('CUSTOMERS')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">Go to CRM</button>
          <button onClick={() => onNavigate('ORDERS')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">Go to Orders</button>
          <button onClick={() => onNavigate('FINANCE')} className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-medium text-slate-900 dark:border-white/10 dark:bg-white/5 dark:text-white">Go to Finance</button>
        </div>
      </GlassCard>

      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Invite teammate</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Add an existing user by email or create a new invited teammate in this shared workspace.</p>
        <div className="mt-5 space-y-3">
          <input value={invite.email} onChange={(e) => setInvite({ ...invite, email: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Email" />
          <input value={invite.name} onChange={(e) => setInvite({ ...invite, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Name" />
          <div className="grid grid-cols-2 gap-3">
            <select value={invite.role} onChange={(e) => setInvite({ ...invite, role: e.target.value as WorkspaceMember['role'] })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
              <option value="admin">Admin</option>
              <option value="manager">Manager</option>
              <option value="member">Member</option>
              <option value="viewer">Viewer</option>
            </select>
            <input value={invite.title} onChange={(e) => setInvite({ ...invite, title: e.target.value })} className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Title" />
          </div>
          <button onClick={async () => { await onInviteMember(invite); setInvite({ email: '', name: '', role: 'member', title: 'Operator' }); }} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 font-medium text-white dark:bg-white dark:text-slate-900">Add teammate</button>
        </div>
      </GlassCard>

      <GlassCard className="xl:col-span-4 p-5">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Admin settings</p>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Adjust workspace-wide settings that affect how the whole team works.</p>
        <div className="mt-5 space-y-3">
          <label className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm dark:border-white/10 dark:bg-white/5 dark:text-white">
            <span>Notifications</span>
            <input type="checkbox" checked={settingsForm.notifications} onChange={(e) => setSettingsForm({ ...settingsForm, notifications: e.target.checked })} />
          </label>
          <input value={settingsForm.accent} onChange={(e) => setSettingsForm({ ...settingsForm, accent: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" placeholder="Accent" />
          <button onClick={() => onSaveSettings(settingsForm)} className="inline-flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-violet-500 to-fuchsia-500 font-medium text-white">Save admin settings</button>
        </div>
      </GlassCard>

      <GlassCard className="xl:col-span-12 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-500 dark:bg-white/5 dark:text-slate-400">
              <tr>
                <th className="px-5 py-4 font-semibold">Team member</th>
                <th className="px-5 py-4 font-semibold">Role</th>
                <th className="px-5 py-4 font-semibold">Title</th>
                <th className="px-5 py-4 font-semibold">Joined</th>
                <th className="px-5 py-4 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-white/10">
              {(workspace?.members || []).map((member) => (
                <tr key={member.userId} className="transition hover:bg-slate-50/90 dark:hover:bg-white/5">
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-900 dark:text-white">{member.name}</div>
                    <div className="text-slate-500 dark:text-slate-400">{member.email}</div>
                  </td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{member.role}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{member.title || '—'}</td>
                  <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{member.joinedAt}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-2">
                      <button onClick={() => onUpdateMember(member.userId, { role: member.role === 'member' ? 'manager' : 'member' })} className="rounded-2xl border border-slate-200 px-3 py-2 text-slate-700 dark:border-white/10 dark:text-slate-200">Toggle role</button>
                      {member.userId !== user.id ? <button onClick={() => onRemoveMember(member.userId)} className="rounded-2xl bg-rose-500/10 px-3 py-2 text-rose-600 dark:text-rose-300">Remove</button> : <span className="rounded-2xl bg-emerald-500/10 px-3 py-2 text-emerald-600 dark:text-emerald-300">You</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GlassCard>
    </div>
  );
}

function ProfileView({ user, onSave }: { user: User; onSave: (payload: { name: string; bio: string; role: string }) => Promise<void>; }) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ name: user.name, bio: user.bio || '', role: user.role || '' });

  useEffect(() => {
    setForm({ name: user.name, bio: user.bio || '', role: user.role || '' });
  }, [user]);

  return (
    <div className="flex justify-center p-4 sm:p-6">
      <GlassCard className="w-full max-w-3xl overflow-hidden">
        <div className="h-36 bg-[radial-gradient(circle_at_top_left,_rgba(139,92,246,0.85),_transparent_26%),linear-gradient(135deg,#4f46e5,#7c3aed_55%,#111827)]" />
        <div className="px-6 pb-6 pt-0 sm:px-8">
          <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex items-end gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-[28px] border-4 border-white bg-gradient-to-br from-violet-500 to-fuchsia-500 text-3xl font-semibold text-white shadow-xl">{user.name[0]}</div>
              <div className="pb-2">
                <h2 className="text-3xl font-semibold text-slate-900 dark:text-white">{user.name}</h2>
                <p className="text-slate-500 dark:text-slate-400">{user.role}</p>
              </div>
            </div>
            <button onClick={async () => { if (editing) await onSave(form); setEditing((prev) => !prev); }} className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 font-medium text-white dark:bg-white dark:text-slate-900">
              {editing ? 'Save changes' : 'Edit profile'}
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Name</p>
              {editing ? <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-white/5 dark:text-white" /> : <div className="rounded-2xl bg-slate-50 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200">{user.name}</div>}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Role</p>
              {editing ? <input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 dark:border-white/10 dark:bg-white/5 dark:text-white" /> : <div className="rounded-2xl bg-slate-50 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200">{user.role}</div>}
            </div>
            <div className="md:col-span-2">
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Bio</p>
              {editing ? <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} className="h-32 w-full rounded-2xl border border-slate-200 bg-white p-4 dark:border-white/10 dark:bg-white/5 dark:text-white" /> : <div className="rounded-2xl bg-slate-50 p-4 text-slate-700 dark:bg-white/5 dark:text-slate-200">{user.bio}</div>}
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function SettingsView({ theme, toggleTheme, apiKey, setApiKey }: { theme: Theme; toggleTheme: () => void; apiKey: string; setApiKey: (key: string) => void; }) {
  return (
    <div className="flex justify-center p-4 sm:p-6">
      <GlassCard className="w-full max-w-2xl p-6">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Settings</p>
        <div className="mt-6 space-y-6">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4 dark:bg-white/5">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Appearance</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Current theme: {theme}</p>
            </div>
            <button onClick={toggleTheme} className={cn('relative h-8 w-16 rounded-full transition', theme === 'dark' ? 'bg-violet-500' : 'bg-slate-300')}>
              <span className={cn('absolute top-1 h-6 w-6 rounded-full bg-white transition', theme === 'dark' ? 'left-9' : 'left-1')} />
            </button>
          </div>
          <div>
            <p className="mb-2 font-medium text-slate-900 dark:text-white">OpenAI API key</p>
            <input value={apiKey} onChange={(e) => { setApiKey(e.target.value); localStorage.setItem('vantage_openai_key', e.target.value); }} type="password" placeholder="sk-..." className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Used for richer AI summaries. The assistant still has a frontend fallback when AI is unavailable.</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

function ImmersiveView({ data }: { data: AnalyticsData }) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mountRef.current) return undefined;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x050816);
    scene.fog = new THREE.Fog(0x050816, 12, 44);

    const camera = new THREE.PerspectiveCamera(72, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 8, 22);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mountRef.current.appendChild(renderer.domElement);

    const ambient = new THREE.AmbientLight(0xffffff, 0.45);
    scene.add(ambient);

    const keyLight = new THREE.PointLight(0x7c3aed, 2.1, 60);
    keyLight.position.set(8, 12, 12);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x0ea5e9, 1.8, 60);
    fillLight.position.set(-10, 8, -6);
    scene.add(fillLight);

    scene.add(new THREE.GridHelper(48, 48, 0x7c3aed, 0x1e293b));

    const metrics = [
      { name: 'Revenue', value: Math.max(...data.analytics.revenue.history, 10), color: 0x7c3aed, x: -8 },
      { name: 'Users', value: Math.max(Math.round(data.analytics.users.active / 50), 10), color: 0x0ea5e9, x: -2.5 },
      { name: 'Orders', value: Math.max((data.orders || []).length * 4, 6), color: 0x22c55e, x: 3 },
      { name: 'Inventory', value: Math.max((data.inventory || []).reduce((sum, item) => sum + item.stock, 0) / 10, 8), color: 0xf59e0b, x: 8.5 },
    ];

    const towers: Array<{ mesh: THREE.Mesh; baseY: number; label: string }> = [];
    metrics.forEach((metric) => {
      const height = Math.max(metric.value * 0.12, 1.6);
      const geometry = new THREE.BoxGeometry(2.2, height, 2.2);
      const material = new THREE.MeshStandardMaterial({ color: metric.color, emissive: metric.color, emissiveIntensity: 0.24, roughness: 0.25, metalness: 0.8 });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(metric.x, height / 2, 0);
      scene.add(mesh);
      const edges = new THREE.LineSegments(new THREE.EdgesGeometry(geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.35 }));
      mesh.add(edges);
      towers.push({ mesh, baseY: height / 2, label: metric.name });
    });

    const resize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    window.addEventListener('resize', resize);

    let frame = 0;
    const animate = () => {
      frame += 1;
      const time = frame * 0.008;
      towers.forEach((tower, index) => {
        tower.mesh.rotation.y = Math.sin(time + index * 0.4) * 0.12;
        tower.mesh.position.y = tower.baseY + Math.sin(time * 1.8 + index) * 0.16;
      });
      camera.position.x = Math.sin(time * 0.35) * 15;
      camera.position.z = Math.cos(time * 0.35) * 16;
      camera.lookAt(0, 3.4, 0);
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) mountRef.current.removeChild(renderer.domElement);
    };
  }, [data]);

  return (
    <div className="relative h-[calc(100vh-80px)] overflow-hidden bg-slate-950">
      <div className="absolute left-4 top-4 z-10 max-w-sm rounded-[28px] border border-white/10 bg-slate-950/70 p-5 text-white backdrop-blur-xl">
        <p className="text-xs uppercase tracking-[0.24em] text-violet-300">Immersive analytics</p>
        <h3 className="mt-2 text-2xl font-semibold">Operational skyline</h3>
        <p className="mt-3 text-sm text-slate-300">Each tower now represents a real business dimension instead of a purely decorative effect: revenue, users, orders, and inventory.</p>
      </div>
      <div ref={mountRef} className="h-full w-full" />
    </div>
  );
}

export default function Vantage() {
  const [view, setView] = useState<PremiumViewState>('AUTH');
  const [theme, setTheme] = useState<Theme>('dark');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantAnswer, setAssistantAnswer] = useState('');
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantContextUsed, setAssistantContextUsed] = useState<string[]>([]);
  const [workspace, setWorkspace] = useState<WorkspaceInfo | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem('vantage_theme') as Theme | null;
    const savedKey = localStorage.getItem('vantage_openai_key');
    if (savedTheme) setTheme(savedTheme);
    if (savedKey) setApiKey(savedKey);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('vantage_theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme((prev) => prev === 'light' ? 'dark' : 'light');

  const { data, notifications, permissions, loading: dataLoading, error: dataError, actions, derived, refresh } = useERPData(user?.id);

  useEffect(() => {
    if (!user) {
      setWorkspace(null);
      return;
    }
    erpApi.getWorkspace(user.id).then(setWorkspace).catch(() => setWorkspace(null));
  }, [user, data?.settings?.workspaceName]);

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setAuthError('');
    try {
      const response = isLogin
        ? await authApi.login(email, password)
        : await authApi.signup(email, password, 'New User');
      setUser(response.user);
      setWorkspace(null);
      setView('DASHBOARD');
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!user || !searchQuery.trim()) return;
    try {
      const result = await erpApi.search(user.id, searchQuery);
      const counts = Object.entries(result)
        .filter(([, value]) => Array.isArray(value))
        .map(([key, value]) => `${key}: ${(value as unknown[]).length}`)
        .join(' • ');
      setAssistantAnswer(`Search results for “${searchQuery}”\n\n${counts || 'No matches found.'}`);
      setAssistantContextUsed(Object.keys(result).filter((key) => Array.isArray(result[key] as unknown)));
      setAssistantOpen(true);
    } catch (error) {
      setAssistantAnswer(error instanceof Error ? error.message : 'Search failed.');
      setAssistantOpen(true);
    }
  };

  const runAssistant = async () => {
    if (!assistantQuestion.trim()) return;
    setAssistantLoading(true);
    try {
      let result: AIJoinResponse | null = null;
      if (user) {
        try {
          result = await erpApi.askContextAI(user.id, assistantQuestion, apiKey, view);
        } catch {
          result = null;
        }
      }
      if (result) {
        setAssistantAnswer(result.answer);
        setAssistantContextUsed(result.contextUsed || []);
      } else {
        setAssistantAnswer(frontendJoinAssistant(assistantQuestion, data || null, view));
        setAssistantContextUsed(['frontend-fallback', view]);
      }
    } finally {
      setAssistantLoading(false);
    }
  };

  const contentTitle = useMemo(() => {
    const titles: Record<PremiumViewState, string> = {
      AUTH: 'Authentication',
      DASHBOARD: 'Overview',
      ANALYTICS: 'Analytics',
      REPORTS: 'Reports',
      CUSTOMERS: 'CRM',
      SETTINGS: 'Settings',
      PROFILE: 'Profile',
      IMMERSIVE: 'Immersive analytics',
      INVENTORY: 'Inventory',
      ORDERS: 'Orders',
      HR: 'HR / Employees',
      FINANCE: 'Finance',
      VENDORS: 'Vendors',
      PROCUREMENT: 'Procurement',
      PROJECTS: 'Projects',
      ADMIN: 'Admin settings',
    };
    return titles[view];
  }, [view]);

  if (view === 'AUTH') {
    return (
      <AuthView
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleLogin={handleLogin}
        loading={loading}
        authError={authError}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-[#050816] dark:text-white">
      <Sidebar view={view} setView={setView} user={user} permissions={permissions} collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        {view !== 'IMMERSIVE' ? (
          <Topbar
            theme={theme}
            toggleTheme={toggleTheme}
            title={contentTitle}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onSearch={handleSearch}
            onOpenAI={() => setAssistantOpen(true)}
            notifications={notifications}
            onReadNotification={(id) => actions.markNotificationRead(id)}
            workspaceName={workspace?.name || data?.settings?.workspaceName}
            memberCount={workspace?.memberCount || workspace?.members?.length || 1}
          />
        ) : null}

        {dataError ? (
          <div className="m-6 rounded-[28px] border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">{dataError}</div>
        ) : null}

        {dataLoading && !data && view !== 'IMMERSIVE' ? (
          <div className="m-6 rounded-[28px] border border-slate-200/70 bg-white/80 p-5 text-sm text-slate-500 shadow-sm backdrop-blur dark:border-white/10 dark:bg-white/5 dark:text-slate-400">Loading ERP workspace…</div>
        ) : null}

        {data && view === 'DASHBOARD' ? <DashboardView data={data} theme={theme} derived={derived} onNavigate={setView} workspace={workspace} /> : null}
        {data && view === 'ANALYTICS' ? <AnalyticsView data={data} theme={theme} derived={derived} onSaveAnalytics={actions.updateAnalytics} /> : null}
        {data && view === 'REPORTS' ? <ReportsView data={data} theme={theme} apiKey={apiKey} createReport={actions.createReport} /> : null}
        {data && view === 'CUSTOMERS' ? <CustomersView customers={data.customers} onAdd={actions.addCustomer} onUpdate={actions.updateCustomer} onDelete={actions.deleteCustomer} /> : null}
        {data && view === 'INVENTORY' ? <InventoryView inventory={data.inventory || []} onAdd={actions.addInventory} onUpdate={actions.updateInventory} onDelete={actions.deleteInventory} /> : null}
        {data && view === 'ORDERS' ? <OrdersView data={data} onAdd={actions.addOrder} onUpdate={actions.updateOrder} onDelete={actions.deleteOrder} /> : null}
        {data && view === 'HR' ? <HRView employees={data.employees || []} onAdd={actions.addEmployee} onUpdate={actions.updateEmployee} onDelete={actions.deleteEmployee} /> : null}
        {data && view === 'FINANCE' ? <FinanceView data={data} derived={derived} onAdd={actions.addTransaction} onUpdate={actions.updateTransaction} onDelete={actions.deleteTransaction} /> : null}
        {data && view === 'VENDORS' ? <VendorsView vendors={data.vendors || []} canEditModule={canAccess(permissions?.vendors, 'edit')} onAdd={actions.addVendor} onUpdate={actions.updateVendor} onDelete={actions.deleteVendor} /> : null}
        {data && view === 'PROCUREMENT' ? <ProcurementView items={data.procurement || []} vendors={data.vendors || []} canEditModule={canAccess(permissions?.procurement, 'edit')} onAdd={actions.addProcurement} onUpdate={actions.updateProcurement} onDelete={actions.deleteProcurement} /> : null}
        {data && view === 'PROJECTS' ? <ProjectsView projects={data.projects || []} canEditModule={canAccess(permissions?.projects, 'edit')} onAdd={actions.addProject} onUpdate={actions.updateProject} onDelete={actions.deleteProject} /> : null}
        {data && view === 'ADMIN' && user ? <AdminView data={data} workspace={workspace} user={user} onInviteMember={async (payload) => { if (!user) return; const next = await erpApi.addWorkspaceMember(user.id, payload); setWorkspace(next); await refresh(); }} onUpdateMember={async (memberUserId, payload) => { if (!user) return; const next = await erpApi.updateWorkspaceMember(user.id, memberUserId, payload); setWorkspace(next); }} onRemoveMember={async (memberUserId) => { if (!user) return; const next = await erpApi.removeWorkspaceMember(user.id, memberUserId); setWorkspace(next); }} onSaveWorkspace={async (payload) => { if (!user) return; const next = await erpApi.updateWorkspace(user.id, payload); setWorkspace(next); if (payload.name) await actions.updateSettings({ workspaceName: payload.name }); }} onSaveSettings={actions.updateSettings} onNavigate={setView} /> : null}
        {user && view === 'PROFILE' ? <ProfileView user={user} onSave={async (payload) => { const updated = await authApi.updateProfile({ userId: user.id, ...payload }); setUser(updated); }} /> : null}
        {view === 'SETTINGS' ? <SettingsView theme={theme} toggleTheme={toggleTheme} apiKey={apiKey} setApiKey={setApiKey} /> : null}
        {data && view === 'IMMERSIVE' ? <ImmersiveView data={data} /> : null}
      </div>

      <AIAssistantDrawer
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        question={assistantQuestion}
        setQuestion={setAssistantQuestion}
        answer={assistantAnswer}
        loading={assistantLoading}
        onSubmit={runAssistant}
        currentView={view}
        contextUsed={assistantContextUsed}
      />
    </div>
  );
}
