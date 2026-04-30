import { PaymentMethod, PaymentStatus } from '@prisma/client';
export declare class CreatePaymentDto {
    orderId: string;
    method: PaymentMethod;
    amount?: number;
}
export declare class UpdatePaymentStatusDto {
    status: PaymentStatus;
}
