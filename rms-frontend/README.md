# Bistro RMS — Frontend

Next.js 16 App Router frontend for the Bistro Restaurant Management System.

## Stack

- **Next.js 16** with React 19 (App Router)
- **TanStack Query v5** — server state, caching, optimistic updates
- **TanStack Table v8** — sortable, filterable, paginated tables
- **Recharts** — analytics charts
- **Tailwind CSS v4** — warm restaurant design system
- **Axios** — HTTP client with JWT interceptors
- **qrcode.react** — QR code generation

## Setup

```bash
npm install
npm run dev
```

Runs at **http://localhost:3000**. Requires the backend running at `http://localhost:3001`.

## Scripts

| Script          | Description              |
|-----------------|--------------------------|
| `npm run dev`   | Development server       |
| `npm run build` | Production build         |
| `npm run start` | Serve production build   |
| `npm run lint`  | ESLint                   |

## Directory Structure

```
app/
├── dashboard/      Analytics and summary page
├── orders/         Order management
├── menu/           Menu management
│   └── [tableId]/  Public customer menu (QR scan, no auth)
├── tables/         Table management with QR codes
├── billing/        Payment processing
├── inventory/      Stock management (Admin only)
├── settings/       Settings (Admin only)
└── login/          Authentication

components/
├── layout/         AppLayout, Sidebar, Topbar
├── dashboard/      StatCard, RevenueChart, OrderStatusChart
├── menu/           MenuTable, MenuItemModal
├── orders/         OrdersTable, CreateOrderModal
├── billing/        PaymentModal
├── tables/         QRCodeModal
└── ui/             Button, Input, Select, Modal, Card, Badge, Skeleton

hooks/              React Query hooks (useMenu, useOrders, useTables, useInventory, …)
services/           Axios service layer (menu, orders, tables, inventory, payments, …)
lib/                axios instance, permissions, query-client
types/              Shared TypeScript interfaces
providers/          AuthProvider, QueryProvider
```

## Key Patterns

- All data fetching via React Query hooks in `hooks/`
- Role checks centralised in `lib/permissions.ts` — never inline
- Optimistic updates on status toggles and order status changes
- `AppLayout` redirects unauthenticated users to `/login`
- Inventory page redirects non-admin users to `/dashboard`
- Public `/menu/[tableId]` page requires no authentication
