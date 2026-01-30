import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { environment } from '@environments/environment';
import { LoginRequest, LoginResponse, User } from '../models/auth.models';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private readonly TOKEN_KEY = 'auth_token';
    private readonly USER_KEY = 'auth_user';

    // Use signals for reactive state
    currentUser = signal<User | null>(null);
    isAuthenticated = signal<boolean>(false);

    // BehaviorSubject for error messages
    private errorSubject = new BehaviorSubject<string | null>(null);
    error$ = this.errorSubject.asObservable();

    constructor(
        private router: Router,
        private http: HttpClient
    ) {
        this.checkToken();
    }

    /**
     * Login user with email and password
     */
    login(credentials: LoginRequest, rememberMe: boolean = false): Observable<LoginResponse> {
        this.clearError();

        return this.http.post<LoginResponse>(`${environment.apiUrl}/Auth/login`, credentials)
            .pipe(
                tap(response => {
                    this.setSession(response, rememberMe);
                }),
                catchError(error => this.handleError(error))
            );
    }

    /**
     * Logout user
     */
    logout(): void {
        this.clearSession();
        this.router.navigate(['/login']);
    }

    /**
     * Get stored token
     */
    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticatedUser(): boolean {
        const token = this.getToken();
        if (!token) {
            return false;
        }

        // TODO: Add token expiration check if using JWT
        // For now, just check if token exists
        return true;
    }

    /**
     * Clear error message
     */
    clearError(): void {
        this.errorSubject.next(null);
    }

    /**
     * Set session data after successful login
     */
    private setSession(response: LoginResponse, rememberMe: boolean): void {
        const storage = rememberMe ? localStorage : sessionStorage;

        const user: User = {
            id: response.userId,
            email: response.email,
            tenantId: response.tenantId,
            tenantName: response.tenantName,
            role: response.role,
            name: response.tenantName // Using tenantName as fallback for UI if name is missing
        };

        storage.setItem(this.TOKEN_KEY, response.token);
        storage.setItem(this.USER_KEY, JSON.stringify(user));

        this.isAuthenticated.set(true);
        this.currentUser.set(user);

        this.router.navigate(['/dashboard']);
    }

    /**
     * Clear session data
     */
    private clearSession(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        sessionStorage.removeItem(this.TOKEN_KEY);
        sessionStorage.removeItem(this.USER_KEY);

        this.isAuthenticated.set(false);
        this.currentUser.set(null);
    }

    /**
     * Check if token exists on app initialization
     */
    private checkToken(): void {
        const token = this.getToken();
        const userJson = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);

        if (token && userJson) {
            try {
                const user = JSON.parse(userJson) as User;
                this.isAuthenticated.set(true);
                this.currentUser.set(user);
            } catch (error) {
                this.clearSession();
            }
        }
    }

    /**
     * Handle HTTP errors
     */
    private handleError(error: HttpErrorResponse): Observable<never> {
        let errorMessage = 'Ocorreu um erro inesperado. Tente novamente.';

        if (error.error instanceof ErrorEvent) {
            // Client-side error
            errorMessage = `Erro: ${error.error.message}`;
        } else {
            // Server-side error
            if (error.status === 401) {
                errorMessage = 'Email ou senha inválidos.';
            } else if (error.status === 0) {
                errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
            } else if (error.error?.message) {
                errorMessage = error.error.message;
            }
        }

        this.errorSubject.next(errorMessage);
        return throwError(() => new Error(errorMessage));
    }
}
