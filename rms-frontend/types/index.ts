export type Role = 'ADMIN' | 'STAFF';
export type OrderStatus = 'PENDING' | 'PREPARING' | 'SERVED' | 'COMPLETED' | 'CANCELLED';
export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING';
export type PaymentStatus = 'PENDING' | 'PAID' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';
export type MenuCategory = 'APPETIZER' | 'MAIN_COURSE' | 'DESSERT' | 'BEVERAGE' | 'SPECIAL';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Modifier {
  id: string;
  modifierGroupId: string;
  name: string;
  priceAdjustment: number;
  available: boolean;
  createdAt: string;
}

export interface ModifierGroup {
  id: string;
  menuItemId: string;
  name: string;
  required: boolean;
  multiSelect: boolean;
  createdAt: string;
  updatedAt: string;
  modifiers: Modifier[];
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  category: MenuCategory;
  available: boolean;
  imageUrl?: string;
  inventoryItem?: InventoryItem | null;
  modifierGroups?: ModifierGroup[];
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  menuItemId: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
  lastRestockedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RestaurantTable {
  id: string;
  tableNumber: number;
  capacity: number;
  status: TableStatus;
  orders?: Order[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItemModifier {
  id: string;
  modifierId: string;
  name: string;
  priceAdjustment: number;
}

export interface OrderItem {
  id: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
  menuItemId: string;
  menuItem: MenuItem;
  orderId: string;
  modifiers: OrderItemModifier[];
}

export interface Payment {
  id: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  orderId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  notes?: string;
  totalAmount: number;
  tableId: string;
  table: RestaurantTable;
  staffId: string;
  staff: Pick<User, 'id' | 'name' | 'email' | 'role'>;
  items: OrderItem[];
  payment?: Payment;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DashboardAnalytics {
  summary: {
    totalOrders: number;
    todayOrders: number;
    activeOrders: number;
    totalRevenue: number;
    todayRevenue: number;
    totalTables: number;
    occupiedTables: number;
    unpaidOrders: number;
  };
  recentOrders: Order[];
  topMenuItems: Array<{
    menuItemId: string;
    _sum: { quantity: number };
    menuItem: MenuItem;
  }>;
  ordersByStatus: Array<{ status: OrderStatus; _count: { status: number } }>;
  weeklyRevenue: Array<{ date: string; revenue: number }>;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export type ReservationStatus = 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';

export interface Reservation {
  id: string;
  tableId: string;
  table: Pick<RestaurantTable, 'id' | 'tableNumber' | 'capacity' | 'status'>;
  guestName: string;
  phone: string;
  partySize: number;
  date: string;
  time: string;
  notes?: string;
  status: ReservationStatus;
  createdById: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  orderId: string;
  rating: number;
  comment?: string;
  customerName?: string;
  createdAt: string;
  order?: {
    orderNumber: number;
    createdAt: string;
    table: { tableNumber: number };
  };
}

export interface FeedbackSummary {
  totalReviews: number;
  avgRating: number;
  distribution: Record<number, number>;
}

export interface MenuItemRating {
  menuItemId: string;
  name: string;
  avgRating: number;
  count: number;
}

export interface RevenueReport {
  startDate: string;
  endDate: string;
  totalRevenue: number;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  byMethod: { CASH: number; CARD: number; ONLINE: number };
  daily: Array<{ date: string; revenue: number }>;
}

export interface ItemPerformanceReport {
  startDate: string;
  endDate: string;
  best: Array<{ menuItemId: string; name: string; category: string; quantity: number; revenue: number }>;
  worst: Array<{ menuItemId: string; name: string; category: string; quantity: number; revenue: number }>;
}

export interface StaffPerformanceReport {
  startDate: string;
  endDate: string;
  staff: Array<{
    staffId: string; name: string; role: string;
    totalOrders: number; completedOrders: number; cancelledOrders: number; revenue: number;
  }>;
}

export interface DailyReport {
  id: string;
  date: string;
  totalOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  onlineRevenue: number;
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  paymentBreakdown: Array<{ method: string; amount: number; count: number }>;
  closedAt: string;
  closedById: string;
}
