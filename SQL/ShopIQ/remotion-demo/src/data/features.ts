import { BarChart3, Bot, Boxes, ClipboardList, CreditCard, FileText, ReceiptText, ShieldCheck, UsersRound, WalletCards } from "lucide-react";

export const featureGroups = [
  {
    title: "Dashboard command center",
    body: "The first screen is built around real next actions: create invoices, add customers, record payments, manage stock, and export reports.",
    icon: BarChart3,
    accent: "#5b8cff"
  },
  {
    title: "Inventory and products",
    body: "Products carry SKU, barcode, category, supplier, stock levels, reorder levels, pricing, pack details, and batch tracking where needed.",
    icon: Boxes,
    accent: "#18c37e"
  },
  {
    title: "Invoice-driven billing",
    body: "Invoices, invoice items, stock movements, customer balance, and automatic payment records stay in the same workflow.",
    icon: ReceiptText,
    accent: "#ff3d1f"
  },
  {
    title: "Payments that match records",
    body: "Customer receipts and supplier payouts are linked to invoices or purchases, so balances do not drift from the source record.",
    icon: CreditCard,
    accent: "#ffc857"
  },
  {
    title: "Suppliers and purchases",
    body: "Purchase receiving updates stock, supplier payables, and activity history instead of living outside inventory.",
    icon: WalletCards,
    accent: "#8d5cff"
  },
  {
    title: "Business PDF reports",
    body: "Reports turn sales, stock risk, dues, supplier pressure, and movement history into clean downloadable PDF documents.",
    icon: FileText,
    accent: "#5b8cff"
  },
  {
    title: "ShopIQ Copilot",
    body: "Gemini-backed assistance answers business questions, prepares reports, and previews write actions before anything changes.",
    icon: Bot,
    accent: "#8d5cff"
  },
  {
    title: "Role-based control",
    body: "Admin, manager, and staff access keeps sensitive workflows protected while daily tasks stay reachable.",
    icon: ShieldCheck,
    accent: "#18c37e"
  },
  {
    title: "Customer ledgers",
    body: "Customer records connect contact details, credit limits, invoices, payments, dues, and ledger history.",
    icon: UsersRound,
    accent: "#f44f78"
  },
  {
    title: "Activity timeline",
    body: "Important actions such as invoices, payments, stock changes, and generated reports create operational history.",
    icon: ClipboardList,
    accent: "#ffc857"
  }
];

export const workflowSteps = [
  "Add product",
  "Create invoice",
  "Payment syncs",
  "Stock updates",
  "Reports and Copilot"
];

