import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseStatusWidget } from '../../../app/pages/dashboard/components/database-status.widget'
import { RecentActivityWidget } from '../../../app/pages/dashboard/components/recent-activity.widget';
import { EndpointStatsWidget } from '../../../app/pages/dashboard/components/endpoint-stats.widget';
import { QueryExplorerWidget } from "../../pages/dashboard/components/query-explorer.widget";
import { QuickActionsWidget } from "../../pages/dashboard/components/quick-actions.widget";
import { SystemMetricsWidget } from "../../pages/dashboard/components/system-metrics.widget";
import { UptimeWidget } from "../../pages/dashboard/components/uptime.widget";
import { TopEndpointsWidget } from "../../pages/dashboard/components/top-endpoints.widget";
import { GenerationPerformanceWidget } from "../../pages/dashboard/components/generation-performance.widget";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, DatabaseStatusWidget, RecentActivityWidget, EndpointStatsWidget, QueryExplorerWidget, QuickActionsWidget, SystemMetricsWidget, UptimeWidget, TopEndpointsWidget, GenerationPerformanceWidget],
    template: `
        <!-- Dashboard Header -->
        <div class="mb-6">
            <div class="flex justify-between items-center">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                        Dashboard Overview
                    </h1>
                    <p class="text-gray-600 dark:text-gray-400">
                        Monitor your Spring Boot application performance and health
                    </p>
                </div>
                <div class="flex gap-2">
                    <!-- Add refresh button -->
                    <button class="p-button p-button-outlined p-button-rounded"
                            (click)="refreshDashboard()"
                            [disabled]="isRefreshing">
                        <i class="pi pi-refresh" [class.pi-spin]="isRefreshing"></i>
                    </button>
                    <!-- Add time range selector -->
                    <button class="p-button p-button-text">
                        <i class="pi pi-clock mr-2"></i>
                        Last 24 hours
                    </button>
                </div>
            </div>
        </div>

        <!-- Key Metrics Row - Visual hierarchy with larger cards -->
        <div class="grid grid-cols-12 gap-4 mb-6">
            <div class="col-span-12 lg:col-span-4">
                <div class="transform transition-all duration-200 hover:scale-105">
                    <app-endpoint-stats-widget />
                </div>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <div class="transform transition-all duration-200 hover:scale-105">
                    <app-uptime-widget />
                </div>
            </div>
            <div class="col-span-12 lg:col-span-4">
                <div class="transform transition-all duration-200 hover:scale-105">
                    <app-quick-actions-widget />
                </div>
            </div>
        </div>

        <!-- System Health Section -->
        <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <i class="pi pi-heart text-red-500 mr-2"></i>
                System Health
            </h2>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12">
                    <app-system-metrics-widget />
                </div>
                <div class="col-span-12">
                    <app-database-status-widget />
                </div>
            </div>
        </div>

        <!-- Activity & Performance Section -->
        <div class="mb-6">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4 flex items-center">
                <i class="pi pi-chart-line text-blue-500 mr-2"></i>
                Activity & Performance
            </h2>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 xl:col-span-6">
                    <app-recent-activity-widget />
                </div>
                <div class="col-span-12 xl:col-span-6">
                    <app-top-endpoints-widget />
                </div>
                <!-- Uncomment when ready -->
                <!-- <div class="col-span-12">
                    <app-generation-performance-widget />
                </div> -->
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
                    <app-query-explorer-widget />
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host ::ng-deep .card {
            border-radius: 12px;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
            transition: box-shadow 0.3s ease;
        }

        :host ::ng-deep .card:hover {
            box-shadow: 0 10px 25px 0 rgba(0, 0, 0, 0.1), 0 6px 10px 0 rgba(0, 0, 0, 0.06);
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
    `]
})
export class Dashboard {
    isRefreshing = false;

    constructor() {}

    refreshDashboard(): void {
        this.isRefreshing = true;
        // Trigger refresh logic here
        setTimeout(() => {
            this.isRefreshing = false;
            // You could emit an event or call a service to refresh all widgets
        }, 2000);
    }
}
