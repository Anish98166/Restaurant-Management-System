import { TableStatus } from '@prisma/client';
export declare class CreateTableDto {
    tableNumber: number;
    capacity: number;
    status?: TableStatus;
}
declare const UpdateTableDto_base: import("@nestjs/common").Type<Partial<CreateTableDto>>;
export declare class UpdateTableDto extends UpdateTableDto_base {
}
export declare class UpdateTableStatusDto {
    status: TableStatus;
}
export {};
