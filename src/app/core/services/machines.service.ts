import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { Machine } from '../models/machine.model';

@Injectable({
    providedIn: 'root'
})
export class MachinesService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/machines`;

    getAll(): Observable<Machine[]> {
        return this.http.get<Machine[]>(this.apiUrl);
    }

    getById(id: string): Observable<Machine> {
        return this.http.get<Machine>(`${this.apiUrl}/${id}`);
    }

    create(machine: Partial<Machine>): Observable<Machine> {
        return this.http.post<Machine>(this.apiUrl, machine);
    }

    update(id: string, machine: Partial<Machine>): Observable<Machine> {
        return this.http.put<Machine>(`${this.apiUrl}/${id}`, machine);
    }

    inactivate(id: string): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
