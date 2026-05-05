# Bistro RMS — Backend

NestJS API server for the Bistro Restaurant Management System.

## Stack

- **NestJS** with TypeScript
- **Prisma v7** with PostgreSQL driver adapter (`@prisma/adapter-pg`)
- **PostgreSQL** database
- **JWT + Passport** authentication
- **Swagger** at `/api/docs`
- **class-validator** for DTO validation

## Setup

```bash
npm install

# Create .env (see root README for variables)
# Then:
npx prisma generate
npx prisma migrate deploy
npm run seed
npm run start:dev
```

Runs at **http://localhost:3001**

## Scripts

| Script              | Description                        |
|---------------------|------------------------------------|
| `npm run start:dev` | Watch mode (development)           |
| `npm run start`     | Single run                         |
| `npm run start:prod`| Production (from `dist/`)          |
| `npm run build`     | Compile TypeScript                 |
| `npm run seed`      | Seed database with demo data       |
| `npm run lint`      | ESLint                             |
| `npm run test`      | Unit tests                         |
| `npm run test:e2e`  | End-to-end tests                   |

## Module Structure

```
src/
├── auth/         JWT auth, guards, decorators, strategies
├── menu/         Menu item CRUD
├── tables/       Restaurant table management
├── orders/       Order lifecycle + inventory deduction
├── payments/     Payment processing
├── inventory/    Stock tracking (Admin only)
├── dashboard/    Analytics aggregation
├── public/       Unauthenticated endpoints for QR ordering
└── prisma/       PrismaService singleton
```

## Database

Schema is defined in `prisma/schema.prisma`. Migrations live in `prisma/migrations/`.

Key models: `User`, `MenuItem`, `InventoryItem`, `RestaurantTable`, `Order`, `OrderItem`, `Payment`

`InventoryItem` has a 1:1 relationship with `MenuItem`. When stock hits 0, the menu item is automatically set to `available: false`. Restocking above 0 re-enables it.
