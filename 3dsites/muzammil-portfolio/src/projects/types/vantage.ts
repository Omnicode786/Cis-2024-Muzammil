
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  bio?: string;
}

export interface AnalyticsData {
  analytics: {
    revenue: { total: number; growth: number | string; history: number[] };
    users: {
      active: number;
      growth: number | string;
      distribution: { mobile: number; desktop: number };
    };
    regions: { name: string; value: number }[];
  };
  reports: ReportItem[];
  customers: CustomerItem[];
}

export interface ReportItem {
  id: string;
  name: string;
  date: string;
  type: string;
  status: string;
}

export interface CustomerItem {
  id: string;
  name: string;
  email: string;
  ltv: number;
  company?: string;
  region?: string;
  segment?: string;
  status?: 'Active' | 'At Risk' | 'New' | 'Dormant';
  owner?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  unitPrice: number;
  supplier?: string;
  status?: 'healthy' | 'low' | 'out';
}

export interface OrderItem {
  id: string;
  customerId?: string;
  customerName: string;
  amount: number;
  items: number;
  status: 'Pending' | 'Paid' | 'Processing' | 'Fulfilled' | 'Cancelled';
  region?: string;
  createdAt: string;
  salesRep?: string;
}

export interface EmployeeItem {
  id: string;
  name: string;
  role: string;
  department: string;
  email: string;
  status: 'Active' | 'Leave' | 'Probation';
  performanceScore: number;
}

export interface TransactionItem {
  id: string;
  type: 'Income' | 'Expense';
  title: string;
  amount: number;
  createdAt: string;
  category: string;
  status: 'Cleared' | 'Pending';
  linkedOrderId?: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  severity: 'info' | 'success' | 'warning' | 'critical';
  createdAt: string;
  read: boolean;
}

export interface AdminSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  compactSidebar?: boolean;
  aiEnabled?: boolean;
  companyName?: string;
}

export interface AdminSummary {
  roleMatrix: string[];
  auditTrailEnabled: boolean;
  approvalFlow: boolean;
}

export interface ERPWorkspaceData extends AnalyticsData {
  inventory?: InventoryItem[];
  orders?: OrderItem[];
  employees?: EmployeeItem[];
  transactions?: TransactionItem[];
  notifications?: NotificationItem[];
  admin?: AdminSummary;
  settings?: AdminSettings;
}

export type CoreViewState =
  | 'AUTH'
  | 'DASHBOARD'
  | 'ANALYTICS'
  | 'REPORTS'
  | 'CUSTOMERS'
  | 'SETTINGS'
  | 'PROFILE'
  | 'IMMERSIVE';

export type ViewState =
  | CoreViewState
  | 'INVENTORY'
  | 'ORDERS'
  | 'HR'
  | 'FINANCE'
  | 'NOTIFICATIONS'
  | 'ADMIN';

export interface AuthResponse {
  user: User;
  data: ERPWorkspaceData;
}

export interface AIContextResponse {
  module: ViewState;
  summary: string;
  highlights: string[];
  joinedInsights: string[];
  metrics: {
    topRegionByRevenue: string;
    topCustomerByLtv: string;
    lowStockCount: number;
    openOrders: number;
    pendingTransactions: number;
  };
}
