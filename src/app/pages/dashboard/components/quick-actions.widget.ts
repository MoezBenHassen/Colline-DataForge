import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DashboardService } from '../../../services/dashboard.service';
import { MessageService } from 'primeng/api';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import {DbManagementService} from "../../../services/db-management.service";

@Component({
    selector: 'app-quick-actions-widget',
    standalone: true,
    imports: [CommonModule, ButtonModule, RippleModule, TooltipModule],
    providers: [MessageService], // Provide MessageService here or in root
    template: `
        <div class="card">
            <h5 class="font-semibold text-xl mb-4">Quick Actions</h5>
            <div class="flex flex-wrap gap-2">
                <button
                    pButton
                    pRipple
                    pTooltip="Force the backend to reload queries from the configuration file"
                    tooltipPosition="bottom"
                    [label]="loading ? 'Reloading...' : 'Reload SQL Queries'"
                    icon="pi pi-sync"
                    [loading]="loading"
                    (click)="onReloadQueries()">
                </button>
            </div>
        </div>
    `
})
export class QuickActionsWidget {
    loading = false;

    constructor(
        private dashboardService: DashboardService,
        private messageService: MessageService,
        private dbService: DbManagementService
    ) {}

    onReloadQueries(): void {
        this.loading = true;
        this.dbService.reloadQueries().subscribe({
            next: (response) => {
                this.messageService.add({ severity: 'success', summary: 'Success', detail: response });
                this.loading = false;
            },
            error: (err) => {
                this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to reload queries.' });
                this.loading = false;
            }
        });
    }
}
