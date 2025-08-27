// src/app/services/dashboard-refresh.service.ts
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class DashboardRefreshService {
    private refreshSource = new Subject<void>();

    // Observable that widgets will subscribe to
    refresh$ = this.refreshSource.asObservable();

    // Method to trigger the refresh
    triggerRefresh() {
        this.refreshSource.next();
    }
}
