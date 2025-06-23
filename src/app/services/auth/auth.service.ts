// src/app/core/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import {API} from '../../constants/api-endpoints';
import { environment } from '../../../environments/environment';
import { TokenService } from '../token.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
    private readonly TOKEN_KEY = 'jwt_token';
    private readonly LOGIN_URL = '/api/auth/login'; // adjust if needed

    constructor(private http: HttpClient, private router: Router) {}

    login(username: string, password: string): Observable<any> {
        const URL = environment.apiUrl + API.AUTH.LOGIN;
        const body = new URLSearchParams();
        body.set('username', username);
        body.set('password', password);
        return this.http.post<{ token: string }>(URL,  body.toString(),
            {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            }).pipe(
            tap(response => {
                localStorage.setItem(this.TOKEN_KEY, response.token);
                // TokenService.setAccessToken(this.TOKEN_KEY, response.token);
            })
        );
    }

    logout(): void {
        localStorage.removeItem(this.TOKEN_KEY);
        this.router.navigate(['/auth/login']);
    }

    isLoggedIn(): boolean {
        return !!localStorage.getItem(this.TOKEN_KEY);
    }

    getToken(): string | null {
        return localStorage.getItem(this.TOKEN_KEY);
    }
}
