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
- **qrcode.react** — QR code generation for table ordering and receipts
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
- **Print Ticket** button on every card — opens a formatted kitchen ticket in a print dialog
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

### QR Customer Ordering — `/menu/[tableId]`
- Public page — no login required for customers
- Customers browse the full menu with category tabs and search
- Add items to cart, select modifiers, enter name, phone, email, and special requests
- Phone number enrolls the customer in the **Loyalty Programme** automatically
- Order appears instantly in the staff orders list and KDS, tagged as `(QR Order)`
- Table is automatically marked Occupied; stock is deducted from inventory
- **Feedback form** shown immediately after order is placed — 1–5 star rating + optional comment
- QR codes can be downloaded as SVG for printing

### Digital Receipt — `/receipt/[paymentId]`
- Public page — no login required, accessible via direct URL or QR code
- Itemised bill with item names, modifiers, quantities, and line totals
- Payment method, timestamp, table number, and staff name
- QR code on the receipt links back to itself for easy resharing
- Print button for physical copy

### Printer / POS Integration
- **Print Ticket** button on every KDS order card — opens a formatted kitchen ticket in a browser print dialog
- **Print Receipt** button in the Billing payment history — opens a formatted receipt for printing
- Backend generates both plain-text (ESC/POS compatible) and HTML versions of tickets
- `GET /api/print/order/:id/html` — printable kitchen ticket HTML
- `GET /api/print/receipt/:paymentId/html` — printable receipt HTML
- `GET /api/print/order/:id` — raw ESC/POS text for network printer integration
- Works with any browser-connected printer; no driver installation required

### Suppliers & Purchase Orders — `/suppliers` *(Admin only)*
- Manage a list of suppliers with contact name, phone, email, and address
- Link inventory items to suppliers with per-item unit cost
- **Create Purchase Orders** — select supplier, add items with quantities and unit costs, estimated total shown live
- PO status flow: Draft → Sent → Received (or Cancelled)
- **Receive PO** — marks the order received and automatically restocks all inventory items
- Full purchase order history with expandable detail view

### Multi-Location Support — `/locations` *(Admin only)*
- Create and manage multiple restaurant locations (name, address, phone, timezone)
- Activate / deactivate locations without deleting them
- `locationId` field on Orders, Tables, and Users — assign resources to specific locations
- **Cross-location analytics dashboard** — per-location breakdown of orders, revenue, active orders, and table count
- Totals row aggregates all locations plus unassigned records
- Existing data is unaffected (null `locationId` = unassigned / main location)

### Staff & User Management — `/staff` *(Admin only)*
- Full user table: name, email, role, phone, order count, last login, active status
- **Create** new staff or admin accounts directly from the UI
- **Edit** name, email, role, and phone
- **Change Password** for any user
- **Deactivate / Reactivate** accounts without deleting them
- **Activity Log** per user — tracks account creation, updates, password changes, deactivation

### Loyalty Programme — `/loyalty` *(Admin only)*
- Customers earn loyalty points by providing their phone number when ordering via QR
- Visit count and total spend tracked per customer
- Free item awarded automatically every 5 visits
- Progress bar shows how close each customer is to their next free item
- **Redeem** button marks the free item as used
- Summary stats: total members, free items pending, loyalty revenue, average visits

### Inventory Management — `/inventory` *(Admin only)*
- Track stock levels per menu item with unit and low-stock threshold
- **Restock** — add quantity to current stock
- **Set Stock** — override to an exact quantity for manual corrections
- Stats cards: total tracked / in stock / low stock / out of stock
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
- **CSV export** — download orders or payments for any date range

### Customer Feedback — `/feedback` *(Admin only)*
- Aggregate summary: total reviews, average rating, star distribution
- Per-menu-item average ratings ranked by score
- Full review feed with customer name, order number, table, comment, and timestamp
- Admin can delete individual reviews

### Billing
- Unpaid orders alert panel
- Process payments (Cash / Card / Online)
- Full payment history with **View Receipt** link and **Print Receipt** button per payment (Admin only)
- Refund support

---

## Role-Based Access

| Feature                      | Admin | Staff        |
|------------------------------|-------|--------------|
| Dashboard analytics          | Full  | Summary only |
| Menu CRUD + Modifiers        | ✅    | View only    |
| Kitchen Display (KDS)        | ✅    | ✅           |
| Print kitchen tickets        | ✅    | ✅           |
| Reservations                 | ✅    | ✅           |
| Inventory management         | ✅    | —            |
| Suppliers & Purchase Orders  | ✅    | —            |
| Multi-Location management    | ✅    | —            |
| Staff management             | ✅    | —            |
| Loyalty programme            | ✅    | —            |
| Shift / Daily Report         | ✅    | —            |
| Reports & Export             | ✅    | —            |
| Customer Feedback            | ✅    | —            |
| Table management             | ✅    | Status only  |
| Orders                       | ✅    | ✅           |
| Billing                      | ✅    | Process only |
| Settings                     | ✅    | —            |

---

## Data Model

```
User              — id, email, name, password, role, active, phone, lastLoginAt, locationId
ActivityLog       — id, userId, action, details, createdAt
Location          — id, name, address, phone, timezone, active
MenuItem          — id, name, description, price, category, available, imageUrl
ModifierGroup     — id, menuItemId (N:1), name, required, multiSelect
Modifier          — id, modifierGroupId (N:1), name, priceAdjustment, available
InventoryItem     — id, menuItemId (1:1), quantity, unit, lowStockThreshold, lastRestockedAt
Supplier          — id, name, contactName, phone, email, address, notes, active
SupplierItem      — id, supplierId, inventoryItemId, unitCost
PurchaseOrder     — id, supplierId, status, notes, totalCost, orderedAt, receivedAt, createdById
PurchaseOrderItem — id, purchaseOrderId, inventoryItemId, quantity, unitCost, received
RestaurantTable   — id, tableNumber, capacity, status, locationId
Reservation       — id, tableId, guestName, phone, partySize, date, time, notes, status, createdById
LoyaltyCustomer   — id, phone (unique), email, name, visitCount, totalSpend, freeItemEarned, freeItemUsed
Order             — id, orderNumber, status, totalAmount, tableId, staffId, loyaltyCustomerId, locationId, notes
OrderItem         — id, orderId, menuItemId, quantity, unitPrice, notes
OrderItemModifier — id, orderItemId, modifierId, name, priceAdjustment
Payment           — id, orderId (1:1), amount, method, status
Feedback          — id, orderId (1:1), rating (1–5), comment, customerName
DailyReport       — id, date (unique), totalOrders, revenue, topItemsJson, closedAt, closedById
```

---

## API Endpoints

### Auth
| Method | Path               | Auth  | Description           |
|--------|--------------------|-------|-----------------------|
| POST   | /api/auth/register | Admin | Register user         |
| POST   | /api/auth/login    | —     | Login                 |
| GET    | /api/auth/me       | JWT   | Current user profile  |

### Users *(Admin only)*
| Method | Path                      | Description               |
|--------|---------------------------|---------------------------|
| GET    | /api/users                | List all users            |
| GET    | /api/users/activity-logs  | Get activity logs         |
| GET    | /api/users/:id            | Get single user           |
| POST   | /api/users                | Create user               |
| PUT    | /api/users/:id            | Update user               |
| PATCH  | /api/users/:id/password   | Change user password      |
| PATCH  | /api/users/:id/deactivate | Deactivate user account   |
| PATCH  | /api/users/:id/activate   | Reactivate user account   |

### Locations *(Admin only)*
| Method | Path                    | Description                     |
|--------|-------------------------|---------------------------------|
| GET    | /api/locations          | List all locations              |
| GET    | /api/locations/analytics| Cross-location analytics        |
| GET    | /api/locations/:id      | Get single location             |
| POST   | /api/locations          | Create location                 |
| PUT    | /api/locations/:id      | Update location                 |
| DELETE | /api/locations/:id      | Delete location                 |

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
| Method | Path                               | Auth  | Description                          |
|--------|------------------------------------|-------|--------------------------------------|
| GET    | /api/reservations                  | JWT   | List reservations (filterable)       |
| GET    | /api/reservations/upcoming         | JWT   | Get upcoming confirmed reservations  |
| GET    | /api/reservations/:id              | JWT   | Get single reservation               |
| POST   | /api/reservations                  | JWT   | Create reservation                   |
| PUT    | /api/reservations/:id              | JWT   | Update reservation                   |
| PATCH  | /api/reservations/:id/status       | JWT   | Update status (seat/cancel/no-show)  |
| DELETE | /api/reservations/:id              | Admin | Delete reservation                   |
| POST   | /api/reservations/process-no-shows | Admin | Mark overdue reservations as no-show |

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

### Print
| Method | Path                           | Auth | Description                        |
|--------|--------------------------------|------|------------------------------------|
| GET    | /api/print/order/:id           | JWT  | Kitchen ticket (JSON + text + HTML)|
| GET    | /api/print/order/:id/html      | JWT  | Kitchen ticket as printable HTML   |
| GET    | /api/print/receipt/:id         | JWT  | Receipt ticket (JSON + text + HTML)|
| GET    | /api/print/receipt/:id/html    | JWT  | Receipt as printable HTML          |

### Payments
| Method | Path                        | Auth  | Description           |
|--------|-----------------------------|-------|-----------------------|
| GET    | /api/payments               | JWT   | List payments         |
| GET    | /api/payments/:id           | JWT   | Get single payment    |
| GET    | /api/payments/unpaid-orders | JWT   | Get unpaid orders     |
| POST   | /api/payments               | JWT   | Process payment       |
| PATCH  | /api/payments/:id/status    | Admin | Update payment status |

### Suppliers & Purchase Orders *(Admin only)*
| Method | Path                                    | Description                          |
|--------|-----------------------------------------|--------------------------------------|
| GET    | /api/suppliers                          | List all suppliers                   |
| GET    | /api/suppliers/:id                      | Get supplier with items + PO history |
| POST   | /api/suppliers                          | Create supplier                      |
| PUT    | /api/suppliers/:id                      | Update supplier                      |
| DELETE | /api/suppliers/:id                      | Delete supplier                      |
| POST   | /api/suppliers/:id/items                | Link inventory item to supplier      |
| DELETE | /api/suppliers/:id/items/:invItemId     | Unlink inventory item                |
| GET    | /api/suppliers/purchase-orders/all      | List all purchase orders             |
| GET    | /api/suppliers/purchase-orders/:id      | Get single purchase order            |
| POST   | /api/suppliers/purchase-orders          | Create purchase order                |
| PATCH  | /api/suppliers/purchase-orders/:id/status | Update PO status (sent/cancelled)  |
| POST   | /api/suppliers/purchase-orders/:id/receive | Receive PO → auto-restock        |
| DELETE | /api/suppliers/purchase-orders/:id      | Delete purchase order                |

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

### Loyalty *(Admin only)*
| Method | Path                    | Description                         |
|--------|-------------------------|-------------------------------------|
| GET    | /api/loyalty            | List all loyalty customers          |
| GET    | /api/loyalty/summary    | Programme summary stats             |
| GET    | /api/loyalty/lookup     | Look up customer by phone           |
| GET    | /api/loyalty/:id        | Get customer detail + order history |
| PATCH  | /api/loyalty/:id/redeem | Redeem free item for customer       |

### Reports *(Admin only)*
| Method | Path                         | Description                     |
|--------|------------------------------|---------------------------------|
| GET    | /api/reports/revenue         | Revenue report for a date range |
| GET    | /api/reports/items           | Best/worst selling items        |
| GET    | /api/reports/staff           | Staff performance report        |
| GET    | /api/reports/export/orders   | Export orders as CSV            |
| GET    | /api/reports/export/payments | Export payments as CSV          |

### Shift Report *(Admin only)*
| Method | Path                          | Description                      |
|--------|-------------------------------|----------------------------------|
| GET    | /api/shift-report/preview     | Live preview of today's report   |
| GET    | /api/shift-report/history     | All archived daily reports       |
| GET    | /api/shift-report/history/:id | Single archived report           |
| POST   | /api/shift-report/close       | Close the day and archive report |

### Feedback
| Method | Path                       | Auth  | Description                       |
|--------|----------------------------|-------|-----------------------------------|
| POST   | /api/feedback              | —     | Submit feedback (public, no auth) |
| GET    | /api/feedback              | Admin | Get all feedback                  |
| GET    | /api/feedback/summary      | Admin | Rating summary + distribution     |
| GET    | /api/feedback/menu-ratings | Admin | Average ratings per menu item     |
| DELETE | /api/feedback/:id          | Admin | Delete a review                   |

### Dashboard
| Method | Path                         | Auth  | Description        |
|--------|------------------------------|-------|--------------------|
| GET    | /api/dashboard/analytics     | Admin | Full analytics     |
| GET    | /api/dashboard/staff-summary | JWT   | Staff summary      |

### Public *(no auth — for QR customer ordering and receipts)*
| Method | Path                        | Description                  |
|--------|-----------------------------|------------------------------|
| GET    | /api/public/menu            | Get available menu items     |
| GET    | /api/public/tables/:tableId | Get table info               |
| POST   | /api/public/orders          | Place order from QR scan     |
| GET    | /api/public/receipt/:id     | Get digital receipt          |

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
