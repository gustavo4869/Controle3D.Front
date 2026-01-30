import { Order } from "./order.model";

export interface DashboardStats {
    counts: {
        new: number;
        inProduction: number;
        ready: number;
        shipped: number;
        delivered: number;
        cancelled: number;
    };
    financials: {
        monthlyBilling: number;
        monthlyMargin: number;
        billingGrowthPercent: number;
    };
    activeOrders: {
        inProduction: Order[];
        ready: Order[];
    };
}
