"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
const client_1 = require("@prisma/client");
let DashboardService = class DashboardService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getAnalytics() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [totalOrders, todayOrders, activeOrders, totalRevenue, todayRevenue, totalTables, occupiedTables, unpaidOrders, recentOrders, topMenuItems, ordersByStatus, weeklyRevenue,] = await Promise.all([
            this.prisma.order.count(),
            this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
            this.prisma.order.count({ where: { status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PREPARING, client_1.OrderStatus.SERVED] } } }),
            this.prisma.payment.aggregate({ where: { status: client_1.PaymentStatus.PAID }, _sum: { amount: true } }),
            this.prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.PAID, createdAt: { gte: today, lt: tomorrow } },
                _sum: { amount: true },
            }),
            this.prisma.restaurantTable.count(),
            this.prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
            this.prisma.order.count({
                where: { status: { in: [client_1.OrderStatus.SERVED, client_1.OrderStatus.COMPLETED] }, payment: null },
            }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { table: true, items: { include: { menuItem: true } } },
            }),
            this.prisma.orderItem.groupBy({
                by: ['menuItemId'],
                _sum: { quantity: true },
                orderBy: { _sum: { quantity: 'desc' } },
                take: 5,
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
            this.getWeeklyRevenue(),
        ]);
        const menuItemIds = topMenuItems.map((i) => i.menuItemId);
        const menuItems = await this.prisma.menuItem.findMany({ where: { id: { in: menuItemIds } } });
        const enrichedTopItems = topMenuItems.map((item) => ({
            ...item,
            menuItem: menuItems.find((m) => m.id === item.menuItemId),
        }));
        return {
            summary: {
                totalOrders,
                todayOrders,
                activeOrders,
                totalRevenue: totalRevenue._sum.amount ?? 0,
                todayRevenue: todayRevenue._sum.amount ?? 0,
                totalTables,
                occupiedTables,
                unpaidOrders,
            },
            recentOrders,
            topMenuItems: enrichedTopItems,
            ordersByStatus,
            weeklyRevenue,
        };
    }
    async getStaffSummary() {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const [activeOrders, todayOrders, totalTables, occupiedTables, unpaidOrders, recentOrders, ordersByStatus,] = await Promise.all([
            this.prisma.order.count({
                where: { status: { in: [client_1.OrderStatus.PENDING, client_1.OrderStatus.PREPARING, client_1.OrderStatus.SERVED] } },
            }),
            this.prisma.order.count({ where: { createdAt: { gte: today, lt: tomorrow } } }),
            this.prisma.restaurantTable.count(),
            this.prisma.restaurantTable.count({ where: { status: 'OCCUPIED' } }),
            this.prisma.order.count({
                where: { status: { in: [client_1.OrderStatus.SERVED, client_1.OrderStatus.COMPLETED] }, payment: null },
            }),
            this.prisma.order.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { table: true, items: { include: { menuItem: true } } },
            }),
            this.prisma.order.groupBy({
                by: ['status'],
                _count: { status: true },
            }),
        ]);
        return {
            summary: {
                activeOrders,
                todayOrders,
                totalTables,
                occupiedTables,
                unpaidOrders,
            },
            recentOrders,
            ordersByStatus,
        };
    }
    async getWeeklyRevenue() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setHours(0, 0, 0, 0);
            date.setDate(date.getDate() - i);
            const nextDate = new Date(date);
            nextDate.setDate(nextDate.getDate() + 1);
            const revenue = await this.prisma.payment.aggregate({
                where: { status: client_1.PaymentStatus.PAID, createdAt: { gte: date, lt: nextDate } },
                _sum: { amount: true },
            });
            days.push({
                date: date.toISOString().split('T')[0],
                revenue: revenue._sum.amount ?? 0,
            });
        }
        return days;
    }
};
exports.DashboardService = DashboardService;
exports.DashboardService = DashboardService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DashboardService);
//# sourceMappingURL=dashboard.service.js.map