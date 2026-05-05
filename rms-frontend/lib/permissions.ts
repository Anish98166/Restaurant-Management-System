import { User, Role } from '@/types';

/**
 * Central permission definitions.
 * All role checks go through here — never check role strings inline in components.
 */
export const can = {
  // Dashboard
  viewFullAnalytics: (user: User | null) => user?.role === 'ADMIN',
  viewStaffDashboard: (user: User | null) => !!user,

  // Menu
  viewMenu: (user: User | null) => !!user,
  manageMenu: (user: User | null) => user?.role === 'ADMIN', // create / edit / delete / toggle

  // Orders
  viewOrders: (user: User | null) => !!user,
  createOrder: (user: User | null) => !!user,
  advanceOrderStatus: (user: User | null) => !!user, // PENDING→PREPARING→SERVED→COMPLETED
  cancelOrder: (user: User | null) => user?.role === 'ADMIN',
  deleteOrder: (user: User | null) => user?.role === 'ADMIN',

  // Tables
  viewTables: (user: User | null) => !!user,
  updateTableStatus: (user: User | null) => !!user,
  manageTables: (user: User | null) => user?.role === 'ADMIN', // create / edit / delete

  // Billing
  processPayment: (user: User | null) => !!user,
  viewPaymentHistory: (user: User | null) => user?.role === 'ADMIN',
  refundPayment: (user: User | null) => user?.role === 'ADMIN',

  // Settings / User management
  manageUsers: (user: User | null) => user?.role === 'ADMIN',
  viewSettings: (user: User | null) => !!user,

  // Inventory
  manageInventory: (user: User | null) => user?.role === 'ADMIN',
} as const;

export function isAdmin(user: User | null): boolean {
  return user?.role === 'ADMIN';
}

export function isStaff(user: User | null): boolean {
  return user?.role === 'STAFF';
}
