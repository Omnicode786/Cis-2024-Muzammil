import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";
import type { Page } from "playwright";

const baseUrl = process.env.SHOPIQ_CAPTURE_URL || "http://localhost:3000";
const captureDir = process.env.SHOPIQ_CAPTURE_DIR || "screenshots";
const captureTheme = process.env.SHOPIQ_CAPTURE_THEME === "light" ? "light" : "dark";
const captureUiMode = process.env.SHOPIQ_CAPTURE_UI_MODE === "classic" ? "classic" : "glass";
const captureShadcnTheme = process.env.SHOPIQ_CAPTURE_SHADCN_THEME || "original";
const outputDir = path.join(process.cwd(), "public", captureDir);

const routes = [
  { name: "landing", url: "/" },
  { name: "dashboard", url: "/admin/dashboard" },
  { name: "products", url: "/admin/products" },
  { name: "billing", url: "/admin/billing" },
  { name: "customers", url: "/admin/customers" },
  { name: "suppliers", url: "/admin/suppliers" },
  { name: "payments", url: "/admin/payments" },
  { name: "purchases", url: "/admin/purchases" },
  { name: "reports", url: "/admin/reports" },
  { name: "assistant", url: "/admin/assistant" },
  { name: "settings", url: "/admin/settings" }
];

async function waitForApp(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2200);
}

async function gotoWithRetry(page: Page, url: string, attempts = 3) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 45000 });
      await waitForApp(page);
      return;
    } catch (error) {
      lastError = error;
      await page.waitForTimeout(1200 * attempt);
    }
  }

  throw lastError;
}

async function browserPage() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 },
    deviceScaleFactor: 1,
    colorScheme: captureTheme
  });

  await context.addInitScript(
    ({ theme, uiMode, shadcnTheme }) => {
      window.localStorage.setItem("shopiq-theme", theme);
      window.localStorage.setItem("shopiq-ui-mode", uiMode);
      window.localStorage.setItem("shopiq-shadcn-theme", shadcnTheme);
    },
    { theme: captureTheme, uiMode: captureUiMode, shadcnTheme: captureShadcnTheme }
  );

  const page = await context.newPage();
  return { browser, context, page };
}

async function login(page: Awaited<ReturnType<typeof browserPage>>["page"]) {
  await gotoWithRetry(page, `${baseUrl}/login`);
  await page.getByPlaceholder("Email").fill("owner@shopiq.dev");
  await page.getByPlaceholder("Password").fill("demo12345");
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/admin\/dashboard/, { timeout: 30000 });
  await waitForApp(page);
}

async function main() {
  await mkdir(outputDir, { recursive: true });
  const { browser, page } = await browserPage();

  try {
    await gotoWithRetry(page, `${baseUrl}/`);
    await page.screenshot({ path: path.join(outputDir, "landing.png"), fullPage: false });

    await login(page);

    for (const route of routes.filter((route) => route.name !== "landing")) {
      await gotoWithRetry(page, `${baseUrl}${route.url}`);
      await page.screenshot({ path: path.join(outputDir, `${route.name}.png`), fullPage: false });
      console.log(`captured ${captureTheme}/${captureUiMode}/${route.name}`);
    }
  } finally {
    await browser.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
