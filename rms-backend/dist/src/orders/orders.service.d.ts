import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto, OrderQueryDto } from './dto/order.dto';
export declare class OrdersService {
    private prisma;
    constructor(prisma: PrismaService);
    private orderInclude;
    findAll(query: OrderQueryDto): Promise<{
        data: ({
            payment: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                status: import("@prisma/client").$Enums.PaymentStatus;
                orderId: string;
                amount: number;
                method: import("@prisma/client").$Enums.PaymentMethod;
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
                notes: string | null;
                quantity: number;
                unitPrice: number;
                orderId: string;
                menuItemId: string;
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
            orderNumber: number;
            notes: string | null;
            totalAmount: number;
            tableId: string;
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
            orderId: string;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
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
            notes: string | null;
            quantity: number;
            unitPrice: number;
            orderId: string;
            menuItemId: string;
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
        orderNumber: number;
        notes: string | null;
        totalAmount: number;
        tableId: string;
        staffId: string;
    }>;
    create(dto: CreateOrderDto, staffId: string): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
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
            notes: string | null;
            quantity: number;
            unitPrice: number;
            orderId: string;
            menuItemId: string;
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
        orderNumber: number;
        notes: string | null;
        totalAmount: number;
        tableId: string;
        staffId: string;
    }>;
    updateStatus(id: string, dto: UpdateOrderStatusDto): Promise<{
        payment: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.PaymentStatus;
            orderId: string;
            amount: number;
            method: import("@prisma/client").$Enums.PaymentMethod;
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
            notes: string | null;
            quantity: number;
            unitPrice: number;
            orderId: string;
            menuItemId: string;
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
        orderNumber: number;
        notes: string | null;
        totalAmount: number;
        tableId: string;
        staffId: string;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.OrderStatus;
        orderNumber: number;
        notes: string | null;
        totalAmount: number;
        tableId: string;
        staffId: string;
    }>;
}
