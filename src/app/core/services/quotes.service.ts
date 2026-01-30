import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Quote, QuoteRecalculateResponse, QuoteStatus } from '../models/quote.model';

@Injectable({
    providedIn: 'root'
})
export class QuotesService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/quotes`;

    getAll(status?: QuoteStatus, search?: string, from?: string, to?: string): Observable<Quote[]> {
        let params = new HttpParams();
        if (status) params = params.set('status', status);
        if (search) params = params.set('search', search);
        if (from) params = params.set('from', from);
        if (to) params = params.set('to', to);
        return this.http.get<Quote[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<Quote> {
        return this.http.get<Quote>(`${this.apiUrl}/${id}`);
    }

    create(quote: Partial<Quote>): Observable<Quote> {
        return this.http.post<Quote>(this.apiUrl, quote);
    }

    update(id: string, quote: Partial<Quote>): Observable<Quote> {
        return this.http.put<Quote>(`${this.apiUrl}/${id}`, quote);
    }

    recalculate(id: string, quote: Partial<Quote>): Observable<QuoteRecalculateResponse> {
        return this.http.post<QuoteRecalculateResponse>(`${this.apiUrl}/${id}/recalculate`, quote);
    }

    changeStatus(id: string, status: QuoteStatus): Observable<Quote> {
        return this.http.post<Quote>(`${this.apiUrl}/${id}/status`, { status });
    }
}
