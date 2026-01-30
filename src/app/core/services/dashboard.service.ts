import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { DashboardStats } from '../models/dashboard.model';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/Dashboard`;

    getSummary(month: number): Observable<DashboardStats> {
        const params = new HttpParams()
            .set('month', month.toString());

        return this.http.get<DashboardStats>(`${this.apiUrl}/summary`, { params });
    }
}
