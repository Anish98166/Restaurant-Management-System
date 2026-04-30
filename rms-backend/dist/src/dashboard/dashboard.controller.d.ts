import { DashboardService } from './dashboard.service';
export declare class DashboardController {
    private dashboardService;
    constructor(dashboardService: DashboardService);
    getAnalytics(): Promise<{
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
        recentOrders: ({
            items: ({
                menuItem: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    price: number;
                    category: import("@prisma/client").$Enums.MenuCategory;
                    available: boolean;
                    imageUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                menuItemId: string;
                quantity: number;
                notes: string | null;
                orderId: string;
                unitPrice: number;
            })[];
            table: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tableNumber: number;
                capacity: number;
                status: import("@prisma/client").$Enums.TableStatus;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
            tableId: string;
            orderNumber: number;
            totalAmount: number;
            staffId: string;
        })[];
        topMenuItems: {
            menuItem: {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                description: string | null;
                price: number;
                category: import("@prisma/client").$Enums.MenuCategory;
                available: boolean;
                imageUrl: string | null;
            } | undefined;
            menuItemId: string;
            _sum: {
                quantity: number | null;
            };
        }[];
        ordersByStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.OrderGroupByOutputType, "status"[]> & {
            _count: {
                status: number;
            };
        })[];
        weeklyRevenue: {
            date: string;
            revenue: number;
        }[];
    }>;
    getStaffSummary(): Promise<{
        summary: {
            activeOrders: number;
            todayOrders: number;
            totalTables: number;
            occupiedTables: number;
            unpaidOrders: number;
        };
        recentOrders: ({
            items: ({
                menuItem: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    updatedAt: Date;
                    description: string | null;
                    price: number;
                    category: import("@prisma/client").$Enums.MenuCategory;
                    available: boolean;
                    imageUrl: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                menuItemId: string;
                quantity: number;
                notes: string | null;
                orderId: string;
                unitPrice: number;
            })[];
            table: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                tableNumber: number;
                capacity: number;
                status: import("@prisma/client").$Enums.TableStatus;
            };
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
            tableId: string;
            orderNumber: number;
            totalAmount: number;
            staffId: string;
        })[];
        ordersByStatus: (import("@prisma/client").Prisma.PickEnumerable<import("@prisma/client").Prisma.OrderGroupByOutputType, "status"[]> & {
            _count: {
                status: number;
            };
        })[];
    }>;
}
