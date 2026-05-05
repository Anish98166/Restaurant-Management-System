import { MenuService } from './menu.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto } from './dto/menu-item.dto';
export declare class MenuController {
    private menuService;
    constructor(menuService: MenuService);
    findAll(query: MenuItemQueryDto): Promise<{
        data: ({
            inventoryItem: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                menuItemId: string;
                quantity: number;
                unit: string;
                lowStockThreshold: number;
                lastRestockedAt: Date | null;
            } | null;
            modifierGroups: ({
                modifiers: {
                    id: string;
                    name: string;
                    createdAt: Date;
                    available: boolean;
                    modifierGroupId: string;
                    priceAdjustment: number;
                }[];
            } & {
                id: string;
                name: string;
                createdAt: Date;
                updatedAt: Date;
                required: boolean;
                menuItemId: string;
                multiSelect: boolean;
            })[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            price: number;
            category: import("@prisma/client").$Enums.MenuCategory;
            available: boolean;
            imageUrl: string | null;
        })[];
        meta: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }>;
    findOne(id: string): Promise<{
        inventoryItem: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            menuItemId: string;
            quantity: number;
            unit: string;
            lowStockThreshold: number;
            lastRestockedAt: Date | null;
        } | null;
        modifierGroups: ({
            modifiers: {
                id: string;
                name: string;
                createdAt: Date;
                available: boolean;
                modifierGroupId: string;
                priceAdjustment: number;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            required: boolean;
            menuItemId: string;
            multiSelect: boolean;
        })[];
    } & {
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
        inventoryItem: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            menuItemId: string;
            quantity: number;
            unit: string;
            lowStockThreshold: number;
            lastRestockedAt: Date | null;
        } | null;
        modifierGroups: ({
            modifiers: {
                id: string;
                name: string;
                createdAt: Date;
                available: boolean;
                modifierGroupId: string;
                priceAdjustment: number;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            required: boolean;
            menuItemId: string;
            multiSelect: boolean;
        })[];
    } & {
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
        inventoryItem: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            menuItemId: string;
            quantity: number;
            unit: string;
            lowStockThreshold: number;
            lastRestockedAt: Date | null;
        } | null;
        modifierGroups: ({
            modifiers: {
                id: string;
                name: string;
                createdAt: Date;
                available: boolean;
                modifierGroupId: string;
                priceAdjustment: number;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            required: boolean;
            menuItemId: string;
            multiSelect: boolean;
        })[];
    } & {
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
        inventoryItem: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            menuItemId: string;
            quantity: number;
            unit: string;
            lowStockThreshold: number;
            lastRestockedAt: Date | null;
        } | null;
        modifierGroups: ({
            modifiers: {
                id: string;
                name: string;
                createdAt: Date;
                available: boolean;
                modifierGroupId: string;
                priceAdjustment: number;
            }[];
        } & {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            required: boolean;
            menuItemId: string;
            multiSelect: boolean;
        })[];
    } & {
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
}
