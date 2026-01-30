export enum MovementType {
    Adjustment = 'Adjustment',
    Consumption = 'Consumption',
    Entry = 'Entry'
}

export interface FilamentMovement {
    id: string;
    tenantId: string;
    filamentId: string;
    type: MovementType;
    quantityG: number; // Positive for entry/positive-adjustment, negative for consumption/negative-adjustment
    reason: string;
    createdAt: Date;
}

export interface WeightAdjustmentRequest {
    newWeightG: number;
    reason: string;
}
