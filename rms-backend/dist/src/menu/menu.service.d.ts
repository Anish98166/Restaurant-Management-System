import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto } from './dto/menu-item.dto';
export declare class MenuService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(query: MenuItemQueryDto): Promise<{
        data: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            category: import("@prisma/client").$Enums.MenuCategory;
            available: boolean;
            imageUrl: string | null;
        }[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.MenuCategory;
        available: boolean;
        imageUrl: string | null;
    }>;
    create(dto: CreateMenuItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.MenuCategory;
        available: boolean;
        imageUrl: string | null;
    }>;
    update(id: string, dto: UpdateMenuItemDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.MenuCategory;
        available: boolean;
        imageUrl: string | null;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.MenuCategory;
        available: boolean;
        imageUrl: string | null;
    }>;
    toggleAvailability(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        price: number;
        category: import("@prisma/client").$Enums.MenuCategory;
        available: boolean;
        imageUrl: string | null;
    }>;
}
