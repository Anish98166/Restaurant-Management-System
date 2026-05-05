import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { MenuModule } from './menu/menu.module';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';
import { PaymentsModule } from './payments/payments.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { PublicModule } from './public/public.module';
import { InventoryModule } from './inventory/inventory.module';
import { KdsModule } from './kds/kds.module';
import { ModifiersModule } from './modifiers/modifiers.module';
import { ShiftReportModule } from './shift-report/shift-report.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    MenuModule,
    TablesModule,
    OrdersModule,
    PaymentsModule,
    DashboardModule,
    PublicModule,
    InventoryModule,
    KdsModule,
    ModifiersModule,
    ShiftReportModule,
  ],
})
export class AppModule {}
