import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChipModule } from 'primeng/chip';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, DbStatus } from '../../../services/dashboard.service';
import { forkJoin, map, switchMap } from 'rxjs';
import { DatabaseType } from '../../../services/gloable-state.service';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-database-status-widget',
    standalone: true,
    imports: [CommonModule, ChipModule, SkeletonModule, TooltipModule],
    styles: [`
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
    `],
    template: `
        <div class="card">
            <div class="font-semibold text-xl mb-4">Database Status</div>
            @if (loading) {
                <div class="flex flex-wrap gap-2">
                    <p-skeleton width="6rem" height="2.5rem"></p-skeleton>
                    <p-skeleton width="8rem" height="2.5rem"></p-skeleton>
                </div>
            } @else {
                <div class="flex flex-wrap gap-2">
                    @for (db of dbStatus; track db.db) {
                        <p-chip
                            [pTooltip]="db.online ? 'Online' : 'Offline'"
                            tooltipPosition="bottom"
                            styleClass="px-3 py-2"
                            [label]="db.db || ''"
                            [icon]="db.online ? 'pi pi-check-circle' : 'pi pi-times-circle'"
                            [ngClass]="{
                            'status-online': db.online,
                            'status-offline': !db.online
                            }"
                            >
                        </p-chip>
                    }
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

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.dashboardService.getConfiguredDatabases().pipe(
            switchMap(configuredDBs => {
                if (configuredDBs.length === 0) {
                    return [];
                }
                return this.dashboardService.pingAllDatabases().pipe(
                    map(pingStatus => {
                        return configuredDBs.map(db => ({
                            db: db,
                            online: !!pingStatus[db as keyof typeof pingStatus]
                        }));
                    })
                );
            })
        ).subscribe(statuses => {
            this.dbStatus = statuses;
            this.loading = false;
        });
    }
}
