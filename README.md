# 🍽️ Bistro RMS — Restaurant Management System

A full-stack Restaurant Management System built with **Next.js 15**, **NestJS**, **PostgreSQL**, **Prisma v7**, **TanStack Query**, and **TanStack Table**.

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
- **Prisma v7** — ORM with PostgreSQL adapter
- **PostgreSQL** — relational database
- **JWT** — authentication with role-based access (Admin / Staff)
- **Swagger** — auto-generated API docs at `/api/docs`

### Frontend
- **Next.js 15** (App Router) — React framework
- **TanStack Query v5** — server state, caching, optimistic updates
- **TanStack Table v8** — sortable, filterable, paginated tables
- **Recharts** — revenue and order analytics charts
- **Tailwind CSS v4** — warm restaurant-style design system
- **Axios** — HTTP client with JWT interceptors

---

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL running locally

### 1. Backend Setup

```bash
cd rms-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT_SECRET

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Seed the database
npm run seed

# Start development server
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

| Role  | Email                    | Password   |
|-------|--------------------------|------------|
| Admin | admin@restaurant.com     | admin123   |
| Staff | staff@restaurant.com     | staff123   |

---

## Features

### Dashboard
- Daily revenue, active orders, table occupancy stats
- Weekly revenue area chart
- Orders-by-status pie chart
- Recent orders and top-selling menu items

### Orders
- Create orders with table + menu item selection
- Real-time status flow: Pending → Preparing → Served → Completed
- Optimistic updates via TanStack Query
- Sortable, filterable TanStack Table with pagination
- Auto-polling every 30 seconds

### Menu Management
- Full CRUD for menu items (Admin only)
- Toggle availability with optimistic updates
- Filter by category and search by name
- Sortable TanStack Table

### Table Management
- Visual grid of all tables with color-coded status
- Click any table to update its status
- Admin can add/delete tables

### Billing
- Unpaid orders alert panel
- Process payments (Cash / Card / Online)
- Full payment history table

### Notifications
- Bell icon in topbar with live count
- Alerts for unpaid orders and pending orders

---

## API Endpoints

| Method | Path                        | Description                  |
|--------|-----------------------------|------------------------------|
| POST   | /api/auth/register          | Register user                |
| POST   | /api/auth/login             | Login                        |
| GET    | /api/auth/me                | Current user profile         |
| GET    | /api/menu                   | List menu items (filterable) |
| POST   | /api/menu                   | Create menu item (Admin)     |
| PUT    | /api/menu/:id               | Update menu item (Admin)     |
| PATCH  | /api/menu/:id/toggle-availability | Toggle availability   |
| DELETE | /api/menu/:id               | Delete menu item (Admin)     |
| GET    | /api/tables                 | List all tables              |
| POST   | /api/tables                 | Create table (Admin)         |
| PATCH  | /api/tables/:id/status      | Update table status          |
| GET    | /api/orders                 | List orders (filterable)     |
| POST   | /api/orders                 | Create order                 |
| PATCH  | /api/orders/:id/status      | Update order status          |
| GET    | /api/payments               | List payments                |
| POST   | /api/payments               | Process payment              |
| GET    | /api/payments/unpaid-orders | Get unpaid orders            |
| GET    | /api/dashboard/analytics    | Dashboard analytics          |

---

## Design System

| Token         | Value     | Usage                    |
|---------------|-----------|--------------------------|
| Warm Beige    | `#F5E6D3` | Backgrounds, borders     |
| Deep Brown    | `#4E342E` | Primary text, sidebar    |
| Soft Orange   | `#FF8A65` | Accents, CTAs, badges    |
| Cream         | `#FFF8F0` | Page background          |
| Light Brown   | `#8D6E63` | Secondary text           |
