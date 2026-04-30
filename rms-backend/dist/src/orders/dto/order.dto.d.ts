import { OrderStatus } from '@prisma/client';
export declare class OrderItemDto {
    menuItemId: string;
    quantity: number;
    notes?: string;
}
export declare class CreateOrderDto {
    tableId: string;
    notes?: string;
    items: OrderItemDto[];
}
export declare class UpdateOrderStatusDto {
    status: OrderStatus;
}
export declare class OrderQueryDto {
    status?: OrderStatus;
    tableId?: string;
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
}
