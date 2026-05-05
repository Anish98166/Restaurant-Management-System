"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_module_1 = require("./prisma/prisma.module");
const auth_module_1 = require("./auth/auth.module");
const menu_module_1 = require("./menu/menu.module");
const tables_module_1 = require("./tables/tables.module");
const orders_module_1 = require("./orders/orders.module");
const payments_module_1 = require("./payments/payments.module");
const dashboard_module_1 = require("./dashboard/dashboard.module");
const public_module_1 = require("./public/public.module");
const inventory_module_1 = require("./inventory/inventory.module");
const kds_module_1 = require("./kds/kds.module");
const modifiers_module_1 = require("./modifiers/modifiers.module");
const shift_report_module_1 = require("./shift-report/shift-report.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_1.PrismaModule,
            auth_module_1.AuthModule,
            menu_module_1.MenuModule,
            tables_module_1.TablesModule,
            orders_module_1.OrdersModule,
            payments_module_1.PaymentsModule,
            dashboard_module_1.DashboardModule,
            public_module_1.PublicModule,
            inventory_module_1.InventoryModule,
            kds_module_1.KdsModule,
            modifiers_module_1.ModifiersModule,
            shift_report_module_1.ShiftReportModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map