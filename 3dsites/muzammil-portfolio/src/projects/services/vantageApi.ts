
import type {
  AIContextResponse,
  AuthResponse,
  CustomerItem,
  EmployeeItem,
  ERPWorkspaceData,
  InventoryItem,
  NotificationItem,
  OrderItem,
  ReportItem,
  TransactionItem,
  User,
} from '../types/vantage';

const API_BASE = 'http://localhost:3001';
const cache = new Map<string, { expiry: number; value: unknown }>();
const DEFAULT_TTL = 20_000;

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const data = await response.json();
      if (data?.error) message = data.error;
    } catch {
      // ignore body parse failures
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

async function cachedRequest<T>(key: string, path: string, ttl = DEFAULT_TTL): Promise<T> {
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && hit.expiry > now) {
    return hit.value as T;
  }
  const value = await request<T>(path);
  cache.set(key, { value, expiry: now + ttl });
  return value;
}

export const vantageApi = {
  login(email: string, password: string) {
    return request<AuthResponse>('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  signup(email: string, password: string, name: string) {
    return request<AuthResponse>('/api/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
  },

  updateUser(userId: string, payload: Partial<User> & { userId: string }) {
    return request<User>('/api/user', {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  fetchWorkspace(userId: string, fresh = false) {
    const key = `workspace:${userId}`;
    if (fresh) cache.delete(key);
    return cachedRequest<ERPWorkspaceData>(key, `/api/user-data/${userId}`);
  },

  refreshWorkspace(userId: string) {
    return this.fetchWorkspace(userId, true);
  },

  createReport(userId: string, type = 'FINANCIAL') {
    return request<ReportItem>('/api/reports/create', {
      method: 'POST',
      body: JSON.stringify({ userId, type }),
    });
  },

  addCustomer(userId: string, payload: Omit<CustomerItem, 'id' | 'ltv'> & { ltv: number | string }) {
    return request<CustomerItem>('/api/customers/add', {
      method: 'POST',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  updateCustomer(userId: string, customerId: string, payload: Partial<CustomerItem>) {
    return request<CustomerItem>(`/api/customers/${customerId}`, {
      method: 'PUT',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  deleteCustomer(userId: string, customerId: string) {
    return request<{ success: true }>(`/api/customers/${customerId}?userId=${encodeURIComponent(userId)}`, {
      method: 'DELETE',
    });
  },

  fetchInventory(userId: string) {
    return cachedRequest<InventoryItem[]>(`inventory:${userId}`, `/api/inventory/${userId}`);
  },

  createInventoryItem(userId: string, payload: Omit<InventoryItem, 'id' | 'status'>) {
    return request<InventoryItem>('/api/inventory/add', {
      method: 'POST',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  updateInventoryItem(userId: string, itemId: string, payload: Partial<InventoryItem>) {
    return request<InventoryItem>(`/api/inventory/${itemId}`, {
      method: 'PUT',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  fetchOrders(userId: string) {
    return cachedRequest<OrderItem[]>(`orders:${userId}`, `/api/orders/${userId}`);
  },

  createOrder(userId: string, payload: Omit<OrderItem, 'id' | 'createdAt'>) {
    return request<OrderItem>('/api/orders/create', {
      method: 'POST',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  fetchEmployees(userId: string) {
    return cachedRequest<EmployeeItem[]>(`employees:${userId}`, `/api/employees/${userId}`);
  },

  createEmployee(userId: string, payload: Omit<EmployeeItem, 'id'>) {
    return request<EmployeeItem>('/api/employees/add', {
      method: 'POST',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  fetchTransactions(userId: string) {
    return cachedRequest<TransactionItem[]>(`transactions:${userId}`, `/api/transactions/${userId}`);
  },

  createTransaction(userId: string, payload: Omit<TransactionItem, 'id'>) {
    return request<TransactionItem>('/api/transactions/add', {
      method: 'POST',
      body: JSON.stringify({ userId, ...payload }),
    });
  },

  fetchNotifications(userId: string) {
    return cachedRequest<NotificationItem[]>(`notifications:${userId}`, `/api/notifications/${userId}`);
  },

  markNotificationRead(userId: string, notificationId: string) {
    return request<NotificationItem>(`/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      body: JSON.stringify({ userId }),
    });
  },

  updateSettings(userId: string, settings: Record<string, unknown>) {
    return request<ERPWorkspaceData['settings']>('/api/settings', {
      method: 'PUT',
      body: JSON.stringify({ userId, settings }),
    });
  },

  generateAI(apiKey: string, prompt: string) {
    return request<{ result: string }>('/api/ai/generate', {
      method: 'POST',
      body: JSON.stringify({ apiKey, prompt }),
    });
  },

  fetchAIContext(userId: string, module: string) {
    return request<AIContextResponse>(`/api/ai/context/${userId}?module=${encodeURIComponent(module)}`);
  },

  askAssistant(userId: string, module: string, question: string, apiKey?: string) {
    return request<{ answer: string; context: AIContextResponse }>('/api/ai/assistant', {
      method: 'POST',
      body: JSON.stringify({ userId, module, question, apiKey }),
    });
  },
};
