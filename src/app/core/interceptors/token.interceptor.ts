import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const tokenInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const authService = inject(AuthService);
    const token = authService.getToken();

    let clonedReq = req;
    if (token) {
        clonedReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
    }

    return next(clonedReq).pipe(
        catchError((error: HttpErrorResponse) => {
            // Only logout on 401 if it's NOT the login endpoint
            if (error.status === 401 && !req.url.includes('/auth/login')) {
                console.warn('Unauthorized request - logging out');
                authService.logout();
            }

            // Let the error propagate to be handled by the calling service
            return throwError(() => error);
        })
    );
};
