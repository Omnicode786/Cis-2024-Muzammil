import { Router } from "express";
import { requireAuth } from "../middlewares/auth.js";
import { authRouter } from "./auth.routes.js";
import { dashboardRouter } from "./dashboard.routes.js";
import { staffRouter } from "./staff.routes.js";
import { customersRouter } from "./customers.routes.js";
import { suppliersRouter } from "./suppliers.routes.js";
import { billingRouter } from "./billing.routes.js";
import { paymentsRouter } from "./payments.routes.js";
import { supplierTransactionsRouter } from "./supplier-transactions.routes.js";
import { reportsRouter } from "./reports.routes.js";
import { aiRouter } from "./ai.routes.js";

export const apiRouter = Router();

apiRouter.use("/auth", authRouter);
apiRouter.use("/dashboard", requireAuth, dashboardRouter);
apiRouter.use("/staff", requireAuth, staffRouter);
apiRouter.use("/customers", requireAuth, customersRouter);
apiRouter.use("/suppliers", requireAuth, suppliersRouter);
apiRouter.use("/billing", requireAuth, billingRouter);
apiRouter.use("/payments", requireAuth, paymentsRouter);
apiRouter.use("/supplier-transactions", requireAuth, supplierTransactionsRouter);
apiRouter.use("/reports", requireAuth, reportsRouter);
apiRouter.use("/ai", requireAuth, aiRouter);
