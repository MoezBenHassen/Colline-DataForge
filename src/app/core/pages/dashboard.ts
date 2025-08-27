import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseStatusWidget } from '../../../app/pages/dashboard/components/database-status.widget'
import { RecentActivityWidget } from '../../../app/pages/dashboard/components/recent-activity.widget';
import { EndpointStatsWidget } from '../../../app/pages/dashboard/components/endpoint-stats.widget';
import { QueryExplorerWidget } from "../../pages/dashboard/components/query-explorer.widget";
import { QuickActionsWidget } from "../../pages/dashboard/components/quick-actions.widget";

import { TopEndpointsWidget } from "../../pages/dashboard/components/top-endpoints.widget";
import { GenerationPerformanceWidget } from "../../pages/dashboard/components/generation-performance.widget";
import { SystemMetricsCardsWidget } from '../../pages/dashboard/components/system-health-widget/system-metrics.widget';

import { ServiceStatusCardComponent } from '../../pages/dashboard/components/service-status-card.component';
import { ServiceDetailsWidgetComponent } from '../../pages/dashboard/components/service-details-widget/service-details-widget.component';
import { LogLevelManagerWidget } from '../../pages/dashboard/components/log-level-manager-widget.component';
import {DashboardRefreshService} from "../../services/dashboard-refersh.service";
import {Button} from "primeng/button";


@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [
        CommonModule,
        DatabaseStatusWidget,
        RecentActivityWidget,
        EndpointStatsWidget,
        QueryExplorerWidget,
        QuickActionsWidget,
        SystemMetricsCardsWidget,
        TopEndpointsWidget,
        GenerationPerformanceWidget,
        ServiceStatusCardComponent,
        ServiceDetailsWidgetComponent,
        LogLevelManagerWidget,
        Button
    ],
    template: `
        <!-- Dashboard Header -->
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">Dashboard Overview</h1>
                    <p class="text-gray-600 dark:text-gray-400">Monitor your Spring Boot application performance and health</p>
                </div>
                <div class="flex gap-2">
                    <!-- Add refresh button -->
                    <p-button icon="pi pi-refresh" styleClass="p-button-outlined p-button-rounded"
                              (click)="refreshDashboard()" [loading]="isRefreshing"></p-button>
                    <!-- Add time range selector -->
                    <button class="p-button p-button-text">
                        <i class="pi pi-clock mr-2"></i>
                        Last 24 hours
                    </button>
                </div>
            </div>
        </div>

        <!-- System Metrics Cards - 4 separate cards -->
        <div class="mb-8">
            <app-system-metrics-cards-widget />
        </div>

        <!-- Service Status and Database Row -->
        <div class="grid grid-cols-12 gap-4 mb-8">
            <!-- Left Column: Backend Service Status -->
            <div class="col-span-12 lg:col-span-6 gap-11">
                <app-service-details-widget />
                <app-database-status-widget />
            </div>
            <!-- Right Column: Database and Endpoints -->
            <div class="col-span-12 lg:col-span-6">
                <div class="flex flex-col gap-4">
                    <app-service-status-card></app-service-status-card>
                    <app-endpoint-stats-widget />
                </div>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="mb-8">
            <app-quick-actions-widget />
        </div>

        <!-- Activity & Performance Section -->
        <div class="mb-8">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <i class="pi pi-chart-line text-blue-500 mr-2"></i>
                Activity & Performance
            </h2>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 xl:col-span-6 gap-4">
                    <app-query-explorer-widget />
                </div>

                <div class="col-span-12 xl:col-span-6">
                    <app-top-endpoints-widget />
                </div>
                <div class="col-span-12">
                    <app-recent-activity-widget />
                </div>
            </div>
        </div>

        <!-- Developer Tools Section -->
        <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <i class="pi pi-code text-green-500 mr-2"></i>
                Developer Tools
            </h2>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <app-log-level-manager-widget />
                </div>
            </div>
        </div>
    `,
    styles: [
        `
            :host ::ng-deep .card {
                border-radius: 12px;
                box-shadow:
                    0 1px 3px 0 rgba(0, 0, 0, 0.1),
                    0 1px 2px 0 rgba(0, 0, 0, 0.06);
                transition: all 0.3s ease;
            }

            :host ::ng-deep .card:hover {
                box-shadow:
                    0 10px 25px 0 rgba(0, 0, 0, 0.1),
                    0 6px 10px 0 rgba(0, 0, 0, 0.06);
                transform: translateY(-2px);
            }

            /* Add smooth loading animations */
            @keyframes shimmer {
                0% {
                    background-position: -1000px 0;
                }
                100% {
                    background-position: 1000px 0;
                }
            }

            :host ::ng-deep p-skeleton {
                background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
                background-size: 1000px 100%;
                animation: shimmer 2s infinite;
            }

            /* Ensure consistent card heights in grid */
            .grid > div {
                display: flex;
                flex-direction: column;
            }

            .grid > div > * {
                flex: 1;
            }
        `
    ]
})
export class Dashboard {
    isRefreshing = false;

    constructor(private refreshService: DashboardRefreshService) {}

    refreshDashboard(): void {
        this.isRefreshing = true;

        this.refreshService.triggerRefresh();
        // Trigger refresh logic here
        setTimeout(() => {
            this.isRefreshing = false;
            // You could emit an event or call a service to refresh all widgets
        }, 2000);
    }
}
