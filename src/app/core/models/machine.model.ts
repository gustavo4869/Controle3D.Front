export interface Machine {
    id: string;
    tenantId: string;
    name: string;
    model: string;
    manufacturer: string;
    serialNumber: string;
    costPerHour: number;
    notes: string;
    createdAt: Date;
    updatedAt: Date | null;
}
