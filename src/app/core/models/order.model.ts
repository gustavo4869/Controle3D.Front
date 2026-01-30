import { QuoteItem } from "./quote.model";

export enum OrderStatus {
    New = 'New',
    InProduction = 'InProduction',
    Ready = 'Ready',
    Shipped = 'Shipped',
    Delivered = 'Delivered',
    Cancelled = 'Cancelled'
}

export interface Order {
    id: string;
    tenantId: string;
    quoteId: string;
    customerId: string;
    customerName: string;
    orderNumber: string;
    status: OrderStatus;
    items: QuoteItem[];
    totalCost: number;
    finalPrice: number;
    createdAt: Date;
    updatedAt: Date | null;
}

export interface InsufficientInventoryError {
    missingMaterials: {
        filamentId: string;
        material: string;
        color: string;
        missingG: number;
    }[];
}
