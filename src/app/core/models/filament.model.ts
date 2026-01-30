export interface Filament {
    id: string;
    tenantId: string;
    material: string; // PLA, ABS, PETG, etc.
    color: string;
    brand: string;
    weightG: number; // Current weight in grams
    costPerKg: number;
    notes: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date | null;
}
