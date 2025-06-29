// src/app/core/guards/auth.guard.ts
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service'

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

    constructor(private auth: AuthService, private router: Router) {}


    canActivate(
        route: ActivatedRouteSnapshot,
        state: RouterStateSnapshot
    ): boolean | UrlTree {
        if (this.auth.isLoggedIn()) {
            // User is logged in, so allow navigation
            return true;
        } else {
            // User is not logged in, redirect to the login page
            console.warn('AuthGuard: Blocked access to', state.url, '- redirecting to login.');
            return this.router.createUrlTree(['/auth/login']); // Or your login path
        }
    }
}
