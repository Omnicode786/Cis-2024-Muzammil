import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiCache, erpApi } from '../services/api';
import type {
  AnalyticsData,
  Customer,
  Employee,
  InventoryItem,
  NotificationItem,
  OrderItem,
  TransactionItem,
  VendorItem,
  ProcurementRequest,
  ProjectItem,
  RolePermissions,
} from '../types';

interface ERPState {
  data: AnalyticsData | null;
  notifications: NotificationItem[];
  permissions: RolePermissions | null;
  loading: boolean;
  error: string;
}

function normalizeData(data: AnalyticsData): AnalyticsData {
  const active = Number(data.analytics.users.active || 0);
  const mobilePct = Number(data.analytics.users.distribution.mobile || 0);
  const desktopPct = Number(data.analytics.users.distribution.desktop || 0);
  return {
    ...data,
    analytics: {
      ...data.analytics,
      meta: {
        deviceDefinitions: {
          mobile: 'Mobile users are active users whose latest tracked session came from a phone or mobile app.',
          desktop: 'Desktop users are active users whose latest tracked session came from a desktop or laptop browser.',
        },
        deviceCounts: {
          mobile: Math.round((active * mobilePct) / 100),
          desktop: Math.round((active * desktopPct) / 100),
        },
        ...(data.analytics.meta || {}),
      },
    },
    inventory: data.inventory || [],
    orders: data.orders || [],
    employees: data.employees || [],
    transactions: data.transactions || [],
    vendors: data.vendors || [],
    procurement: data.procurement || [],
    projects: data.projects || [],
    notifications: data.notifications || [],
    settings: data.settings || { theme: 'dark', notifications: true },
  };
}

export function useERPData(userId?: string) {
  const [state, setState] = useState<ERPState>({
    data: null,
    notifications: [],
    permissions: null,
    loading: false,
    error: '',
  });

  const refresh = useCallback(async () => {
    if (!userId) return;
    setState((prev) => ({ ...prev, loading: true, error: '' }));
    try {
      const [data, notifications, permissions] = await Promise.all([
        erpApi.getUserData(userId),
        erpApi.getNotifications(userId).catch(() => []),
        erpApi.getWorkspacePermissions(userId).catch(() => null),
      ]);
      setState({ data: normalizeData(data), notifications, permissions, loading: false, error: '' });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unable to load ERP data',
      }));
    }
  }, [userId]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const mergeData = useCallback((updater: (current: AnalyticsData) => AnalyticsData) => {
    setState((prev) => {
      if (!prev.data) return prev;
      const next = normalizeData(updater(prev.data));
      if (userId) apiCache.set(`user-data:${userId}`, next, 15_000);
      return { ...prev, data: next };
    });
  }, [userId]);

  const actions = useMemo(() => ({
    async addCustomer(payload: Pick<Customer, 'name' | 'email' | 'ltv'> & Partial<Customer>) {
      if (!userId) return;
      const created = await erpApi.addCustomer(userId, payload);
      mergeData((current) => ({ ...current, customers: [created, ...current.customers] }));
      await refresh();
    },
    async updateCustomer(customerId: string, payload: Partial<Customer>) {
      if (!userId) return;
      const updated = await erpApi.updateCustomer(userId, customerId, payload);
      mergeData((current) => ({ ...current, customers: current.customers.map((item) => item.id === customerId ? updated : item) }));
      await refresh();
    },
    async deleteCustomer(customerId: string) {
      if (!userId) return;
      await erpApi.deleteCustomer(userId, customerId);
      mergeData((current) => ({ ...current, customers: current.customers.filter((item) => item.id !== customerId) }));
      await refresh();
    },

    async addInventory(payload: Omit<InventoryItem, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addInventory(userId, payload);
      mergeData((current) => ({ ...current, inventory: [created, ...(current.inventory || [])] }));
      await refresh();
    },
    async updateInventory(itemId: string, payload: Partial<InventoryItem>) {
      if (!userId) return;
      const updated = await erpApi.updateInventory(userId, itemId, payload);
      mergeData((current) => ({ ...current, inventory: (current.inventory || []).map((item) => item.id === itemId ? updated : item) }));
      await refresh();
    },
    async deleteInventory(itemId: string) {
      if (!userId) return;
      await erpApi.deleteInventory(userId, itemId);
      mergeData((current) => ({ ...current, inventory: (current.inventory || []).filter((item) => item.id !== itemId) }));
      await refresh();
    },

    async addOrder(payload: Omit<OrderItem, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addOrder(userId, payload);
      mergeData((current) => ({ ...current, orders: [created, ...(current.orders || [])] }));
      await refresh();
    },
    async updateOrder(orderId: string, payload: Partial<OrderItem>) {
      if (!userId) return;
      const updated = await erpApi.updateOrder(userId, orderId, payload);
      mergeData((current) => ({ ...current, orders: (current.orders || []).map((item) => item.id === orderId ? updated : item) }));
      await refresh();
    },
    async deleteOrder(orderId: string) {
      if (!userId) return;
      await erpApi.deleteOrder(userId, orderId);
      mergeData((current) => ({ ...current, orders: (current.orders || []).filter((item) => item.id !== orderId) }));
      await refresh();
    },

    async addEmployee(payload: Omit<Employee, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addEmployee(userId, payload);
      mergeData((current) => ({ ...current, employees: [created, ...(current.employees || [])] }));
      await refresh();
    },
    async updateEmployee(employeeId: string, payload: Partial<Employee>) {
      if (!userId) return;
      const updated = await erpApi.updateEmployee(userId, employeeId, payload);
      mergeData((current) => ({ ...current, employees: (current.employees || []).map((item) => item.id === employeeId ? updated : item) }));
      await refresh();
    },
    async deleteEmployee(employeeId: string) {
      if (!userId) return;
      await erpApi.deleteEmployee(userId, employeeId);
      mergeData((current) => ({ ...current, employees: (current.employees || []).filter((item) => item.id !== employeeId) }));
      await refresh();
    },

    async addTransaction(payload: Omit<TransactionItem, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addTransaction(userId, payload);
      mergeData((current) => ({ ...current, transactions: [created, ...(current.transactions || [])] }));
      await refresh();
    },
    async updateTransaction(transactionId: string, payload: Partial<TransactionItem>) {
      if (!userId) return;
      const updated = await erpApi.updateTransaction(userId, transactionId, payload);
      mergeData((current) => ({ ...current, transactions: (current.transactions || []).map((item) => item.id === transactionId ? updated : item) }));
      await refresh();
    },
    async deleteTransaction(transactionId: string) {
      if (!userId) return;
      await erpApi.deleteTransaction(userId, transactionId);
      mergeData((current) => ({ ...current, transactions: (current.transactions || []).filter((item) => item.id !== transactionId) }));
      await refresh();
    },



    async addVendor(payload: Omit<VendorItem, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addVendor(userId, payload);
      mergeData((current) => ({ ...current, vendors: [created, ...(current.vendors || [])] }));
      await refresh();
    },
    async updateVendor(vendorId: string, payload: Partial<VendorItem>) {
      if (!userId) return;
      const updated = await erpApi.updateVendor(userId, vendorId, payload);
      mergeData((current) => ({ ...current, vendors: (current.vendors || []).map((item) => item.id === vendorId ? updated : item) }));
      await refresh();
    },
    async deleteVendor(vendorId: string) {
      if (!userId) return;
      await erpApi.deleteVendor(userId, vendorId);
      mergeData((current) => ({ ...current, vendors: (current.vendors || []).filter((item) => item.id !== vendorId) }));
      await refresh();
    },

    async addProcurement(payload: Omit<ProcurementRequest, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addProcurement(userId, payload);
      mergeData((current) => ({ ...current, procurement: [created, ...(current.procurement || [])] }));
      await refresh();
    },
    async updateProcurement(procurementId: string, payload: Partial<ProcurementRequest>) {
      if (!userId) return;
      const updated = await erpApi.updateProcurement(userId, procurementId, payload);
      mergeData((current) => ({ ...current, procurement: (current.procurement || []).map((item) => item.id === procurementId ? updated : item) }));
      await refresh();
    },
    async deleteProcurement(procurementId: string) {
      if (!userId) return;
      await erpApi.deleteProcurement(userId, procurementId);
      mergeData((current) => ({ ...current, procurement: (current.procurement || []).filter((item) => item.id !== procurementId) }));
      await refresh();
    },

    async addProject(payload: Omit<ProjectItem, 'id'>) {
      if (!userId) return;
      const created = await erpApi.addProject(userId, payload);
      mergeData((current) => ({ ...current, projects: [created, ...(current.projects || [])] }));
      await refresh();
    },
    async updateProject(projectId: string, payload: Partial<ProjectItem>) {
      if (!userId) return;
      const updated = await erpApi.updateProject(userId, projectId, payload);
      mergeData((current) => ({ ...current, projects: (current.projects || []).map((item) => item.id === projectId ? updated : item) }));
      await refresh();
    },
    async deleteProject(projectId: string) {
      if (!userId) return;
      await erpApi.deleteProject(userId, projectId);
      mergeData((current) => ({ ...current, projects: (current.projects || []).filter((item) => item.id !== projectId) }));
      await refresh();
    },

    async updateAnalytics(payload: Partial<AnalyticsData['analytics']>) {
      if (!userId) return;
      const analytics = await erpApi.updateAnalytics(userId, payload);
      mergeData((current) => ({ ...current, analytics: { ...current.analytics, ...analytics } }));
      await refresh();
    },
    async updateSettings(payload: Partial<NonNullable<AnalyticsData['settings']>>) {
      if (!userId) return;
      const settings = await erpApi.updateSettings(userId, payload);
      mergeData((current) => ({ ...current, settings: { ...(current.settings || {}), ...(settings || {}) } }));
      await refresh();
    },

    async createReport(type: string) {
      if (!userId) return;
      const created = await erpApi.createReport(userId, type);
      mergeData((current) => ({ ...current, reports: [created, ...current.reports] }));
      await refresh();
    },
    async markNotificationRead(notificationId: string) {
      if (!userId) return;
      await erpApi.markNotificationRead(userId, notificationId);
      setState((prev) => ({ ...prev, notifications: prev.notifications.map((item) => item.id === notificationId ? { ...item, read: true } : item) }));
    },
  }), [mergeData, refresh, userId]);

  const derived = useMemo(() => {
    const data = state.data;
    if (!data) return null;

    const revenueHistory = data.analytics.revenue.history;
    const latestRevenueBucket = revenueHistory[revenueHistory.length - 1] || 0;
    const previousRevenueBucket = revenueHistory[revenueHistory.length - 2] || 0;
    const revenueMomentum = latestRevenueBucket - previousRevenueBucket;
    const lowStockItems = (data.inventory || []).filter((item) => item.stock <= item.reorderLevel);
    const pendingOrders = (data.orders || []).filter((order) => order.status === 'pending' || order.status === 'processing');
    const totalPayroll = (data.employees || []).reduce((sum, employee) => sum + employee.salary, 0);
    const income = (data.transactions || []).filter((item) => item.type === 'income').reduce((sum, item) => sum + item.amount, 0);
    const expenses = (data.transactions || []).filter((item) => item.type === 'expense').reduce((sum, item) => sum + item.amount, 0);
    const netCashFlow = income - expenses;
    const deviceCounts = data.analytics.meta?.deviceCounts || {
      mobile: Math.round((Number(data.analytics.users.active || 0) * Number(data.analytics.users.distribution.mobile || 0)) / 100),
      desktop: Math.round((Number(data.analytics.users.active || 0) * Number(data.analytics.users.distribution.desktop || 0)) / 100),
    };

    return {
      revenueMomentum,
      lowStockItems,
      pendingOrders,
      totalPayroll,
      income,
      expenses,
      netCashFlow,
      deviceCounts,
    };
  }, [state.data]);

  return {
    ...state,
    refresh,
    actions,
    derived,
  };
}
