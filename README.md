# Dayflow HRMS Blueprint

Production-ready scaffold for a modern Human Resource Management System (HRMS) built with:

- Next.js (App Router) + TypeScript
- Tailwind CSS + Lucide Icons + Shadcn-style UI components
- PostgreSQL + Prisma ORM
- NextAuth.js v5 (Credentials provider) with RBAC middleware

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Add environment variables:
   ```bash
   DATABASE_URL="******HOST:5432/dayflow"
   AUTH_SECRET="replace-with-long-random-value"
   ```
3. Generate Prisma client and migrate:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

## Route Overview

- Auth: `/sign-in`, `/sign-up`
- Employee: `/employee/profile`, `/employee/attendance`, `/employee/leaves`, `/employee/salary`
- Admin/HR: `/admin/employees`, `/admin/attendance`, `/admin/leaves`, `/admin/payroll`

Middleware protects `/admin/*` routes for `ADMIN` and `HR_OFFICER` only, redirecting others to `/employee/profile`.
