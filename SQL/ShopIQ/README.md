# ShopIQ

ShopIQ is a secure shop-centric multi-tenant SaaS starter built with React, TypeScript, Vite, TanStack Query, Express, Prisma, PostgreSQL / Neon, and Gemini AI.

## Highlights

- Shop bootstrap transaction creates a **shop** and its **first admin** together
- **Global unique login email** so one account belongs to one shop only
- **HTTP-only cookie auth** with short-lived access token and rotating refresh sessions
- **CSRF protection** on write operations
- **Tenant-safe queries** on every route
- **Zod validation** for requests
- **Seed data** and demo accounts
- Two visual modes:
  - **Classic**
  - **Liquid Glass**
