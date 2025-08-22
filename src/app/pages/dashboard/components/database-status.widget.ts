import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, DbStatus } from '../../../services/dashboard.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { DatabaseType, GlobalStateService } from '../../../services/gloable-state.service';
import { TooltipModule } from 'primeng/tooltip';
import { Button, ButtonDirective } from 'primeng/button';
import { Ripple } from 'primeng/ripple';
import { MessageService } from 'primeng/api';
const ALL_DATABASES: DatabaseType[] = ['ORACLE', 'POSTGRESQL', 'MSSQL'];
@Component({
    selector: 'app-database-status-widget',
    standalone: true,
    imports: [CommonModule, ChipModule, SkeletonModule, TooltipModule, ButtonDirective, Ripple, Button],
    styles: [
        `
            /* Light Mode Styles */
            :host ::ng-deep .status-online {
                background-color: var(--p-green-100);
                color: var(--p-green-800);
            }

            :host ::ng-deep .status-offline {
                background-color: var(--p-red-100);
                color: var(--p-red-800);
            }

            /* Dark Mode Overrides */
            .app-dark :host ::ng-deep .status-online {
                background-color: var(--p-green-900);
                color: var(--p-green-300);
            }

            .app-dark :host ::ng-deep .status-offline {
                background-color: var(--p-red-900);
                color: var(--p-red-300);
            }
        `
    ],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Database Status</div>
            @if (loading) {
                <div class="flex flex-wrap gap-2">
                    <p-skeleton width="6rem" height="2.5rem"></p-skeleton>
                    <p-skeleton width="8rem" height="2.5rem"></p-skeleton>
                </div>
            } @else {
                <div class="flex flex-wrap justify-between gap-2">
                    <div class="flex flex-wrap justify-between gap-3">
                        @for (db of dbStatus; track db.db) {
                            <p-chip
                                [pTooltip]="db.configured ? (db.online ? 'Online' : 'Offline') : 'Unconfigured'"
                                tooltipPosition="bottom"
                                styleClass="px-3 py-2"
                                [label]="db.db || ''"
                                [icon]="db.configured ? (db.online ? 'pi pi-check-circle' : 'pi pi-times-circle') : 'pi pi-ban'"
                                [ngClass]="{
                                    'status-online': db.configured && db.online,
                                    'status-offline': db.configured && !db.online,
                                    'status-unconfigured': !db.configured
                                }"
                            >
                            </p-chip>
                        }
                    </div>

                    <button rounded outlined pButton pRipple pTooltip="Refresh Database Status" tooltipPosition="bottom" [label]="loading ? 'Reloading...' : 'Refresh Status'" icon="pi pi-sync" [loading]="loading" (click)="onRefreshDbStatus()"></button>

                    @if (dbStatus.length === 0) {
                        <p class="text-color-secondary">No databases configured.</p>
                    }
                </div>
            }
        </div>
    `
})
export class DatabaseStatusWidget implements OnInit {
    dbStatus: DbStatus[] = [];
    loading = true;
    public isRefreshingDbStatus = false;
    public isReloadingQueries = false;

    constructor(
        private dashboardService: DashboardService,
        private globalStateService: GlobalStateService,
        private messageService: MessageService
    ) {}
    onRefreshDbStatus(): void {
        this.isRefreshingDbStatus = true; // Show loading spinner
        this.globalStateService.refreshDbStatus().subscribe({
            // When the refresh is complete, hide the spinner
            complete: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Active DBs Fetched',
                    detail: '🔮 Database status refreshed successfully',
                    life: 2000
                });
                this.isRefreshingDbStatus = false;
            },
            error: () => {
                const detail = 'Failed to connect to the server';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Refreshing DB Status',
                    detail: detail,
                    life: 3000
                });
                this.isRefreshingDbStatus = false; // Also hide on error
            }
        });
    }
    ngOnInit(): void {
        // Use forkJoin to get both lists simultaneously
        forkJoin({
            configuredDBs: this.dashboardService.getConfiguredDatabases(),
            pingStatus: this.dashboardService.pingAllDatabases()
        }).subscribe(({ configuredDBs, pingStatus }) => {
            // Map over the master list of ALL databases
            this.dbStatus = ALL_DATABASES.map((db) => {
                const isConfigured = configuredDBs.includes(db);
                return {
                    db: db,
                    configured: isConfigured,
                    // A DB is only online if it's both configured and the ping succeeds
                    online: isConfigured && !!pingStatus[db as keyof typeof pingStatus]
                };
            });

            this.loading = false;
        });
    }
}
