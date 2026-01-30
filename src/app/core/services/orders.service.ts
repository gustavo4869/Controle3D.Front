import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Order, OrderStatus } from '../models/order.model';

@Injectable({
    providedIn: 'root'
})
export class OrdersService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/Orders`;

    getAll(status?: OrderStatus, search?: string, from?: string, to?: string): Observable<Order[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (search) params = params.set('search', search);
        if (from) params = params.set('from', from);
        if (to) params = params.set('to', to);

        return this.http.get<Order[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<Order> {
        return this.http.get<Order>(`${this.apiUrl}/${id}`);
    }

    createFromQuote(quoteId: string): Observable<Order> {
        return this.http.post<Order>(`${this.apiUrl}/from-quote/${quoteId}`, {});
    }

    changeStatus(id: string, status: OrderStatus): Observable<Order> {
        return this.http.post<Order>(`${this.apiUrl}/${id}/status`, { status });
    }
}
