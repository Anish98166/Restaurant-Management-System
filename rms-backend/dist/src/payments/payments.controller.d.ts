import { PaymentsService } from './payments.service';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
export declare class PaymentsController {
    private paymentsService;
    constructor(paymentsService: PaymentsService);
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
            orderNumber: number;
            notes: string | null;
            totalAmount: number;
            tableId: string;
            staffId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
    })[]>;
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
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
    }>;
    create(dto: CreatePaymentDto): Promise<{
        order: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            orderNumber: number;
            notes: string | null;
            totalAmount: number;
            tableId: string;
            staffId: string;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
    }>;
    updateStatus(id: string, dto: UpdatePaymentStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        status: import("@prisma/client").$Enums.PaymentStatus;
        orderId: string;
        amount: number;
        method: import("@prisma/client").$Enums.PaymentMethod;
    }>;
}
