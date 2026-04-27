import type {
  AIJoinResponse,
  AnalyticsData,
  AuthResponse,
  Customer,
  Employee,
  InventoryItem,
  NotificationItem,
  OrderItem,
  ReportItem,
  TransactionItem,
  User,
  WorkspaceInfo,
  WorkspaceMember,
  RolePermissions,
  VendorItem,
  ProcurementRequest,
  ProjectItem,
} from '../types';

const API_BASE = 'http://localhost:3001';

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

const memoryCache = new Map<string, CacheEntry<unknown>>();

export const apiCache = {
  get<T>(key: string): T | null {
    const item = memoryCache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return item.data as T;
  },
  set<T>(key: string, data: T, ttlMs = 30_000) {
    memoryCache.set(key, { data, expiresAt: Date.now() + ttlMs });
  },
  invalidate(prefix: string) {
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  },
};

async function request<T>(path: string, init?: RequestInit, cacheKey?: string, ttlMs?: number): Promise<T> {
  if (cacheKey) {
    const cached = apiCache.get<T>(cacheKey);
    if (cached) return cached;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
    ...init,
  });

  const json = await res.json();
  if (!res.ok) throw new Error(json?.error || `Request failed for ${path}`);

  if (cacheKey) apiCache.set(cacheKey, json as T, ttlMs);
  return json as T;
}

export const authApi = {
  login(email: string, password: string) {
    return request<AuthResponse>('/api/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  },
  signup(email: string, password: string, name: string) {
    return request<AuthResponse>('/api/signup', { method: 'POST', body: JSON.stringify({ email, password, name }) });
  },
  updateProfile(payload: { userId: string; name: string; bio: string; role: string }) {
    return request<User>('/api/user', { method: 'PUT', body: JSON.stringify(payload) });
  },
};

export const erpApi = {
  getUserData(userId: string) {
    return request<AnalyticsData>(`/api/user/data/${userId}`, undefined, `user-data:${userId}`, 15_000);
  },
  getNotifications(userId: string) {
    return request<NotificationItem[]>(`/api/notifications/${userId}`, undefined, `notifications:${userId}`, 10_000);
  },
  markNotificationRead(userId: string, notificationId: string) {
    return request<{ success: boolean }>('/api/notifications/read', { method: 'POST', body: JSON.stringify({ userId, notificationId }) });
  },
  search(userId: string, query: string) {
    return request<Record<string, unknown>>(`/api/erp/search?userId=${userId}&query=${encodeURIComponent(query)}`);
  },
  askContextAI(userId: string, question: string, apiKey?: string, currentModule?: string) {
    return request<AIJoinResponse>('/api/ai/context-query', { method: 'POST', body: JSON.stringify({ userId, question, apiKey, currentModule }) });
  },
  createReport(userId: string, type: string) {
    return request<ReportItem>('/api/reports/create', { method: 'POST', body: JSON.stringify({ userId, type }) });
  },

  addCustomer(userId: string, payload: Pick<Customer, 'name' | 'email' | 'ltv'> & Partial<Customer>) {
    return request<Customer>('/api/customers/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateCustomer(userId: string, customerId: string, payload: Partial<Customer>) {
    return request<Customer>(`/api/customers/${userId}/${customerId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteCustomer(userId: string, customerId: string) {
    return request<{ success: boolean }>(`/api/customers/${userId}/${customerId}`, { method: 'DELETE' });
  },

  listInventory(userId: string) {
    return request<InventoryItem[]>(`/api/inventory/${userId}`, undefined, `inventory:${userId}`, 20_000);
  },
  addInventory(userId: string, payload: Omit<InventoryItem, 'id'>) {
    return request<InventoryItem>('/api/inventory/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateInventory(userId: string, itemId: string, payload: Partial<InventoryItem>) {
    return request<InventoryItem>(`/api/inventory/${userId}/${itemId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteInventory(userId: string, itemId: string) {
    return request<{ success: boolean }>(`/api/inventory/${userId}/${itemId}`, { method: 'DELETE' });
  },

  listOrders(userId: string) {
    return request<OrderItem[]>(`/api/orders/${userId}`, undefined, `orders:${userId}`, 20_000);
  },
  addOrder(userId: string, payload: Omit<OrderItem, 'id'>) {
    return request<OrderItem>('/api/orders/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateOrder(userId: string, orderId: string, payload: Partial<OrderItem>) {
    return request<OrderItem>(`/api/orders/${userId}/${orderId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteOrder(userId: string, orderId: string) {
    return request<{ success: boolean }>(`/api/orders/${userId}/${orderId}`, { method: 'DELETE' });
  },

  listEmployees(userId: string) {
    return request<Employee[]>(`/api/employees/${userId}`, undefined, `employees:${userId}`, 20_000);
  },
  addEmployee(userId: string, payload: Omit<Employee, 'id'>) {
    return request<Employee>('/api/employees/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateEmployee(userId: string, employeeId: string, payload: Partial<Employee>) {
    return request<Employee>(`/api/employees/${userId}/${employeeId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteEmployee(userId: string, employeeId: string) {
    return request<{ success: boolean }>(`/api/employees/${userId}/${employeeId}`, { method: 'DELETE' });
  },

  listTransactions(userId: string) {
    return request<TransactionItem[]>(`/api/transactions/${userId}`, undefined, `transactions:${userId}`, 20_000);
  },
  addTransaction(userId: string, payload: Omit<TransactionItem, 'id'>) {
    return request<TransactionItem>('/api/transactions/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateTransaction(userId: string, transactionId: string, payload: Partial<TransactionItem>) {
    return request<TransactionItem>(`/api/transactions/${userId}/${transactionId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteTransaction(userId: string, transactionId: string) {
    return request<{ success: boolean }>(`/api/transactions/${userId}/${transactionId}`, { method: 'DELETE' });
  },

  updateAnalytics(userId: string, payload: Partial<AnalyticsData['analytics']>) {
    return request<AnalyticsData['analytics']>(`/api/analytics/${userId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  updateSettings(userId: string, payload: Partial<NonNullable<AnalyticsData['settings']>>) {
    return request<AnalyticsData['settings']>(`/api/settings/${userId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },

  getWorkspace(userId: string) {
    return request<WorkspaceInfo>(`/api/workspace/${userId}`, undefined, `workspace:${userId}`, 10_000);
  },
  updateWorkspace(userId: string, payload: { name?: string }) {
    return request<WorkspaceInfo>('/api/workspace/update', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  addWorkspaceMember(userId: string, payload: { email: string; name?: string; role?: WorkspaceMember['role']; title?: string }) {
    return request<WorkspaceInfo>('/api/workspace/team/add-member', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateWorkspaceMember(userId: string, memberUserId: string, payload: { role?: WorkspaceMember['role']; title?: string }) {
    return request<WorkspaceInfo>(`/api/workspace/team/member/${memberUserId}`, { method: 'PUT', body: JSON.stringify({ userId, ...payload }) });
  },
  removeWorkspaceMember(userId: string, memberUserId: string) {
    return request<WorkspaceInfo>(`/api/workspace/team/member/${memberUserId}`, { method: 'DELETE', body: JSON.stringify({ userId }) });
  },

  getWorkspacePermissions(userId: string) {
    return request<RolePermissions>(`/api/workspace/permissions/${userId}`, undefined, `workspace-permissions:${userId}`, 20_000);
  },
  listVendors(userId: string) {
    return request<VendorItem[]>(`/api/vendors/${userId}`, undefined, `vendors:${userId}`, 20_000);
  },
  addVendor(userId: string, payload: Omit<VendorItem, 'id'>) {
    return request<VendorItem>('/api/vendors/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateVendor(userId: string, vendorId: string, payload: Partial<VendorItem>) {
    return request<VendorItem>(`/api/vendors/${userId}/${vendorId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteVendor(userId: string, vendorId: string) {
    return request<{ success: boolean }>(`/api/vendors/${userId}/${vendorId}`, { method: 'DELETE' });
  },
  listProcurement(userId: string) {
    return request<ProcurementRequest[]>(`/api/procurement/${userId}`, undefined, `procurement:${userId}`, 20_000);
  },
  addProcurement(userId: string, payload: Omit<ProcurementRequest, 'id'>) {
    return request<ProcurementRequest>('/api/procurement/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateProcurement(userId: string, procurementId: string, payload: Partial<ProcurementRequest>) {
    return request<ProcurementRequest>(`/api/procurement/${userId}/${procurementId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteProcurement(userId: string, procurementId: string) {
    return request<{ success: boolean }>(`/api/procurement/${userId}/${procurementId}`, { method: 'DELETE' });
  },
  listProjects(userId: string) {
    return request<ProjectItem[]>(`/api/projects/${userId}`, undefined, `projects:${userId}`, 20_000);
  },
  addProject(userId: string, payload: Omit<ProjectItem, 'id'>) {
    return request<ProjectItem>('/api/projects/add', { method: 'POST', body: JSON.stringify({ userId, ...payload }) });
  },
  updateProject(userId: string, projectId: string, payload: Partial<ProjectItem>) {
    return request<ProjectItem>(`/api/projects/${userId}/${projectId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  deleteProject(userId: string, projectId: string) {
    return request<{ success: boolean }>(`/api/projects/${userId}/${projectId}`, { method: 'DELETE' });
  },
};
