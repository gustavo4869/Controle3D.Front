export interface Customer {
    id: string;
    tenantId: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    notes: string;
    createdAt: Date;
    updatedAt: Date | null;
}
