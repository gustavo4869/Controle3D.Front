import { HttpInterceptorFn, HttpRequest, HttpResponse, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { of, delay, throwError } from 'rxjs';

/**
 * Mock API Interceptor for Development
 * Simulates backend API responses for authentication
 */
export const mockApiInterceptor: HttpInterceptorFn = (req, next) => {
    const { url, method } = req;

    // Mock Login Endpoint
    if (url.includes('/api/Auth/login') && method === 'POST') {
        const body = req.body as any;
        return of(null).pipe(
            delay(800),
            () => {
                if (body.email && body.password) {
                    return of(new HttpResponse({
                        status: 200,
                        body: {
                            token: 'mock-jwt-token-' + Date.now(),
                            userId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            email: body.email,
                            tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                            tenantName: 'Demo Company',
                            role: 'Owner'
                        }
                    }));
                }
                return throwError(() => ({ status: 401, error: { message: 'Invalid email or password' } }));
            }
        );
    }

    // Health Check
    if (url.endsWith('/health')) {
        return of(new HttpResponse({ status: 200, body: 'Healthy' })).pipe(delay(200));
    }

    // Bootstrap
    if (url.includes('/api/bootstrap/initialize') && method === 'POST') {
        return of(new HttpResponse({
            status: 201,
            body: {
                message: "System initialized successfully",
                credentials: { email: "admin@demo.com", password: "Admin@123" }
            }
        })).pipe(delay(1000));
    }

    // Mock Settings
    if (url.includes('/api/settings')) {
        if (method === 'GET') {
            return of(new HttpResponse({
                status: 200,
                body: {
                    id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    tenantId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
                    timeZone: 'America/Sao_Paulo',
                    currency: 'BRL',
                    dateFormat: 'dd/MM/yyyy',
                    language: 'pt-BR',
                    maxUsers: 20
                }
            })).pipe(delay(500));
        }
        if (method === 'PUT') {
            return of(new HttpResponse({ status: 200, body: req.body })).pipe(delay(800));
        }
    }

    // Mock Customers
    if (url.includes('/api/customers')) {
        if (method === 'GET') {
            const mockCustomers = [
                {
                    id: '1', tenantId: 'T1', name: 'Acme Corporation', email: 'contact@acme.com',
                    phone: '+55 11 98765-4321', address: 'Rua das Flores, 123', city: 'São Paulo',
                    state: 'SP', zipCode: '01234-567', country: 'Brazil', notes: 'Cliente VIP',
                    createdAt: new Date(), updatedAt: null
                },
                {
                    id: '2', tenantId: 'T1', name: 'Global Industries', email: 'info@global.com',
                    phone: '+55 21 3333-4444', address: 'Av. Brasil, 500', city: 'Rio de Janeiro',
                    state: 'RJ', zipCode: '20000-000', country: 'Brazil', notes: '',
                    createdAt: new Date(), updatedAt: null
                }
            ];
            return of(new HttpResponse({ status: 200, body: mockCustomers })).pipe(delay(500));
        }
    }

    // Mock Machines
    if (url.includes('/api/machines')) {
        if (method === 'GET') {
            const mockMachines = [
                {
                    id: '1', tenantId: 'T1', name: 'Impressora 3D Pro', model: 'X1-Carbon',
                    manufacturer: 'Bambu Lab', serialNumber: 'BL-2024-001', costPerHour: 150.50,
                    notes: 'Máquina principal', createdAt: new Date(), updatedAt: null
                }
            ];
            return of(new HttpResponse({ status: 200, body: mockMachines })).pipe(delay(500));
        }
    }

    // Mock Filaments
    if (url.includes('/api/filaments/rolls')) {
        if (method === 'GET' && !url.includes('/movements')) {
            const mockFilaments = [
                { id: 'F1', tenantId: 'T1', material: 'PLA', color: 'Preto', brand: '3D Lab', weightG: 850.5, costPerKg: 120.00, isActive: true, notes: 'Lote A1', createdAt: new Date(), updatedAt: null },
                { id: 'F2', tenantId: 'T1', material: 'PETG', color: 'Azul Translucido', brand: 'Esun', weightG: 420.0, costPerKg: 160.00, isActive: true, notes: '', createdAt: new Date(), updatedAt: null },
                { id: 'F3', tenantId: 'T1', material: 'ABS', color: 'Branco', brand: 'Voolt3D', weightG: 0, costPerKg: 95.00, isActive: false, notes: 'Acabou', createdAt: new Date(), updatedAt: null }
            ];
            return of(new HttpResponse({ status: 200, body: mockFilaments })).pipe(delay(500));
        }

        if (method === 'GET' && url.includes('/movements')) {
            const mockMovements = [
                { id: 'M1', tenantId: 'T1', filamentId: 'F1', type: 'Entry', quantityG: 1000, reason: 'Compra inicial', createdAt: new Date() },
                { id: 'M2', tenantId: 'T1', filamentId: 'F1', type: 'Consumption', quantityG: -149.5, reason: 'Impressão #44', createdAt: new Date() }
            ];
            return of(new HttpResponse({ status: 200, body: mockMovements })).pipe(delay(400));
        }

        if (url.includes('/adjust') && method === 'POST') {
            const body = req.body as any;
            return of(new HttpResponse({
                status: 200,
                body: { id: 'F1', weightG: body.newWeightG, updatedAt: new Date() }
            })).pipe(delay(800));
        }

        if (method === 'POST') {
            return of(new HttpResponse({ status: 201, body: { id: Date.now().toString(), ...(req.body as any), createdAt: new Date() } })).pipe(delay(800));
        }
        if (method === 'PUT') {
            return of(new HttpResponse({ status: 200, body: { ...(req.body as any), updatedAt: new Date() } })).pipe(delay(800));
        }
        if (method === 'DELETE') {
            return of(new HttpResponse({ status: 204 })).pipe(delay(500));
        }
    }

    // Mock Quotes
    if (url.includes('/api/quotes')) {
        if (method === 'GET' && !url.includes('/status')) {
            const mockQuotes = [
                { id: 'Q1', quoteNumber: '2024-001', customerName: 'Acme Corp', status: 'Draft', totalCost: 150.0, finalPrice: 200.0, createdAt: new Date() },
                { id: 'Q2', quoteNumber: '2024-002', customerName: 'Global Ind', status: 'Sent', totalCost: 450.0, finalPrice: 650.0, createdAt: new Date() }
            ];
            return of(new HttpResponse({ status: 200, body: mockQuotes })).pipe(delay(500));
        }

        if (url.includes('/recalculate') && method === 'POST') {
            const quote = req.body as any;
            let totalCost = 0;

            const processedItems = (quote.items || []).map((item: any) => {
                const machineCost = (item.printMinutes / 60) * 150.50;
                const materialCost = (item.materials || []).reduce((acc: number, m: any) => {
                    return acc + (m.weightG * 120.00 / 1000);
                }, 0);

                const itemBaseCost = machineCost + materialCost + (item.packagingCost || 0);
                const itemTotalCost = itemBaseCost * (1 + (item.riskPercent || 0) / 100);
                totalCost += (itemTotalCost * (item.quantity || 1));

                return {
                    ...item,
                    totalMachineCost: machineCost,
                    totalMaterialCost: materialCost,
                    totalItemCost: itemTotalCost,
                    totalPrice: itemTotalCost * (1 + (quote.marginPercent || 0) / 100)
                };
            });

            const suggestedPrice = totalCost * (1 + (quote.marginPercent || 0) / 100);
            let finalPrice = suggestedPrice;

            if (quote.adjustmentType === 'Value') finalPrice += (quote.adjustmentValue || 0);
            if (quote.adjustmentType === 'Percent') finalPrice *= (1 + (quote.adjustmentValue || 0) / 100);

            return of(new HttpResponse({
                status: 200,
                body: { totalCost, suggestedPrice, finalPrice, items: processedItems }
            })).pipe(delay(1000));
        }

        if (method === 'POST') {
            return of(new HttpResponse({ status: 201, body: { id: 'new-quote-id', ...(req.body as any), quoteNumber: '2024-XXX', createdAt: new Date() } })).pipe(delay(800));
        }
        if (method === 'PUT') {
            return of(new HttpResponse({ status: 200, body: { ...(req.body as any), updatedAt: new Date() } })).pipe(delay(800));
        }
    }

    // Mock Orders
    if (url.includes('/api/Orders')) {
        if (method === 'GET' && !url.includes('/status')) {
            const mockOrders = [
                { id: 'O1', orderNumber: 'ORD-2024-001', customerName: 'Acme Corp', status: 'New', totalCost: 150.0, finalPrice: 200.0, createdAt: new Date() },
                { id: 'O2', orderNumber: 'ORD-2024-002', customerName: 'Global Ind', status: 'InProduction', totalCost: 450.0, finalPrice: 650.0, createdAt: new Date() }
            ];
            return of(new HttpResponse({ status: 200, body: mockOrders })).pipe(delay(500));
        }

        if (url.includes('/from-quote') && method === 'POST') {
            return of(new HttpResponse({
                status: 201,
                body: { id: 'O' + Date.now(), orderNumber: 'ORD-GEN-001', status: 'New', customerName: 'Cliente do Orçamento', createdAt: new Date() }
            })).pipe(delay(800));
        }

        if (url.includes('/status') && method === 'POST') {
            const body = req.body as any;
            if (body.status === 'InProduction' && url.includes('ORD-2024-001')) {
                return throwError(() => new HttpErrorResponse({
                    status: 400,
                    statusText: 'Bad Request',
                    error: {
                        missingMaterials: [
                            { filamentId: 'F1', material: 'PLA', color: 'Preto', missingG: 150.5 }
                        ]
                    }
                })).pipe(delay(600));
            }
            return of(new HttpResponse({ status: 200, body: { status: body.status, updatedAt: new Date() } })).pipe(delay(700));
        }

        if (method === 'GET') {
            return of(new HttpResponse({
                status: 200,
                body: {
                    id: 'O1', orderNumber: 'ORD-2024-001', customerName: 'Acme Corp', status: 'New',
                    items: [
                        { description: 'Peça Mock', quantity: 2, printMinutes: 120, materials: [{ filamentId: 'F1', filamentName: 'PLA', filamentColor: 'Preto', weightG: 100 }] }
                    ],
                    totalCost: 150.0, finalPrice: 220.0, createdAt: new Date()
                }
            })).pipe(delay(500));
        }
    }

    // Mock Dashboard
    if (url.includes('/api/Dashboard/summary')) {
        const stats = {
            counts: {
                new: 3,
                inProduction: 2,
                ready: 1,
                shipped: 5,
                delivered: 12,
                cancelled: 1
            },
            financials: {
                monthlyBilling: 2450.75,
                monthlyMargin: 850.20,
                billingGrowthPercent: 12.5
            },
            activeOrders: {
                inProduction: [
                    { id: 'O2', orderNumber: 'ORD-2024-002', customerName: 'Global Ind', status: 'InProduction', finalPrice: 650.0, createdAt: new Date() }
                ],
                ready: [
                    { id: 'O3', orderNumber: 'ORD-2024-003', customerName: 'Local Shop', status: 'Ready', finalPrice: 120.0, createdAt: new Date() }
                ]
            }
        };
        return of(new HttpResponse({ status: 200, body: stats })).pipe(delay(600));
    }

    // For all other requests, pass through to real backend
    return next(req);
};
