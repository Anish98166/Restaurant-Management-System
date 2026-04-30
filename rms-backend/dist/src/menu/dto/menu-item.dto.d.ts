import { MenuCategory } from '@prisma/client';
export declare class CreateMenuItemDto {
    name: string;
    description?: string;
    price: number;
    category: MenuCategory;
    available?: boolean;
    imageUrl?: string;
}
declare const UpdateMenuItemDto_base: import("@nestjs/common").Type<Partial<CreateMenuItemDto>>;
export declare class UpdateMenuItemDto extends UpdateMenuItemDto_base {
}
export declare class MenuItemQueryDto {
    category?: MenuCategory;
    available?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
export {};
