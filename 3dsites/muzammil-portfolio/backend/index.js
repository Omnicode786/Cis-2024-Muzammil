import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;
const DB_PATH = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

const today = () => new Date().toISOString().split('T')[0];
const safeId = (prefix) => `${prefix}${Date.now()}${Math.floor(Math.random() * 1000)}`;
const number = (value) => (typeof value === 'number' ? value : Number(value) || 0);

const readDB = async () => {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return { users: [], userData: {}, workspaces: [] };
  }
};

const writeDB = async (data) => {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2));
};

const inferInventoryStatus = (stock, reorderLevel) => {
  if (stock <= Math.max(1, reorderLevel * 0.5)) return 'critical';
  if (stock <= reorderLevel) return 'low';
  return 'healthy';
};

const defaultWorkspaceRole = 'owner';

const seedCustomers = () => [
  { id: 'c1', name: 'Acme Corp', email: 'contact@acme.com', ltv: 54000, region: 'North America', segment: 'Enterprise', company: 'Acme Corp', status: 'active', ownerId: 'user_seed' },
  { id: 'c2', name: 'Stark Industries', email: 'tony@stark.com', ltv: 125000, region: 'Europe', segment: 'Strategic', company: 'Stark Industries', status: 'active', ownerId: 'user_seed' },
  { id: 'c3', name: 'Nova Retail', email: 'ops@novaretail.com', ltv: 32000, region: 'Asia', segment: 'Growth', company: 'Nova Retail', status: 'new', ownerId: 'user_seed' },
];

const seedInventory = () => [
  { id: 'inv_1', sku: 'ERP-001', name: 'Cloud Workspace Seats', category: 'Software', stock: 42, reorderLevel: 12, price: 1200, supplier: 'Vantage Cloud', location: 'Digital', status: 'healthy' },
  { id: 'inv_2', sku: 'ERP-002', name: 'Analytics API Credits', category: 'Digital', stock: 14, reorderLevel: 18, price: 800, supplier: 'Open Usage', location: 'Region A', status: 'low' },
  { id: 'inv_3', sku: 'ERP-003', name: 'Report Render Capacity', category: 'Infrastructure', stock: 28, reorderLevel: 10, price: 950, supplier: 'Render Stack', location: 'Cloud', status: 'healthy' },
];

const seedOrders = (customers) => [
  { id: 'ord_1', customerId: customers[0]?.id, customerName: customers[0]?.name || 'Acme Corp', amount: 24000, status: 'fulfilled', date: '2026-04-08', region: customers[0]?.region || 'North America', ownerId: 'user_seed', notes: 'Annual renewal' },
  { id: 'ord_2', customerId: customers[1]?.id, customerName: customers[1]?.name || 'Stark Industries', amount: 18000, status: 'processing', date: '2026-04-11', region: customers[1]?.region || 'Europe', ownerId: 'user_seed', notes: 'Upgrade in progress' },
  { id: 'ord_3', customerId: customers[2]?.id, customerName: customers[2]?.name || 'Nova Retail', amount: 7200, status: 'pending', date: '2026-04-15', region: customers[2]?.region || 'Asia', ownerId: 'user_seed', notes: 'Awaiting approval' },
];

const seedEmployees = () => [
  { id: 'emp_1', name: 'Ava Reed', email: 'ava@vantage.ai', department: 'Finance', role: 'Finance Lead', salary: 8400, status: 'active', title: 'Lead Finance Manager' },
  { id: 'emp_2', name: 'Omar Khan', email: 'omar@vantage.ai', department: 'Operations', role: 'Ops Manager', salary: 7300, status: 'active', title: 'Operations Manager' },
  { id: 'emp_3', name: 'Lin Wu', email: 'lin@vantage.ai', department: 'People', role: 'HR Partner', salary: 6100, status: 'leave', title: 'HR Business Partner' },
];

const seedTransactions = () => [
  { id: 'txn_1', type: 'income', amount: 24000, category: 'Subscription', date: '2026-04-08', note: 'Acme annual plan', status: 'posted' },
  { id: 'txn_2', type: 'income', amount: 18000, category: 'Enterprise upgrade', date: '2026-04-11', note: 'Stark upgrade', status: 'posted' },
  { id: 'txn_3', type: 'expense', amount: 9500, category: 'Infrastructure', date: '2026-04-10', note: 'Compute and storage', status: 'posted' },
  { id: 'txn_4', type: 'expense', amount: 6200, category: 'Payroll', date: '2026-04-12', note: 'Payroll batch partial', status: 'posted' },
];

const seedVendors = () => [
  { id: 'ven_1', name: 'Northstar Supply', email: 'ops@northstar.com', category: 'Infrastructure', rating: 4.8, status: 'active', region: 'North America', spend: 82000 },
  { id: 'ven_2', name: 'Blue Orbit Systems', email: 'hello@blueorbit.com', category: 'Software', rating: 4.4, status: 'active', region: 'Europe', spend: 56000 },
  { id: 'ven_3', name: 'Atlas Industrial', email: 'team@atlasindustrial.com', category: 'Hardware', rating: 4.1, status: 'onboarding', region: 'Asia', spend: 24000 },
];

const seedProcurement = () => [
  { id: 'pr_1', title: 'Q2 analytics compute expansion', vendorId: 'ven_1', vendorName: 'Northstar Supply', amount: 18000, priority: 'high', status: 'approved', requestedBy: 'Ava Reed', date: '2026-04-10' },
  { id: 'pr_2', title: 'BI dashboard license renewal', vendorId: 'ven_2', vendorName: 'Blue Orbit Systems', amount: 9200, priority: 'medium', status: 'requested', requestedBy: 'Omar Khan', date: '2026-04-13' },
];

const seedProjects = () => [
  { id: 'proj_1', name: 'Global ERP rollout', owner: 'Omar Khan', budget: 125000, progress: 68, status: 'active', dueDate: '2026-06-20', health: 'healthy' },
  { id: 'proj_2', name: 'Finance automation phase 2', owner: 'Ava Reed', budget: 84000, progress: 42, status: 'active', dueDate: '2026-07-15', health: 'risk' },
  { id: 'proj_3', name: 'Vendor consolidation', owner: 'Lin Wu', budget: 36000, progress: 18, status: 'planning', dueDate: '2026-08-01', health: 'healthy' },
];

const seedNotifications = () => [
  { id: 'note_1', title: 'Inventory attention needed', body: 'Analytics API Credits dropped below reorder level.', level: 'warning', read: false, date: '2026-04-16' },
  { id: 'note_2', title: 'Revenue milestone reached', body: 'Monthly revenue crossed the operating benchmark.', level: 'success', read: false, date: '2026-04-15' },
  { id: 'note_3', title: 'Report ready', body: 'Financial executive PDF is available for download.', level: 'info', read: true, date: '2026-04-14' },
];

const baseAnalyticsMeta = {
  deviceDefinitions: {
    mobile: 'Mobile users are active users whose latest tracked session came from a phone browser or mobile app.',
    desktop: 'Desktop users are active users whose latest tracked session came from a desktop or laptop browser.',
  },
  lastUpdated: today(),
};

const generateInitialData = (userName, isAdmin = false) => {
  const customers = isAdmin ? seedCustomers() : [];
  return {
    analytics: {
      revenue: isAdmin ? { total: 366491, growth: 16.4, history: [112, 128, 141, 166, 218, 292, 366] } : { total: 0, growth: 0, history: [0, 0, 0, 0, 0, 0, 0] },
      users: isAdmin ? { active: 3353, growth: 7.7, distribution: { mobile: 54, desktop: 46 } } : { active: 0, growth: 0, distribution: { mobile: 0, desktop: 0 } },
      regions: isAdmin ? [{ name: 'North America', value: 42 }, { name: 'Europe', value: 31 }, { name: 'Asia', value: 27 }] : [{ name: 'North America', value: 0 }, { name: 'Europe', value: 0 }, { name: 'Asia', value: 0 }],
      meta: baseAnalyticsMeta,
    },
    reports: isAdmin ? [
      { id: 'r1', name: 'Q1 Financial Overview.pdf', date: '2026-04-10', type: 'FINANCE', status: 'READY', relatedCustomerIds: ['c1', 'c2'], totalValue: 142000 },
      { id: 'r2', name: 'User Growth Strategy.pdf', date: '2026-04-12', type: 'STRATEGY', status: 'READY', relatedCustomerIds: ['c3'], totalValue: 32000 },
    ] : [],
    customers,
    inventory: isAdmin ? seedInventory() : [],
    orders: isAdmin ? seedOrders(customers) : [],
    employees: isAdmin ? seedEmployees() : [],
    transactions: isAdmin ? seedTransactions() : [],
    vendors: isAdmin ? seedVendors() : [],
    procurement: isAdmin ? seedProcurement() : [],
    projects: isAdmin ? seedProjects() : [],
    notifications: isAdmin ? seedNotifications() : [],
    settings: { theme: 'dark', notifications: true, compactSidebar: false, accent: 'violet', workspaceName: `${userName}'s Workspace` },
  };
};

const ensureDataShape = (entry, userName = 'New User', isAdmin = false) => {
  const fallback = generateInitialData(userName, isAdmin);
  const next = entry || fallback;
  next.analytics = next.analytics || fallback.analytics;
  next.analytics.revenue = next.analytics.revenue || fallback.analytics.revenue;
  next.analytics.users = next.analytics.users || fallback.analytics.users;
  next.analytics.regions = next.analytics.regions || fallback.analytics.regions;
  next.analytics.meta = { ...baseAnalyticsMeta, ...(next.analytics.meta || {}) };
  next.reports = next.reports || [];
  next.customers = next.customers || [];
  next.inventory = next.inventory || [];
  next.orders = next.orders || [];
  next.employees = next.employees || [];
  next.transactions = next.transactions || [];
  next.vendors = next.vendors || [];
  next.procurement = next.procurement || [];
  next.projects = next.projects || [];
  next.notifications = next.notifications || [];
  next.settings = { theme: 'dark', notifications: true, compactSidebar: false, accent: 'violet', workspaceName: `${userName}'s Workspace`, ...(next.settings || {}) };
  return next;
};

const ensureWorkspaceRecord = (db, user) => {
  db.workspaces = db.workspaces || [];
  if (!user.workspaceId) user.workspaceId = user.id;
  if (!user.teamRole) user.teamRole = defaultWorkspaceRole;

  let workspace = db.workspaces.find((item) => item.id === user.workspaceId);
  if (!workspace) {
    workspace = {
      id: user.workspaceId,
      name: `${user.name}'s Workspace`,
      ownerUserId: user.id,
      members: [{ userId: user.id, name: user.name, email: user.email, role: user.teamRole || 'owner', title: user.role || 'Owner', joinedAt: today(), status: 'active' }],
    };
    db.workspaces.push(workspace);
  }

  const existingMember = workspace.members.find((member) => member.userId === user.id);
  if (!existingMember) {
    workspace.members.push({ userId: user.id, name: user.name, email: user.email, role: user.teamRole || 'member', title: user.role || 'Operator', joinedAt: today(), status: 'active' });
  }

  if (!db.userData[user.workspaceId] && db.userData[user.id]) {
    db.userData[user.workspaceId] = db.userData[user.id];
  }
  db.userData[user.workspaceId] = ensureDataShape(db.userData[user.workspaceId], workspace.name, user.role === 'Super Admin');
  db.userData[user.workspaceId].settings.workspaceName = workspace.name;
  return workspace;
};

const recalcAnalytics = (entry) => {
  entry = ensureDataShape(entry);
  const orders = entry.orders || [];
  const customers = entry.customers || [];
  const transactions = entry.transactions || [];

  const orderRevenue = orders.filter((item) => item.status !== 'cancelled').reduce((sum, item) => sum + number(item.amount), 0);
  const customerRevenue = customers.reduce((sum, item) => sum + number(item.ltv), 0);
  const income = transactions.filter((item) => item.type === 'income').reduce((sum, item) => sum + number(item.amount), 0);
  const expense = transactions.filter((item) => item.type === 'expense').reduce((sum, item) => sum + number(item.amount), 0);

  const revenue = Math.max(orderRevenue, customerRevenue, income, number(entry.analytics.revenue.total));
  entry.analytics.revenue.total = revenue;
  const history = Array.isArray(entry.analytics.revenue.history) ? entry.analytics.revenue.history.slice(-7) : [];
  while (history.length < 7) history.unshift(0);
  history[history.length - 1] = Math.round(revenue / 1000);
  entry.analytics.revenue.history = history;

  const prev = history[history.length - 2] || 0;
  const latest = history[history.length - 1] || 0;
  entry.analytics.revenue.growth = prev > 0 ? Number((((latest - prev) / prev) * 100).toFixed(1)) : number(entry.analytics.revenue.growth || 0);

  const activeUsers = Math.max(number(entry.analytics.users.active), customers.length * 17 + orders.length * 5 + 10 * (entry.employees || []).length);
  entry.analytics.users.active = activeUsers;
  entry.analytics.meta = entry.analytics.meta || { ...baseAnalyticsMeta };
  entry.analytics.meta.deviceCounts = {
    mobile: Math.round((activeUsers * number(entry.analytics.users.distribution.mobile || 0)) / 100),
    desktop: Math.round((activeUsers * number(entry.analytics.users.distribution.desktop || 0)) / 100),
  };
  entry.analytics.meta.lastUpdated = today();

  const weighted = { 'North America': 0, Europe: 0, Asia: 0 };
  customers.forEach((customer) => {
    const region = customer.region || 'North America';
    weighted[region] = (weighted[region] || 0) + Math.max(1, number(customer.ltv));
  });
  const totalRegionValue = Object.values(weighted).reduce((sum, value) => sum + value, 0);
  if (totalRegionValue > 0) {
    entry.analytics.regions = ['North America', 'Europe', 'Asia'].map((region) => ({ name: region, value: Math.round(((weighted[region] || 0) / totalRegionValue) * 100) }));
  }

  return { income, expense, netCashFlow: income - expense };
};

const contextSummary = (data, workspace) => {
  const lowStockItems = (data.inventory || []).filter((item) => item.stock <= item.reorderLevel);
  const openOrders = (data.orders || []).filter((item) => item.status === 'pending' || item.status === 'processing');
  const topCustomer = [...(data.customers || [])].sort((a, b) => number(b.ltv) - number(a.ltv))[0];
  const topRegion = [...(data.analytics.regions || [])].sort((a, b) => b.value - a.value)[0];
  const finance = recalcAnalytics(data);
  return {
    workspaceName: workspace?.name,
    memberCount: workspace?.members?.length || 1,
    lowStockItems: lowStockItems.slice(0, 5),
    lowStockCount: lowStockItems.length,
    openOrdersCount: openOrders.length,
    openOrders: openOrders.slice(0, 5),
    topCustomer,
    topRegion,
    topReport: data.reports?.[0] || null,
    income: finance.income,
    expense: finance.expense,
    netCashFlow: finance.netCashFlow,
  };
};

const chooseContexts = (question, currentModule) => {
  const text = `${question} ${currentModule || ''}`.toLowerCase();
  const contexts = new Set(['analytics']);
  if (text.includes('customer') || text.includes('crm')) contexts.add('customers');
  if (text.includes('report')) contexts.add('reports');
  if (text.includes('stock') || text.includes('inventory')) contexts.add('inventory');
  if (text.includes('order') || text.includes('sales')) contexts.add('orders');
  if (text.includes('employee') || text.includes('hr') || text.includes('team')) contexts.add('employees');
  if (text.includes('finance') || text.includes('cash') || text.includes('transaction') || text.includes('expense')) contexts.add('transactions');
  if (text.includes('member') || text.includes('workspace')) contexts.add('workspace');
  if (currentModule) contexts.add(String(currentModule).toLowerCase());
  return [...contexts];
};

const simulateJoinAnswer = (question, data, workspace, currentModule) => {
  const text = question.toLowerCase();
  const summary = contextSummary(data, workspace);
  if (text.includes('region') && text.includes('revenue')) {
    return `${summary.topRegion?.name || 'No region'} leads current regional revenue share at ${summary.topRegion?.value || 0}%. ${data.analytics.users.active.toLocaleString()} active users are tracked across the workspace, so this region is the strongest growth focus.`;
  }
  if (text.includes('customer') && (text.includes('highest sales') || text.includes('top customer') || text.includes('highest revenue'))) {
    return `${summary.topCustomer?.name || 'No customer'} is the strongest customer by LTV at $${number(summary.topCustomer?.ltv).toLocaleString()}. The latest report is ${summary.topReport?.name || 'not available'}, so that account should be highlighted in the next review.`;
  }
  if (text.includes('team') || text.includes('workspace') || text.includes('member')) {
    return `${summary.workspaceName || 'Current workspace'} has ${summary.memberCount} team member(s). Shared modules, reports, finance, and analytics all update in the same workspace so the team works on one source of truth.`;
  }
  if (text.includes('stock') || text.includes('inventory')) {
    return summary.lowStockCount ? `${summary.lowStockCount} inventory item(s) need attention, led by ${summary.lowStockItems.map((item) => item.name).join(', ')}.` : 'Inventory is healthy right now and no tracked item is below reorder level.';
  }
  if (text.includes('finance') || text.includes('cash') || text.includes('transaction')) {
    return `Tracked income is $${summary.income.toLocaleString()} and expenses are $${summary.expense.toLocaleString()}, leaving net cash flow at $${summary.netCashFlow.toLocaleString()}.`;
  }
  return `In ${currentModule || 'the ERP'}, revenue stands at $${number(data.analytics.revenue.total).toLocaleString()}, active users are ${data.analytics.users.active.toLocaleString()}, open orders are ${summary.openOrdersCount}, and low-stock inventory alerts total ${summary.lowStockCount}.`;
};

const getUserAndWorkspace = async (userId) => {
  const db = await readDB();
  db.users = db.users || [];
  db.userData = db.userData || {};
  db.workspaces = db.workspaces || [];
  const user = db.users.find((item) => item.id === userId);
  if (!user) return { db, user: null, workspace: null, data: null };
  const workspace = ensureWorkspaceRecord(db, user);
  const data = ensureDataShape(db.userData[user.workspaceId], workspace.name, user.role === 'Super Admin');
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  return { db, user, workspace, data };
};

const touchNotification = (data, title, body, level = 'info') => {
  data.notifications.unshift({ id: safeId('note_'), title, body, level, read: false, date: today() });
};

const canManageWorkspace = (memberRole) => ['owner', 'admin', 'manager'].includes(memberRole || 'member');


const permissionMatrix = {
  owner: { workspaceAdmin: true, crm: 'edit', inventory: 'edit', orders: 'edit', hr: 'edit', finance: 'edit', analytics: 'edit', reports: 'edit', vendors: 'edit', procurement: 'edit', projects: 'edit' },
  admin: { workspaceAdmin: true, crm: 'edit', inventory: 'edit', orders: 'edit', hr: 'edit', finance: 'edit', analytics: 'edit', reports: 'edit', vendors: 'edit', procurement: 'edit', projects: 'edit' },
  manager: { workspaceAdmin: true, crm: 'edit', inventory: 'edit', orders: 'edit', hr: 'view', finance: 'view', analytics: 'edit', reports: 'edit', vendors: 'edit', procurement: 'edit', projects: 'edit' },
  member: { workspaceAdmin: false, crm: 'edit', inventory: 'view', orders: 'edit', hr: 'none', finance: 'none', analytics: 'view', reports: 'view', vendors: 'view', procurement: 'view', projects: 'edit' },
  viewer: { workspaceAdmin: false, crm: 'view', inventory: 'view', orders: 'view', hr: 'none', finance: 'none', analytics: 'view', reports: 'view', vendors: 'view', procurement: 'view', projects: 'view' },
};

const getPermissionsForRole = (memberRole) => permissionMatrix[memberRole || 'member'] || permissionMatrix.member;
const hasModuleAccess = (memberRole, moduleKey, level = 'view') => {
  const permissions = getPermissionsForRole(memberRole);
  if (moduleKey === 'workspaceAdmin') return Boolean(permissions.workspaceAdmin);
  const value = permissions[moduleKey] || 'none';
  return level === 'edit' ? value === 'edit' : value === 'view' || value === 'edit';
};
const getMemberRoleForUser = (workspace, userId) => workspace?.members?.find((item) => item.userId === userId)?.role || 'member';
const requireAccess = (workspace, userId, moduleKey, level = 'view') => hasModuleAccess(getMemberRoleForUser(workspace, userId), moduleKey, level);

const ensureCoreData = async () => {
  const db = await readDB();
  db.users = db.users || [];
  db.userData = db.userData || {};
  db.workspaces = db.workspaces || [];

  const adminEmail = 'progamers5656@gmail.com';
  let admin = db.users.find((item) => item.email === adminEmail);
  if (!admin) {
    admin = {
      id: `user_${Date.now()}`,
      email: adminEmail,
      password: 'power king 123',
      name: 'Admin User',
      role: 'Super Admin',
      bio: 'The Master Administrator.',
      workspaceId: null,
      teamRole: 'owner',
    };
    db.users.push(admin);
  }

  db.users.forEach((user) => {
    const workspace = ensureWorkspaceRecord(db, user);
    db.userData[workspace.id] = ensureDataShape(db.userData[workspace.id], workspace.name, user.role === 'Super Admin');
    recalcAnalytics(db.userData[workspace.id]);
  });

  await writeDB(db);
};

// Auth routes - preserved
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await readDB();
  const user = (db.users || []).find((item) => item.email === email && item.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });
  const workspace = ensureWorkspaceRecord(db, user);
  const data = ensureDataShape(db.userData[workspace.id], workspace.name, user.role === 'Super Admin');
  recalcAnalytics(data);
  db.userData[workspace.id] = data;
  await writeDB(db);
  res.json({ user, data });
});

app.post('/api/signup', async (req, res) => {
  const { email, password, name } = req.body;
  const db = await readDB();
  if ((db.users || []).find((item) => item.email === email)) return res.status(400).json({ error: 'User already exists' });

  const userId = `user_${Date.now()}`;
  const newUser = { id: userId, email, password, name, role: 'Analyst', bio: 'New Team Member', workspaceId: userId, teamRole: 'owner' };
  db.users.push(newUser);
  db.userData[userId] = ensureDataShape(generateInitialData(name, false), name, false);
  ensureWorkspaceRecord(db, newUser);
  await writeDB(db);
  res.json({ user: newUser, data: db.userData[userId] });
});

app.put('/api/user', async (req, res) => {
  const { userId, name, bio, role } = req.body;
  const db = await readDB();
  const userIndex = (db.users || []).findIndex((item) => item.id === userId);
  if (userIndex === -1) return res.status(404).json({ error: 'User not found' });
  db.users[userIndex] = { ...db.users[userIndex], name, bio, role };
  const workspace = ensureWorkspaceRecord(db, db.users[userIndex]);
  const member = workspace.members.find((item) => item.userId === userId);
  if (member) {
    member.name = name;
    member.title = role;
  }
  await writeDB(db);
  res.json(db.users[userIndex]);
});

// Workspace routes
app.get('/api/workspace/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, workspace } = await getUserAndWorkspace(userId);
  if (!user || !workspace) return res.status(404).json({ error: 'Workspace not found' });
  await writeDB(db);
  res.json({ ...workspace, memberCount: workspace.members.length });
});


app.get('/api/workspace/permissions/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, workspace } = await getUserAndWorkspace(userId);
  if (!user || !workspace) return res.status(404).json({ error: 'Workspace not found' });
  await writeDB(db);
  res.json(getPermissionsForRole(getMemberRoleForUser(workspace, user.id)));
});

app.post('/api/workspace/update', async (req, res) => {
  const { userId, name } = req.body;
  const { db, user, workspace, data } = await getUserAndWorkspace(userId);
  if (!user || !workspace || !data) return res.status(404).json({ error: 'Workspace not found' });
  const selfMember = workspace.members.find((item) => item.userId === user.id);
  if (!canManageWorkspace(selfMember?.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  if (name?.trim()) {
    workspace.name = name.trim();
    data.settings.workspaceName = workspace.name;
  }
  db.userData[workspace.id] = data;
  await writeDB(db);
  res.json({ ...workspace, memberCount: workspace.members.length });
});

app.post('/api/workspace/team/add-member', async (req, res) => {
  const { userId, email, name, role, title } = req.body;
  const { db, user, workspace } = await getUserAndWorkspace(userId);
  if (!user || !workspace) return res.status(404).json({ error: 'Workspace not found' });
  const selfMember = workspace.members.find((item) => item.userId === user.id);
  if (!canManageWorkspace(selfMember?.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  if (!email) return res.status(400).json({ error: 'Email is required' });

  let teammate = db.users.find((item) => item.email === email);
  if (!teammate) {
    teammate = {
      id: `user_${Date.now()}`,
      email,
      password: 'changeme123',
      name: name || email.split('@')[0],
      role: title || 'Team Member',
      bio: 'Invited to a Vantage workspace',
      workspaceId: workspace.id,
      teamRole: role || 'member',
    };
    db.users.push(teammate);
  }

  teammate.workspaceId = workspace.id;
  teammate.teamRole = role || teammate.teamRole || 'member';
  if (name) teammate.name = name;
  if (title) teammate.role = title;

  const existing = workspace.members.find((item) => item.userId === teammate.id);
  if (!existing) {
    workspace.members.push({ userId: teammate.id, name: teammate.name, email: teammate.email, role: teammate.teamRole, title: teammate.role, joinedAt: today(), status: 'active' });
  } else {
    existing.name = teammate.name;
    existing.email = teammate.email;
    existing.role = teammate.teamRole;
    existing.title = teammate.role;
  }

  db.userData[workspace.id] = ensureDataShape(db.userData[workspace.id], workspace.name, false);
  touchNotification(db.userData[workspace.id], 'Teammate added', `${teammate.name} joined ${workspace.name}.`, 'success');
  await writeDB(db);
  res.json({ ...workspace, memberCount: workspace.members.length });
});

app.put('/api/workspace/team/member/:memberUserId', async (req, res) => {
  const { memberUserId } = req.params;
  const { userId, role, title } = req.body;
  const { db, user, workspace } = await getUserAndWorkspace(userId);
  if (!user || !workspace) return res.status(404).json({ error: 'Workspace not found' });
  const selfMember = workspace.members.find((item) => item.userId === user.id);
  if (!canManageWorkspace(selfMember?.role)) return res.status(403).json({ error: 'Insufficient permissions' });

  const member = workspace.members.find((item) => item.userId === memberUserId);
  const memberUser = db.users.find((item) => item.id === memberUserId);
  if (!member || !memberUser) return res.status(404).json({ error: 'Member not found' });
  if (role) {
    member.role = role;
    memberUser.teamRole = role;
  }
  if (title !== undefined) {
    member.title = title;
    memberUser.role = title;
  }
  await writeDB(db);
  res.json({ ...workspace, memberCount: workspace.members.length });
});

app.delete('/api/workspace/team/member/:memberUserId', async (req, res) => {
  const { memberUserId } = req.params;
  const { userId } = req.body;
  const { db, user, workspace } = await getUserAndWorkspace(userId);
  if (!user || !workspace) return res.status(404).json({ error: 'Workspace not found' });
  const selfMember = workspace.members.find((item) => item.userId === user.id);
  if (!canManageWorkspace(selfMember?.role)) return res.status(403).json({ error: 'Insufficient permissions' });
  if (workspace.ownerUserId === memberUserId) return res.status(400).json({ error: 'Cannot remove the workspace owner' });

  workspace.members = workspace.members.filter((item) => item.userId !== memberUserId);
  const memberUser = db.users.find((item) => item.id === memberUserId);
  if (memberUser) {
    memberUser.workspaceId = memberUser.id;
    memberUser.teamRole = 'owner';
    ensureWorkspaceRecord(db, memberUser);
  }
  await writeDB(db);
  res.json({ ...workspace, memberCount: workspace.members.length });
});

// Data fetch and shared workspace routes
app.get('/api/user/data/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  await writeDB(db);
  res.json(data);
});

app.get('/api/notifications/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  await writeDB(db);
  res.json(data.notifications);
});

app.post('/api/notifications/read', async (req, res) => {
  const { userId, notificationId } = req.body;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  data.notifications = data.notifications.map((item) => item.id === notificationId ? { ...item, read: true } : item);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/erp/search', async (req, res) => {
  const { userId, query = '' } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId is required' });
  const { db, user, data } = await getUserAndWorkspace(String(userId));
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  const q = String(query).trim().toLowerCase();
  const include = (text) => String(text || '').toLowerCase().includes(q);
  await writeDB(db);
  res.json({
    customers: data.customers.filter((item) => include(item.name) || include(item.email) || include(item.region) || include(item.company)),
    reports: data.reports.filter((item) => include(item.name) || include(item.type) || include(item.status)),
    inventory: data.inventory.filter((item) => include(item.name) || include(item.sku) || include(item.category) || include(item.location)),
    orders: data.orders.filter((item) => include(item.customerName) || include(item.status) || include(item.region) || include(item.notes)),
    employees: data.employees.filter((item) => include(item.name) || include(item.department) || include(item.role) || include(item.title)),
    transactions: data.transactions.filter((item) => include(item.category) || include(item.note) || include(item.type)),
    vendors: data.vendors.filter((item) => include(item.name) || include(item.category) || include(item.region)),
    procurement: data.procurement.filter((item) => include(item.title) || include(item.vendorName) || include(item.status)),
    projects: data.projects.filter((item) => include(item.name) || include(item.owner) || include(item.status) || include(item.health)),
  });
});

// Legacy and extended CRUD endpoints
app.post('/api/reports/create', async (req, res) => {
  const { userId, type } = req.body;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  const topCustomerIds = [...data.customers].sort((a, b) => number(b.ltv) - number(a.ltv)).slice(0, 2).map((item) => item.id);
  const report = { id: safeId('r'), name: `${type} Report ${new Date().getFullYear()}.pdf`, date: today(), type, status: 'READY', relatedCustomerIds: topCustomerIds, totalValue: number(data.analytics.revenue.total) };
  data.reports.unshift(report);
  touchNotification(data, 'Report generated', `${report.name} is ready to download.`, 'success');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  setTimeout(() => res.json(report), 300);
});

app.post('/api/customers/add', async (req, res) => {
  const { userId, name, email, ltv, region, segment, company, status, ownerId, notes } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'crm', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const customer = { id: safeId('c'), name, email, ltv: number(ltv), region: region || 'North America', segment: segment || 'Growth', company: company || name, status: status || 'active', ownerId: ownerId || user.id, notes: notes || '' };
  data.customers.unshift(customer);
  recalcAnalytics(data);
  touchNotification(data, 'Customer added', `${customer.name} was added to CRM.`, 'info');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(customer);
});

app.put('/api/customers/:userId/:customerId', async (req, res) => {
  const { userId, customerId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'crm', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.customers.findIndex((item) => item.id === customerId);
  if (index === -1) return res.status(404).json({ error: 'Customer not found' });
  data.customers[index] = { ...data.customers[index], ...req.body, ltv: req.body.ltv !== undefined ? number(req.body.ltv) : data.customers[index].ltv };
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.customers[index]);
});

app.delete('/api/customers/:userId/:customerId', async (req, res) => {
  const { userId, customerId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'crm', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.customers = data.customers.filter((item) => item.id !== customerId);
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/inventory/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  await writeDB(db);
  res.json(data.inventory);
});

app.post('/api/inventory/add', async (req, res) => {
  const { userId, sku, name, category, stock, reorderLevel, price, supplier, location } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'inventory', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const item = { id: safeId('inv_'), sku, name, category: category || 'General', stock: number(stock), reorderLevel: number(reorderLevel), price: number(price), supplier: supplier || 'Internal', location: location || 'Main', status: inferInventoryStatus(number(stock), number(reorderLevel)) };
  data.inventory.unshift(item);
  if (item.stock <= item.reorderLevel) touchNotification(data, 'Low-stock item created', `${item.name} is already below its reorder threshold.`, 'warning');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(item);
});

app.put('/api/inventory/:userId/:itemId', async (req, res) => {
  const { userId, itemId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'inventory', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.inventory.findIndex((item) => item.id === itemId);
  if (index === -1) return res.status(404).json({ error: 'Inventory item not found' });
  const updated = { ...data.inventory[index], ...req.body };
  updated.stock = number(updated.stock);
  updated.reorderLevel = number(updated.reorderLevel);
  updated.price = number(updated.price);
  updated.status = inferInventoryStatus(updated.stock, updated.reorderLevel);
  data.inventory[index] = updated;
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(updated);
});

app.delete('/api/inventory/:userId/:itemId', async (req, res) => {
  const { userId, itemId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'inventory', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.inventory = data.inventory.filter((item) => item.id !== itemId);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/orders/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  await writeDB(db);
  res.json(data.orders);
});

app.post('/api/orders/add', async (req, res) => {
  const { userId, customerId, customerName, amount, status, date, region, ownerId, notes } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'orders', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const order = { id: safeId('ord_'), customerId: customerId || null, customerName, amount: number(amount), status: status || 'pending', date: date || today(), region: region || 'North America', ownerId: ownerId || user.id, notes: notes || '' };
  data.orders.unshift(order);
  recalcAnalytics(data);
  touchNotification(data, 'Order created', `${order.customerName} order is now ${order.status}.`, 'success');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(order);
});

app.put('/api/orders/:userId/:orderId', async (req, res) => {
  const { userId, orderId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'orders', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.orders.findIndex((item) => item.id === orderId);
  if (index === -1) return res.status(404).json({ error: 'Order not found' });
  data.orders[index] = { ...data.orders[index], ...req.body, amount: req.body.amount !== undefined ? number(req.body.amount) : data.orders[index].amount };
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.orders[index]);
});

app.delete('/api/orders/:userId/:orderId', async (req, res) => {
  const { userId, orderId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'orders', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.orders = data.orders.filter((item) => item.id !== orderId);
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/employees/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  await writeDB(db);
  res.json(data.employees);
});

app.post('/api/employees/add', async (req, res) => {
  const { userId, name, email, department, role, salary, status, title } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'hr', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const employee = { id: safeId('emp_'), name, email, department, role, salary: number(salary), status: status || 'active', title: title || role };
  data.employees.unshift(employee);
  touchNotification(data, 'Employee added', `${employee.name} joined ${employee.department}.`, 'info');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(employee);
});

app.put('/api/employees/:userId/:employeeId', async (req, res) => {
  const { userId, employeeId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'hr', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.employees.findIndex((item) => item.id === employeeId);
  if (index === -1) return res.status(404).json({ error: 'Employee not found' });
  data.employees[index] = { ...data.employees[index], ...req.body, salary: req.body.salary !== undefined ? number(req.body.salary) : data.employees[index].salary };
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.employees[index]);
});

app.delete('/api/employees/:userId/:employeeId', async (req, res) => {
  const { userId, employeeId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'hr', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.employees = data.employees.filter((item) => item.id !== employeeId);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/transactions/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  await writeDB(db);
  res.json(data.transactions);
});

app.post('/api/transactions/add', async (req, res) => {
  const { userId, type, amount, category, date, note, status } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'finance', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const transaction = { id: safeId('txn_'), type, amount: number(amount), category, date: date || today(), note: note || '', status: status || 'posted' };
  data.transactions.unshift(transaction);
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(transaction);
});

app.put('/api/transactions/:userId/:transactionId', async (req, res) => {
  const { userId, transactionId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'finance', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.transactions.findIndex((item) => item.id === transactionId);
  if (index === -1) return res.status(404).json({ error: 'Transaction not found' });
  data.transactions[index] = { ...data.transactions[index], ...req.body, amount: req.body.amount !== undefined ? number(req.body.amount) : data.transactions[index].amount };
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.transactions[index]);
});

app.delete('/api/transactions/:userId/:transactionId', async (req, res) => {
  const { userId, transactionId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'finance', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.transactions = data.transactions.filter((item) => item.id !== transactionId);
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.put('/api/analytics/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'analytics', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const payload = req.body || {};
  data.analytics.users = {
    ...data.analytics.users,
    ...(payload.users || {}),
    active: payload.users?.active !== undefined ? number(payload.users.active) : data.analytics.users.active,
    growth: payload.users?.growth !== undefined ? number(payload.users.growth) : data.analytics.users.growth,
    distribution: {
      mobile: payload.users?.distribution?.mobile !== undefined ? number(payload.users.distribution.mobile) : data.analytics.users.distribution.mobile,
      desktop: payload.users?.distribution?.desktop !== undefined ? number(payload.users.distribution.desktop) : data.analytics.users.distribution.desktop,
    },
  };
  if (payload.meta?.deviceDefinitions) {
    data.analytics.meta = {
      ...(data.analytics.meta || baseAnalyticsMeta),
      deviceDefinitions: {
        ...((data.analytics.meta && data.analytics.meta.deviceDefinitions) || baseAnalyticsMeta.deviceDefinitions),
        ...payload.meta.deviceDefinitions,
      },
    };
  }
  recalcAnalytics(data);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.analytics);
});

app.put('/api/settings/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data || !workspace) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'workspaceAdmin', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.settings = { ...(data.settings || {}), ...(req.body || {}) };
  if (req.body?.workspaceName) workspace.name = req.body.workspaceName;
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.settings);
});


// Extended enterprise modules
app.get('/api/vendors/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'vendors', 'view')) return res.status(403).json({ error: 'Insufficient permissions' });
  await writeDB(db);
  res.json(data.vendors);
});

app.post('/api/vendors/add', async (req, res) => {
  const { userId, name, email, category, rating, status, region, spend } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'vendors', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const vendor = { id: safeId('ven_'), name, email: email || '', category: category || 'General', rating: number(rating || 0), status: status || 'active', region: region || 'North America', spend: number(spend || 0) };
  data.vendors.unshift(vendor);
  touchNotification(data, 'Vendor added', `${vendor.name} is now tracked in vendor management.`, 'info');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(vendor);
});

app.put('/api/vendors/:userId/:vendorId', async (req, res) => {
  const { userId, vendorId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'vendors', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.vendors.findIndex((item) => item.id === vendorId);
  if (index === -1) return res.status(404).json({ error: 'Vendor not found' });
  data.vendors[index] = { ...data.vendors[index], ...req.body, rating: req.body.rating !== undefined ? number(req.body.rating) : data.vendors[index].rating, spend: req.body.spend !== undefined ? number(req.body.spend) : data.vendors[index].spend };
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.vendors[index]);
});

app.delete('/api/vendors/:userId/:vendorId', async (req, res) => {
  const { userId, vendorId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'vendors', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.vendors = data.vendors.filter((item) => item.id !== vendorId);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/procurement/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'procurement', 'view')) return res.status(403).json({ error: 'Insufficient permissions' });
  await writeDB(db);
  res.json(data.procurement);
});

app.post('/api/procurement/add', async (req, res) => {
  const { userId, title, vendorId, vendorName, amount, priority, status, requestedBy, date } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'procurement', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const item = { id: safeId('pr_'), title, vendorId: vendorId || null, vendorName: vendorName || 'Unassigned vendor', amount: number(amount), priority: priority || 'medium', status: status || 'requested', requestedBy: requestedBy || user.name, date: date || today() };
  data.procurement.unshift(item);
  data.transactions.unshift({ id: safeId('txn_'), type: 'expense', amount: item.amount, category: 'Procurement', date: item.date, note: `${item.title} / ${item.vendorName}`, status: item.status === 'approved' || item.status === 'ordered' ? 'posted' : 'draft' });
  recalcAnalytics(data);
  touchNotification(data, 'Procurement request logged', `${item.title} was added to procurement.`, item.priority === 'high' ? 'warning' : 'info');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(item);
});

app.put('/api/procurement/:userId/:procurementId', async (req, res) => {
  const { userId, procurementId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'procurement', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.procurement.findIndex((item) => item.id === procurementId);
  if (index === -1) return res.status(404).json({ error: 'Procurement request not found' });
  data.procurement[index] = { ...data.procurement[index], ...req.body, amount: req.body.amount !== undefined ? number(req.body.amount) : data.procurement[index].amount };
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.procurement[index]);
});

app.delete('/api/procurement/:userId/:procurementId', async (req, res) => {
  const { userId, procurementId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'procurement', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.procurement = data.procurement.filter((item) => item.id !== procurementId);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

app.get('/api/projects/:userId', async (req, res) => {
  const { userId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'projects', 'view')) return res.status(403).json({ error: 'Insufficient permissions' });
  await writeDB(db);
  res.json(data.projects);
});

app.post('/api/projects/add', async (req, res) => {
  const { userId, name, owner, budget, progress, status, dueDate, health } = req.body;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'projects', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const project = { id: safeId('proj_'), name, owner: owner || user.name, budget: number(budget), progress: number(progress || 0), status: status || 'planning', dueDate: dueDate || '', health: health || 'healthy' };
  data.projects.unshift(project);
  touchNotification(data, 'Project created', `${project.name} entered the portfolio.`, 'success');
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(project);
});

app.put('/api/projects/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'projects', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  const index = data.projects.findIndex((item) => item.id === projectId);
  if (index === -1) return res.status(404).json({ error: 'Project not found' });
  data.projects[index] = { ...data.projects[index], ...req.body, budget: req.body.budget !== undefined ? number(req.body.budget) : data.projects[index].budget, progress: req.body.progress !== undefined ? number(req.body.progress) : data.projects[index].progress };
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json(data.projects[index]);
});

app.delete('/api/projects/:userId/:projectId', async (req, res) => {
  const { userId, projectId } = req.params;
  const { db, user, data, workspace } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  if (!requireAccess(workspace, user.id, 'projects', 'edit')) return res.status(403).json({ error: 'Insufficient permissions' });
  data.projects = data.projects.filter((item) => item.id !== projectId);
  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ success: true });
});

// AI routes
app.post('/api/ai/generate', async (req, res) => {
  const { apiKey, prompt } = req.body;
  if (!apiKey) return res.status(400).json({ error: 'API Key required' });
  try {
    const openai = new OpenAI({ apiKey });
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
      messages: [
        { role: 'system', content: 'You are a senior business analyst for a premium ERP. Keep answers useful, factual, and concise.' },
        { role: 'user', content: prompt },
      ],
    });
    res.json({ result: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'AI Generation Failed' });
  }
});

app.post('/api/ai/context-query', async (req, res) => {
  const { userId, question, apiKey, currentModule } = req.body;
  if (!userId || !question) return res.status(400).json({ error: 'userId and question are required' });
  if (userId === 'local') return res.json({ answer: 'Use frontend fallback when local context is requested.', contextUsed: ['frontend-fallback'], structured: {} });

  const { db, user, workspace, data } = await getUserAndWorkspace(userId);
  if (!user || !data) return res.status(404).json({ error: 'User data not found' });
  const contextUsed = chooseContexts(question, currentModule);
  const structured = contextSummary(data, workspace);
  let answer = simulateJoinAnswer(question, data, workspace, currentModule);

  if (apiKey) {
    try {
      const openai = new OpenAI({ apiKey });
      const prompt = `You are an ERP business copilot. Answer in 4 sentences max.\nQuestion: ${question}\nCurrent module: ${currentModule || 'N/A'}\nWorkspace: ${workspace?.name || 'N/A'}\nContext used: ${contextUsed.join(', ')}\nStructured data: ${JSON.stringify(structured)}\nCounts => customers:${data.customers.length}, reports:${data.reports.length}, inventory:${data.inventory.length}, orders:${data.orders.length}, employees:${data.employees.length}, transactions:${data.transactions.length}`;
      const completion = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: 'You are a sharp, premium ERP analyst. Give concrete answers, not vague hype.' },
          { role: 'user', content: prompt },
        ],
      });
      answer = completion.choices[0]?.message?.content || answer;
    } catch (error) {
      console.error('Context AI fallback used:', error?.message || error);
    }
  }

  db.userData[user.workspaceId] = data;
  await writeDB(db);
  res.json({ answer, contextUsed, structured });
});

ensureCoreData().then(() => {
  app.listen(PORT, () => {
    console.log(`VANTAGE Premium ERP server running on http://localhost:${PORT}`);
  });
});
