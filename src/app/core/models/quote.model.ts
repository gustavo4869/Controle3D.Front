export enum QuoteStatus {
    Draft = 'Draft',
    Sent = 'Sent',
    Approved = 'Approved',
    Rejected = 'Rejected'
}

export enum AdjustmentType {
    None = 'None',
    Value = 'Value',
    Percent = 'Percent'
}

export interface QuoteMaterial {
    filamentId: string;
    weightG: number;
    // Calculated fields from backend
    cost?: number;
    filamentName?: string;
    filamentColor?: string;
}

export interface QuoteItem {
    id: string;
    machineId: string;
    description: string;
    quantity: number;
    printMinutes: number;
    postMinutes: number; // Post-processing time
    riskPercent: number; // Margin for failure risk
    packagingCost: number;
    materials: QuoteMaterial[];

    // Calculated fields from backend
    machineName?: string;
    totalMachineCost?: number;
    totalMaterialCost?: number;
    totalItemCost?: number;
    unitPrice?: number;
    totalPrice?: number;
}

export interface Quote {
    id: string;
    tenantId: string;
    customerId: string;
    customerName?: string; // Virtual field
    status: QuoteStatus;
    quoteNumber: string;
    marginPercent: number;

    adjustmentType: AdjustmentType;
    adjustmentValue: number;

    notes: string;

    items: QuoteItem[];

    // Summary fields from backend
    totalCost?: number;
    suggestedPrice?: number; // Cost + margin
    finalPrice?: number;     // Suggested + adjustment

    createdAt: Date;
    updatedAt: Date | null;
}

export interface QuoteRecalculateResponse {
    suggestedPrice: number;
    finalPrice: number;
    totalCost: number;
    items: Partial<QuoteItem>[];
}
