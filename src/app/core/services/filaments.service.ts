import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Filament } from '../models/filament.model';
import { FilamentMovement, WeightAdjustmentRequest } from '../models/movement.model';

@Injectable({
    providedIn: 'root'
})
export class FilamentsService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/filaments/rolls`;

    getAll(search?: string): Observable<Filament[]> {
        const params: any = {};
        if (search) params.search = search;
        return this.http.get<Filament[]>(this.apiUrl, { params });
    }

    getById(id: string): Observable<Filament> {
        return this.http.get<Filament>(`${this.apiUrl}/${id}`);
    }

    create(filament: Partial<Filament>): Observable<Filament> {
        return this.http.post<Filament>(this.apiUrl, filament);
    }

    update(id: string, filament: Partial<Filament>): Observable<Filament> {
        return this.http.put<Filament>(`${this.apiUrl}/${id}`, filament);
    }

    delete(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    getMovements(filamentId: string): Observable<FilamentMovement[]> {
        return this.http.get<FilamentMovement[]>(`${this.apiUrl}/${filamentId}/movements`);
    }

    adjustWeight(filamentId: string, adjustment: WeightAdjustmentRequest): Observable<Filament> {
        return this.http.post<Filament>(`${this.apiUrl}/${filamentId}/adjust`, adjustment);
    }
}
