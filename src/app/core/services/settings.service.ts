import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '@environments/environment';
import { TenantSettings } from '../models/tenant-settings.model';

@Injectable({
    providedIn: 'root'
})
export class SettingsService {
    private http = inject(HttpClient);
    private readonly apiUrl = `${environment.apiUrl}/settings`;

    getSettings(): Observable<TenantSettings> {
        return this.http.get<TenantSettings>(this.apiUrl);
    }

    updateSettings(settings: TenantSettings): Observable<void> {
        return this.http.put<void>(this.apiUrl, settings);
    }
}
