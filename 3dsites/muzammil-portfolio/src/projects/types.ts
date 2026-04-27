export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role?: string;
  bio?: string;
  workspaceId?: string;
  teamRole?: WorkspaceRole;
}

export type WorkspaceRole = 'owner' | 'admin' | 'manager' | 'member' | 'viewer';

export interface RolePermissions {
  workspaceAdmin: boolean;
  crm: 'none' | 'view' | 'edit';
  inventory: 'none' | 'view' | 'edit';
  orders: 'none' | 'view' | 'edit';
  hr: 'none' | 'view' | 'edit';
  finance: 'none' | 'view' | 'edit';
  analytics: 'none' | 'view' | 'edit';
  reports: 'none' | 'view' | 'edit';
  vendors: 'none' | 'view' | 'edit';
  procurement: 'none' | 'view' | 'edit';
  projects: 'none' | 'view' | 'edit';
}

export interface WorkspaceMember {
  userId: string;
  name: string;
  email: string;
  role: WorkspaceRole;
  title?: string;
  joinedAt: string;
  status?: 'active' | 'invited';
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  ownerUserId: string;
  memberCount: number;
  members: WorkspaceMember[];
}

export interface RevenueAnalytics {
  total: number;
  growth: number | string;
  history: number[];
}

export interface UserAnalytics {
  active: number;
  growth: number | string;
  distribution: {
    mobile: number;
    desktop: number;
  };
}

export interface RegionMetric {
  name: string;
  value: number;
}

export interface AnalyticsMeta {
  deviceDefinitions?: {
    mobile: string;
    desktop: string;
  };
  deviceCounts?: {
    mobile: number;
    desktop: number;
  };
  lastUpdated?: string;
}

export interface ReportItem {
  id: string;
  name: string;
  date: string;
  type: string;
  status: string;
  relatedCustomerIds?: string[];
  totalValue?: number;
}

export interface Customer {
  id: string;
  name: string;
  email: string;
  ltv: number;
  region?: string;
  segment?: string;
  company?: string;
  status?: 'active' | 'at-risk' | 'new';
  ownerId?: string;
  notes?: string;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  stock: number;
  reorderLevel: number;
  price: number;
  supplier?: string;
  status?: 'healthy' | 'low' | 'critical';
  location?: string;
}

export interface OrderItem {
  id: string;
  customerId?: string;
  customerName: string;
  amount: number;
  status: 'pending' | 'processing' | 'fulfilled' | 'cancelled';
  date: string;
  region?: string;
  ownerId?: string;
  notes?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  role: string;
  salary: number;
  status: 'active' | 'leave' | 'inactive';
  title?: string;
}

export interface TransactionItem {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string;
  note?: string;
  status?: 'posted' | 'draft';
}


export interface VendorItem {
  id: string;
  name: string;
  email?: string;
  category?: string;
  rating?: number;
  status?: 'active' | 'onboarding' | 'blocked';
  region?: string;
  spend?: number;
}

export interface ProcurementRequest {
  id: string;
  title: string;
  vendorId?: string;
  vendorName?: string;
  amount: number;
  priority?: 'low' | 'medium' | 'high';
  status?: 'draft' | 'requested' | 'approved' | 'ordered';
  requestedBy?: string;
  date: string;
}

export interface ProjectItem {
  id: string;
  name: string;
  owner?: string;
  budget: number;
  progress: number;
  status?: 'planning' | 'active' | 'blocked' | 'completed';
  dueDate?: string;
  health?: 'healthy' | 'risk' | 'critical';
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  level: 'info' | 'success' | 'warning' | 'critical';
  read: boolean;
  date: string;
}

export interface AdminSettings {
  theme: 'light' | 'dark';
  notifications: boolean;
  compactSidebar?: boolean;
  accent?: string;
  workspaceName?: string;
}

export interface AnalyticsData {
  analytics: {
    revenue: RevenueAnalytics;
    users: UserAnalytics;
    regions: RegionMetric[];
    meta?: AnalyticsMeta;
  };
  reports: ReportItem[];
  customers: Customer[];
  inventory?: InventoryItem[];
  orders?: OrderItem[];
  employees?: Employee[];
  transactions?: TransactionItem[];
  vendors?: VendorItem[];
  procurement?: ProcurementRequest[];
  projects?: ProjectItem[];
  notifications?: NotificationItem[];
  settings?: AdminSettings;
}

export type LegacyViewState =
  | 'AUTH'
  | 'DASHBOARD'
  | 'ANALYTICS'
  | 'REPORTS'
  | 'CUSTOMERS'
  | 'SETTINGS'
  | 'PROFILE'
  | 'IMMERSIVE';

export type PremiumViewState =
  | LegacyViewState
  | 'INVENTORY'
  | 'ORDERS'
  | 'HR'
  | 'FINANCE'
  | 'ADMIN'
  | 'VENDORS'
  | 'PROCUREMENT'
  | 'PROJECTS';

export type Theme = 'light' | 'dark';

export interface AuthResponse {
  user: User;
  data: AnalyticsData;
}

export interface AIJoinResponse {
  answer: string;
  contextUsed: string[];
  structured: Record<string, unknown>;
}
