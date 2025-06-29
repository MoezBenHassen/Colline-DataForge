// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {API} from '../../core/constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { TokenService } from '../token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'jwt_token';
    private readonly LOGIN_URL = '/api/auth/login'; // adjust if needed

    constructor(private http: HttpClient, private router: Router) {}

    login(username: string, password: string, rememberMe = false): Observable<any> {
        // The URL endpoint from your Spring Boot app
        const URL = environment.apiUrl + '/auth/login';
        const body = new URLSearchParams();
        body.set('username', username);
        body.set('password', password);

        return this.http.post<{ token: string }>(URL, body.toString(), {
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        }).pipe(
            tap(response => {
                // Save the token to the correct storage
                if (rememberMe) {
                    localStorage.setItem(this.TOKEN_KEY, response.token);
                } else {
                    sessionStorage.setItem(this.TOKEN_KEY, response.token);
                }
            })
        );
    }

    logout(): void {
        // Clear token from both locations
        sessionStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.TOKEN_KEY);
        this.router.navigate(['/auth/login']); // Or your designated login route
    }

    // --- MODIFIED METHODS ---

    /**
     * Checks if a token exists in either session or local storage.
     * @returns {boolean} True if the user is logged in, false otherwise.
     */
    isLoggedIn(): boolean {
        // Check both sessionStorage and localStorage for the token
        return !!sessionStorage.getItem(this.TOKEN_KEY) || !!localStorage.getItem(this.TOKEN_KEY);
    }

    /**
     * Retrieves the token from either session or local storage.
     * @returns {string | null} The token, or null if it doesn't exist.
     */
    getToken(): string | null {
        // Prioritize sessionStorage, then check localStorage
        return sessionStorage.getItem(this.TOKEN_KEY) || localStorage.getItem(this.TOKEN_KEY);
    }
}
