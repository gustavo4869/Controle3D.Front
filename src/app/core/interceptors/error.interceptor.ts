import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
    const router = inject(Router);
    const authService = inject(AuthService);

    return next(req).pipe(
        catchError((error: HttpErrorResponse) => {
            if (error.status === 401) {
                // Unauthorized - session expired or invalid
                authService.logout();
                router.navigate(['/login']);
            } else if (error.status === 403) {
                // Forbidden - roles/permissions issue
                router.navigate(['/dashboard']);
                alert('Você não tem permissão para acessar este recurso.');
            } else if (error.status === 0) {
                // Connection error
                alert('Falha na conexão com o servidor. Verifique sua rede.');
            }

            return throwError(() => error);
        })
    );
};
