# 🍽️ Bistro RMS — Restaurant Management System

A full-stack Restaurant Management System built with **Next.js 16**, **NestJS**, **PostgreSQL**, **Prisma v7**, **TanStack Query**, and **TanStack Table**.

---

## Project Structure

```
Restaurant-Management-System/
├── rms-backend/          # NestJS API server
└── rms-frontend/         # Next.js App Router frontend
```

---

## Tech Stack

### Backend
- **NestJS** — modular Node.js framework
- **Prisma v7** — ORM with PostgreSQL driver adapter (`@prisma/adapter-pg`)
- **PostgreSQL** — relational database
- **JWT + Passport** — authentication with role-based access (Admin / Staff)
- **Swagger** — auto-generated API docs at `/api/docs`
- **class-validator / class-transformer** — DTO validation

### Frontend
- **Next.js 16** (App Router) — React 19 framework
- **TanStack Query v5** — server state, caching, optimistic updates
- **TanStack Table v8** — sortable, filterable, paginated tables
- **Recharts** — revenue and order analytics charts
- **Tailwind CSS v4** — warm restaurant-style design system
- **Axios** — HTTP client with JWT interceptors
- **qrcode.react** — QR code generation for table ordering
- **date-fns** — date formatting and manipulation

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally (pgAdmin recommended)

### 1. Backend Setup

```bash
cd rms-backend

# Install dependencies
npm install

# Create environment file at rms-backend/.env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rms_db?schema=public"
# JWT_SECRET="your-secret-key"

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Seed the database (creates demo users + sample data)
npm run seed

# Start development server (watch mode)
npm run start:dev
```

Backend runs at **http://localhost:3001**  
Swagger docs at **http://localhost:3001/api/docs**

### 2. Frontend Setup

```bash
cd rms-frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend runs at **http://localhost:3000**

---

## Demo Credentials

| Role  | Email                    | Password |
|-------|--------------------------|----------|
| Admin | admin@restaurant.com     | admin123 |
| Staff | staff@restaurant.com     | staff123 |

---

## Features

### Dashboard
- Daily revenue, active orders, table occupancy stats
- Weekly revenue area chart
- Orders-by-status pie chart
- Recent orders and top-selling menu items
- Admin sees full analytics; staff sees a simplified summary

### Orders
- Create orders with table + menu item selection
- Modifier picker per item — select size, extras, etc. with live price adjustment
- Real-time stock count shown per item so staff can see availability before ordering
- Status flow: Pending → Preparing → Served → Completed
- Optimistic updates via TanStack Query
- Sortable, filterable table with pagination
- Auto-polling every 30 seconds

### Menu Management
- Full CRUD for menu items (Admin only)
- **Modifier Groups** — add customisation options (size, extras, required choices) with per-option price adjustments
- Toggle availability with optimistic updates
- Stock column shows live inventory level per item
- Filter by category and search by name

### Kitchen Display System (KDS) — `/kitchen`
- Dedicated fullscreen view — no sidebar, opens in new tab from sidebar footer
- Color-coded order cards: 🔴 New (PENDING) · 🟡 Preparing · 🟢 Ready (SERVED)
- Live elapsed time ticker per order; urgent pulse animation after 5 minutes
- One-click **Bump** button advances each order to the next status
- Sound alert (Web Audio API) on new incoming orders — mutable toggle
- Auto-polls every 8 seconds

### Table Management
- Visual grid of all tables with color-coded status (Available / Occupied / Reserved / Cleaning)
- Click any table to update its status
- Admin can add/delete tables
- **QR Code** button on every table — generates a scannable QR code for customer self-ordering

### Reservations — `/reservations`
- Book tables for future dates and times with guest name, phone, party size, and notes
- Conflict detection — blocks double-booking within 90 minutes on the same table
- Cards grouped by date, sorted by time
- Status flow: Confirmed → Seated → Completed (or Cancelled / No Show)
- Seating a guest auto-marks the table Occupied; completing/cancelling auto-frees it
- **Process No-Shows** button marks overdue confirmed reservations automatically
- Create and edit modals with date/time pickers and table selector

### QR Customer Ordering — `/menu/[tableId]`
- Public page — no login required for customers
- Customers browse the full menu with category tabs and search
- Add items to cart, select modifiers, enter name and special requests, place order
- Order appears instantly in the staff orders list and KDS, tagged as `(QR Order)`
- Table is automatically marked Occupied; stock is deducted from inventory
- **Feedback form** shown immediately after order is placed — 1–5 star rating + optional comment
- QR codes can be downloaded as SVG for printing

### Inventory Management — `/inventory` *(Admin only)*
- Track stock levels per menu item with unit and low-stock threshold
- **Restock** — add quantity to current stock
- **Set Stock** — override to an exact quantity for manual corrections
- Stats cards: total tracked / in stock / low stock / out of stock
- Orange alert banner when items need attention
- Stock hits 0 → menu item auto-marked unavailable; restocked above 0 → auto re-enabled
- Stock deducted automatically on every order (staff-placed and QR)

### Shift / Daily Close Report — `/shift-report` *(Admin only)*
- Live preview of today's activity: total orders, completed, cancelled, revenue
- Payment breakdown by method (Cash / Card / Online)
- Top 10 selling items by quantity with revenue
- **Close Day** — one-click archives the report as an immutable snapshot
- Expandable history of all past daily reports

### Reports & Export — `/reports` *(Admin only)*
- Date range picker with quick presets (Today / Last 7 days / Last 30 days / This month)
- **Revenue tab** — total revenue, payment method breakdown, daily area chart
- **Menu Items tab** — top 10 best sellers and worst sellers by quantity + revenue
- **Staff Performance tab** — per-staff order counts, completion rate, revenue generated
- **CSV export** — download orders or payments for any date range (opens with JWT auth)

### Customer Feedback — `/feedback` *(Admin only)*
- Aggregate summary: total reviews, average rating, star distribution bar chart
- Per-menu-item average ratings ranked by score
- Full review feed with customer name, order number, table, comment, and timestamp
- Admin can delete individual reviews

### Billing
- Unpaid orders alert panel
- Process payments (Cash / Card / Online)
- Full payment history (Admin only)
- Refund support

---

## Role-Based Access

| Feature                  | Admin | Staff        |
|--------------------------|-------|--------------|
| Dashboard analytics      | Full  | Summary only |
| Menu CRUD + Modifiers    | ✅    | View only    |
| Kitchen Display (KDS)    | ✅    | ✅           |
| Reservations             | ✅    | ✅           |
| Inventory management     | ✅    | —            |
| Shift / Daily Report     | ✅    | —            |
| Reports & Export         | ✅    | —            |
| Customer Feedback        | ✅    | —            |
| Table management         | ✅    | Status only  |
| Orders                   | ✅    | ✅           |
| Billing                  | ✅    | Process only |
| Settings                 | ✅    | —            |

---

## Data Model

```
User              — id, email, name, password, role (ADMIN | STAFF)
MenuItem          — id, name, description, price, category, available, imageUrl
ModifierGroup     — id, menuItemId (N:1), name, required, multiSelect
Modifier          — id, modifierGroupId (N:1), name, priceAdjustment, available
InventoryItem     — id, menuItemId (1:1), quantity, unit, lowStockThreshold, lastRestockedAt
RestaurantTable   — id, tableNumber, capacity, status
Reservation       — id, tableId, guestName, phone, partySize, date, time, notes, status, createdById
Order             — id, orderNumber, status, totalAmount, tableId, staffId, notes
OrderItem         — id, orderId, menuItemId, quantity, unitPrice, notes
OrderItemModifier — id, orderItemId, modifierId, name, priceAdjustment
Payment           — id, orderId (1:1), amount, method, status
Feedback          — id, orderId (1:1), rating (1–5), comment, customerName
DailyReport       — id, date (unique), totalOrders, revenue, topItemsJson, closedAt, closedById
```

---

## API Endpoints

### Auth
| Method | Path               | Auth | Description           |
|--------|--------------------|------|-----------------------|
| POST   | /api/auth/register | —    | Register user         |
| POST   | /api/auth/login    | —    | Login                 |
| GET    | /api/auth/me       | JWT  | Current user profile  |

### Menu
| Method | Path                                                     | Auth  | Description                  |
|--------|----------------------------------------------------------|-------|------------------------------|
| GET    | /api/menu                                                | JWT   | List menu items (filterable) |
| GET    | /api/menu/:id                                            | JWT   | Get single menu item         |
| POST   | /api/menu                                                | Admin | Create menu item             |
| PUT    | /api/menu/:id                                            | Admin | Update menu item             |
| PATCH  | /api/menu/:id/toggle-availability                        | Admin | Toggle availability          |
| DELETE | /api/menu/:id                                            | Admin | Delete menu item             |
| GET    | /api/menu/:id/modifiers                                  | JWT   | Get modifier groups          |
| POST   | /api/menu/:id/modifiers/groups                           | Admin | Create modifier group        |
| PUT    | /api/menu/:id/modifiers/groups/:groupId                  | Admin | Update modifier group        |
| DELETE | /api/menu/:id/modifiers/groups/:groupId                  | Admin | Delete modifier group        |
| POST   | /api/menu/:id/modifiers/groups/:groupId/modifiers        | Admin | Add modifier to group        |
| PUT    | /api/menu/:id/modifiers/groups/:groupId/modifiers/:modId | Admin | Update modifier              |
| DELETE | /api/menu/:id/modifiers/groups/:groupId/modifiers/:modId | Admin | Delete modifier              |

### Tables
| Method | Path                   | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | /api/tables            | JWT   | List all tables     |
| GET    | /api/tables/:id        | JWT   | Get single table    |
| POST   | /api/tables            | Admin | Create table        |
| PUT    | /api/tables/:id        | Admin | Update table        |
| PATCH  | /api/tables/:id/status | JWT   | Update table status |
| DELETE | /api/tables/:id        | Admin | Delete table        |

### Reservations
| Method | Path                                | Auth  | Description                          |
|--------|-------------------------------------|-------|--------------------------------------|
| GET    | /api/reservations                   | JWT   | List reservations (filterable)       |
| GET    | /api/reservations/upcoming          | JWT   | Get upcoming confirmed reservations  |
| GET    | /api/reservations/:id               | JWT   | Get single reservation               |
| POST   | /api/reservations                   | JWT   | Create reservation                   |
| PUT    | /api/reservations/:id               | JWT   | Update reservation                   |
| PATCH  | /api/reservations/:id/status        | JWT   | Update status (seat/cancel/no-show)  |
| DELETE | /api/reservations/:id               | Admin | Delete reservation                   |
| POST   | /api/reservations/process-no-shows  | Admin | Mark overdue reservations as no-show |

### Orders
| Method | Path                   | Auth  | Description         |
|--------|------------------------|-------|---------------------|
| GET    | /api/orders            | JWT   | List orders         |
| GET    | /api/orders/:id        | JWT   | Get single order    |
| POST   | /api/orders            | JWT   | Create order        |
| PATCH  | /api/orders/:id/status | JWT   | Update order status |
| DELETE | /api/orders/:id        | Admin | Delete order        |

### KDS
| Method | Path              | Auth | Description               |
|--------|-------------------|------|---------------------------|
| GET    | /api/kds/active   | JWT  | Get active kitchen orders |
| PATCH  | /api/kds/:id/bump | JWT  | Bump order to next status |

### Payments
| Method | Path                        | Auth  | Description           |
|--------|-----------------------------|-------|-----------------------|
| GET    | /api/payments               | JWT   | List payments         |
| GET    | /api/payments/:id           | JWT   | Get single payment    |
| GET    | /api/payments/unpaid-orders | JWT   | Get unpaid orders     |
| POST   | /api/payments               | JWT   | Process payment       |
| PATCH  | /api/payments/:id/status    | Admin | Update payment status |

### Inventory *(Admin only)*
| Method | Path                       | Description                |
|--------|----------------------------|----------------------------|
| GET    | /api/inventory             | List all inventory items   |
| GET    | /api/inventory/low-stock   | Get low-stock items        |
| GET    | /api/inventory/:id         | Get single inventory item  |
| POST   | /api/inventory             | Start tracking a menu item |
| PUT    | /api/inventory/:id         | Update unit / threshold    |
| PATCH  | /api/inventory/:id/restock | Add stock                  |
| PATCH  | /api/inventory/:id/adjust  | Set exact stock quantity   |
| DELETE | /api/inventory/:id         | Stop tracking              |

### Reports *(Admin only)*
| Method | Path                        | Description                        |
|--------|-----------------------------|------------------------------------|
| GET    | /api/reports/revenue        | Revenue report for a date range    |
| GET    | /api/reports/items          | Best/worst selling items           |
| GET    | /api/reports/staff          | Staff performance report           |
| GET    | /api/reports/export/orders  | Export orders as CSV               |
| GET    | /api/reports/export/payments| Export payments as CSV             |

### Shift Report *(Admin only)*
| Method | Path                          | Description                      |
|--------|-------------------------------|----------------------------------|
| GET    | /api/shift-report/preview     | Live preview of today's report   |
| GET    | /api/shift-report/history     | All archived daily reports       |
| GET    | /api/shift-report/history/:id | Single archived report           |
| POST   | /api/shift-report/close       | Close the day and archive report |

### Feedback
| Method | Path                      | Auth  | Description                        |
|--------|---------------------------|-------|------------------------------------|
| POST   | /api/feedback             | —     | Submit feedback (public, no auth)  |
| GET    | /api/feedback             | Admin | Get all feedback                   |
| GET    | /api/feedback/summary     | Admin | Rating summary + distribution      |
| GET    | /api/feedback/menu-ratings| Admin | Average ratings per menu item      |
| DELETE | /api/feedback/:id         | Admin | Delete a review                    |

### Dashboard
| Method | Path                         | Auth  | Description        |
|--------|------------------------------|-------|--------------------|
| GET    | /api/dashboard/analytics     | Admin | Full analytics     |
| GET    | /api/dashboard/staff-summary | JWT   | Staff summary      |

### Public *(no auth — for QR customer ordering)*
| Method | Path                        | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/public/menu            | Get available menu items     |
| GET    | /api/public/tables/:tableId | Get table info               |
| POST   | /api/public/orders          | Place order from QR scan     |

---

## Design System

| Token       | Value     | Usage                    |
|-------------|-----------|--------------------------|
| Warm Beige  | `#F5E6D3` | Backgrounds, borders     |
| Deep Brown  | `#4E342E` | Primary text, sidebar    |
| Soft Orange | `#FF8A65` | Accents, CTAs, badges    |
| Cream       | `#FFF8F0` | Page background          |
| Light Brown | `#8D6E63` | Secondary text           |

---

## Environment Variables

### Backend (`rms-backend/.env`)
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/rms_db?schema=public"
JWT_SECRET="your-secret-key"
PORT=3001                             # optional, defaults to 3001
FRONTEND_URL="http://localhost:3000"  # optional, for CORS
```
