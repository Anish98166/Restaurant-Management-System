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
- **Prisma v7** — ORM with PostgreSQL driver adapter
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

# Create environment file
# Create rms-backend/.env with:
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
- Real-time stock count shown per item so staff can see availability before ordering
- Status flow: Pending → Preparing → Served → Completed
- Optimistic updates via TanStack Query
- Sortable, filterable table with pagination
- Auto-polling every 30 seconds

### Menu Management
- Full CRUD for menu items (Admin only)
- Toggle availability with optimistic updates
- Stock column shows live inventory level per item
- Filter by category and search by name

### Table Management
- Visual grid of all tables with color-coded status (Available / Occupied / Reserved / Cleaning)
- Click any table to update its status
- Admin can add/delete tables
- **QR Code** button on every table — generates a scannable QR code customers use to order directly from their phone

### QR Customer Ordering
- Each table has a unique QR code linking to `/menu/[tableId]`
- Public page — no login required for customers
- Customers browse the full menu, add items to cart, enter their name and special requests, and place the order
- Order appears instantly in the staff orders list tagged as `(QR Order)`
- Table is automatically marked Occupied when a QR order is placed
- Stock is deducted from inventory just like a staff-placed order
- QR codes can be downloaded as SVG for printing

### Inventory Management *(Admin only)*
- Track stock levels for any menu item
- Set a unit (portion, kg, litre, etc.) and a low-stock alert threshold per item
- **Restock** — add quantity to current stock
- **Set Stock** — override to an exact quantity for manual corrections
- Stats cards: total tracked / in stock / low stock / out of stock
- Orange alert banner when items need attention
- When stock hits 0, the menu item is automatically marked unavailable — staff can no longer order it
- When restocked above 0, the menu item is automatically re-enabled
- Stock is deducted automatically on every order (staff-placed and QR)
- Items without inventory tracking are unaffected (untracked items remain orderable)

### Billing
- Unpaid orders alert panel
- Process payments (Cash / Card / Online)
- Full payment history (Admin only)
- Refund support

### Role-Based Access

| Feature              | Admin | Staff |
|----------------------|-------|-------|
| Dashboard analytics  | Full  | Summary |
| Menu CRUD            | ✅    | View only |
| Inventory management | ✅    | — |
| Table management     | ✅    | Status update only |
| Orders               | ✅    | ✅ |
| Billing              | ✅    | Process only |
| Settings             | ✅    | — |

---

## Data Model

```
User            — id, email, name, password, role (ADMIN | STAFF)
MenuItem        — id, name, description, price, category, available, imageUrl
InventoryItem   — id, menuItemId (1:1), quantity, unit, lowStockThreshold, lastRestockedAt
RestaurantTable — id, tableNumber, capacity, status
Order           — id, orderNumber, status, totalAmount, tableId, staffId, notes
OrderItem       — id, orderId, menuItemId, quantity, unitPrice, notes
Payment         — id, orderId (1:1), amount, method, status
```

---

## API Endpoints

### Auth
| Method | Path              | Description           | Auth |
|--------|-------------------|-----------------------|------|
| POST   | /api/auth/register | Register user        | —    |
| POST   | /api/auth/login    | Login                | —    |
| GET    | /api/auth/me       | Current user profile | JWT  |

### Menu
| Method | Path                              | Description                    | Auth       |
|--------|-----------------------------------|--------------------------------|------------|
| GET    | /api/menu                         | List menu items (filterable)   | JWT        |
| GET    | /api/menu/:id                     | Get single menu item           | JWT        |
| POST   | /api/menu                         | Create menu item               | Admin      |
| PUT    | /api/menu/:id                     | Update menu item               | Admin      |
| PATCH  | /api/menu/:id/toggle-availability | Toggle availability            | Admin      |
| DELETE | /api/menu/:id                     | Delete menu item               | Admin      |

### Tables
| Method | Path                    | Description          | Auth       |
|--------|-------------------------|----------------------|------------|
| GET    | /api/tables             | List all tables      | JWT        |
| GET    | /api/tables/:id         | Get single table     | JWT        |
| POST   | /api/tables             | Create table         | Admin      |
| PUT    | /api/tables/:id         | Update table         | Admin      |
| PATCH  | /api/tables/:id/status  | Update table status  | JWT        |
| DELETE | /api/tables/:id         | Delete table         | Admin      |

### Orders
| Method | Path                    | Description          | Auth       |
|--------|-------------------------|----------------------|------------|
| GET    | /api/orders             | List orders          | JWT        |
| GET    | /api/orders/:id         | Get single order     | JWT        |
| POST   | /api/orders             | Create order         | JWT        |
| PATCH  | /api/orders/:id/status  | Update order status  | JWT        |
| DELETE | /api/orders/:id         | Delete order         | Admin      |

### Payments
| Method | Path                         | Description           | Auth       |
|--------|------------------------------|-----------------------|------------|
| GET    | /api/payments                | List payments         | JWT        |
| GET    | /api/payments/:id            | Get single payment    | JWT        |
| GET    | /api/payments/unpaid-orders  | Get unpaid orders     | JWT        |
| POST   | /api/payments                | Process payment       | JWT        |
| PATCH  | /api/payments/:id/status     | Update payment status | Admin      |

### Inventory *(Admin only)*
| Method | Path                        | Description                    | Auth  |
|--------|-----------------------------|--------------------------------|-------|
| GET    | /api/inventory              | List all inventory items       | Admin |
| GET    | /api/inventory/low-stock    | Get low-stock items            | Admin |
| GET    | /api/inventory/:id          | Get single inventory item      | Admin |
| POST   | /api/inventory              | Start tracking a menu item     | Admin |
| PUT    | /api/inventory/:id          | Update unit / threshold        | Admin |
| PATCH  | /api/inventory/:id/restock  | Add stock                      | Admin |
| PATCH  | /api/inventory/:id/adjust   | Set exact stock quantity       | Admin |
| DELETE | /api/inventory/:id          | Stop tracking                  | Admin |

### Dashboard
| Method | Path                        | Description           | Auth  |
|--------|-----------------------------|-----------------------|-------|
| GET    | /api/dashboard/analytics    | Full analytics        | Admin |
| GET    | /api/dashboard/staff-summary| Staff summary         | JWT   |

### Public *(no auth — for QR customer ordering)*
| Method | Path                        | Description                    |
|--------|-----------------------------|--------------------------------|
| GET    | /api/public/menu            | Get available menu items       |
| GET    | /api/public/tables/:tableId | Get table info                 |
| POST   | /api/public/orders          | Place order from QR scan       |

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
PORT=3001                        # optional, defaults to 3001
FRONTEND_URL="http://localhost:3000"  # optional, for CORS
```
