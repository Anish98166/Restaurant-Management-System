import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
export declare class OrdersController {
    private ordersService;
    constructor(ordersService: OrdersService);
    findAll(query: OrderQueryDto): Promise<{
        data: ({
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.PaymentStatus;
                amount: number;
                method: import("@prisma/client").$Enums.PaymentMethod;
                orderId: string;
            } | null;
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
            staff: {
                id: string;
                email: string;
                name: string;
                role: import("@prisma/client").$Enums.Role;
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
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            orderId: string;
        } | null;
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
        staff: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
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
    }>;
    create(dto: CreateOrderDto, staffId: string): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            orderId: string;
        } | null;
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
        staff: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
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
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
            orderId: string;
        } | null;
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
        staff: {
            id: string;
            email: string;
            name: string;
            role: import("@prisma/client").$Enums.Role;
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
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        notes: string | null;
        tableId: string;
        orderNumber: number;
        totalAmount: number;
        staffId: string;
    }>;
}
