import { PrismaService } from '../prisma/prisma.service';
import { CreateTableDto, UpdateTableDto, UpdateTableStatusDto } from './dto/table.dto';
export declare class TablesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        orders: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            status: import("@prisma/client").$Enums.OrderStatus;
            notes: string | null;
            tableId: string;
            orderNumber: number;
            totalAmount: number;
            staffId: string;
        }[];
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: number;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
    })[]>;
    findOne(id: string): Promise<{
        orders: ({
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
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: number;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
    }>;
    create(dto: CreateTableDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: number;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
    }>;
    update(id: string, dto: UpdateTableDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: number;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
    }>;
    updateStatus(id: string, dto: UpdateTableStatusDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: number;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
    }>;
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        tableNumber: number;
        capacity: number;
        status: import("@prisma/client").$Enums.TableStatus;
    }>;
}
