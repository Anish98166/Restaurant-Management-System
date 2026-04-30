import { PrismaService } from '../prisma/prisma.service';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
export declare class PaymentsService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        order: {
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
                name: string;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        orderId: string;
    })[]>;
    findOne(id: string): Promise<{
        order: {
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        orderId: string;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
            tableId: string;
            orderNumber: number;
            totalAmount: number;
            staffId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        orderId: string;
    }>;
    updateStatus(id: string, dto: UpdatePaymentStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
        orderId: string;
    }>;
    getUnpaidOrders(): Promise<({
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
    })[]>;
}
