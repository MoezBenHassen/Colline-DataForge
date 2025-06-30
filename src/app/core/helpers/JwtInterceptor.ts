// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../../services/auth/auth.service'; // Make sure this path is correct

/**
 * A modern, functional HTTP interceptor that attaches the JWT to outgoing requests.
 */
export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
    // This console log WILL now appear in your browser's developer console
    console.log('JWT Interceptor running for request:', req.url);

    // Inject services using the modern `inject` function
    const authService = inject(AuthService);
    const token = authService.getToken();

    // If a token exists, clone the request and add the Authorization header
    if (token) {
        const authReq = req.clone({
            setHeaders: {
                Authorization: `Bearer ${token}`
            }
        });
        // Pass the cloned request with the header to the next handler
        return next(authReq);
    }

    // If there's no token, pass the original request along
    return next(req);
};
