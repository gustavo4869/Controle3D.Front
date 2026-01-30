import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Customer } from '../models/customer.model';

@Injectable({
    providedIn: 'root'
})
export class CustomersService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/customers`;

    getAll(search?: string): Observable<Customer[]> {
        const params: any = {};
        if (search) params.search = search;
        return this.http.get<Customer[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<Customer> {
        return this.http.get<Customer>(`${this.apiUrl}/${id}`);
    }

    create(customer: Partial<Customer>): Observable<Customer> {
        return this.http.post<Customer>(this.apiUrl, customer);
    }

    update(id: string, customer: Partial<Customer>): Observable<Customer> {
        return this.http.put<Customer>(`${this.apiUrl}/${id}`, customer);
    }

    inactivate(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
