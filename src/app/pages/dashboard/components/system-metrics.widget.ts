import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, ResourceMetrics } from '../../../services/dashboard.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { Checkbox } from "primeng/checkbox";
import { FormsModule } from "@angular/forms";
import { TagModule } from 'primeng/tag';

@Component({
    selector: 'app-system-metrics-cards-widget',
    standalone: true,
    imports: [
        CommonModule,
        SkeletonModule,
        TooltipModule,
        ProgressBarModule,
        Checkbox,
        FormsModule,
        TagModule
    ],
    template: `
        <!-- Auto-refresh control -->
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                <i class="pi pi-heart text-red-500 mr-2"></i>
                System Health
            </h2>
            <div class="flex items-center gap-3">
                <p-tag
                    [value]="getHealthStatus()"
                    [severity]="getHealthSeverity()"
                    [icon]="getHealthIcon()">
                </p-tag>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Auto-refresh</span>
                    <p-checkbox [(ngModel)]="autoRefresh" (onChange)="toggleAutoRefresh()"></p-checkbox>
                </div>
                <span class="text-sm text-gray-500">
                    Last updated: {{ lastUpdated | date: 'short' }}
                </span>
            </div>
        </div>

        @if (loading) {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                @for (i of [1, 2, 3, 4]; track i) {
                    <div class="card">
                        <div class="flex items-center justify-between mb-3">
                            <p-skeleton width="60%" height="1.5rem"></p-skeleton>
                            <p-skeleton shape="circle" size="2rem"></p-skeleton>
                        </div>
                        <p-skeleton width="40%" height="2.5rem" styleClass="mb-2"></p-skeleton>
                        <p-skeleton width="100%" height="0.5rem" styleClass="mb-2"></p-skeleton>
                        <p-skeleton width="80%" height="0.8rem"></p-skeleton>
                    </div>
                }
            </div>
        } @else {
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <!-- CPU Usage Card -->
                <div class="card metric-card" [class.alert-card]="cpuPercent > 80">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-600 dark:text-gray-400 font-medium">CPU Usage</span>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center"
                             [ngClass]="cpuPercent > 80 ? 'bg-orange-100 dark:bg-orange-400/10' : 'bg-cyan-100 dark:bg-cyan-400/10'">
                            <i class="pi pi-microchip text-xl"
                               [ngClass]="cpuPercent > 80 ? 'text-orange-500' : 'text-cyan-500'"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline mb-2">
                        <span class="text-3xl font-bold text-gray-900 dark:text-white">
                            {{ cpuPercent }}%
                        </span>
                        @if (cpuPercent > 80) {
                            <i class="pi pi-exclamation-triangle text-orange-500 ml-2"
                               pTooltip="High CPU usage detected"
                               tooltipPosition="top"></i>
                        }
                    </div>
                    <p-progressBar
                        [value]="cpuPercent"
                        [showValue]="false"
                        styleClass="h-2 mb-2"
                        [ngClass]="getProgressBarClass(cpuPercent)">
                    </p-progressBar>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        Processing Load
                    </span>
                </div>

                <!-- Memory Card -->
                <div class="card metric-card" [class.alert-card]="memPercent > 85">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-600 dark:text-gray-400 font-medium">Memory</span>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center"
                             [ngClass]="memPercent > 85 ? 'bg-orange-100 dark:bg-orange-400/10' : 'bg-purple-100 dark:bg-purple-400/10'">
                            <i class="pi pi-th-large text-xl"
                               [ngClass]="memPercent > 85 ? 'text-orange-500' : 'text-purple-500'"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline mb-2">
                        <span class="text-3xl font-bold text-gray-900 dark:text-white">
                            {{ memPercent }}%
                        </span>
                        @if (memPercent > 85) {
                            <i class="pi pi-exclamation-triangle text-orange-500 ml-2"
                               pTooltip="High memory usage"
                               tooltipPosition="top"></i>
                        }
                    </div>
                    <p-progressBar
                        [value]="memPercent"
                        [showValue]="false"
                        styleClass="h-2 mb-2"
                        [ngClass]="getProgressBarClass(memPercent)">
                    </p-progressBar>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatBytes(memUsed) }} / {{ formatBytes(memMax) }}
                    </span>
                </div>

                <!-- Disk Space Card -->
                <div class="card metric-card" [class.critical-card]="diskPercent > 90">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-600 dark:text-gray-400 font-medium">Disk Space</span>
                        <div class="w-10 h-10 rounded-full flex items-center justify-center"
                             [ngClass]="diskPercent > 90 ? 'bg-red-100 dark:bg-red-400/10' : 'bg-indigo-100 dark:bg-indigo-400/10'">
                            <i class="pi pi-server text-xl"
                               [ngClass]="diskPercent > 90 ? 'text-red-500' : 'text-indigo-500'"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline mb-2">
                        <span class="text-3xl font-bold text-gray-900 dark:text-white">
                            {{ diskPercent }}%
                        </span>
                        @if (diskPercent > 90) {
                            <i class="pi pi-exclamation-circle text-red-500 ml-2"
                               pTooltip="Low disk space!"
                               tooltipPosition="top"></i>
                        }
                    </div>
                    <p-progressBar
                        [value]="diskPercent"
                        [showValue]="false"
                        styleClass="h-2 mb-2"
                        [ngClass]="getDiskProgressBarClass(diskPercent)">
                    </p-progressBar>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        {{ formatBytes(diskFree) }} free
                    </span>
                </div>

                <!-- Data Directory Card -->
                <div class="card metric-card h-full flex flex-col">
                    <div class="flex items-center justify-between mb-3">
                        <span class="text-gray-600 dark:text-gray-400 font-medium">Data Directory</span>
                        <div class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-400/10 flex items-center justify-center">
                            <i class="pi pi-folder text-xl text-green-500"></i>
                        </div>
                    </div>
                    <div class="flex items-baseline mb-2">
                        <span class="text-3xl font-bold text-gray-900 dark:text-white">
                            {{ formatBytes(dirSizeBytes) }}
                        </span>
                    </div>
                    <p-progressBar
                        [value]="dirSizePercentOfDisk"
                        [showValue]="false"
                        styleClass="h-2 mb-2"
                        [ngClass]="'progress-green'">
                    </p-progressBar>
                    <span class="text-sm text-gray-500 dark:text-gray-400">
                        {{ dirSizePercentOfDisk }}% of total disk
                    </span>
                </div>
            </div>
        }
    `,
    styles: [
        `
            .metric-card {
                display: flex; /* Add this */
                flex-direction: column; /* Add this */
                transition: all 0.3s ease;
                border: 1px solid transparent;
            }
            .metric-card:hover {
                transform: translateY(-4px);
                box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
            }

            .alert-card {
                animation: pulse 3s infinite;
                border-color: rgba(251, 191, 36, 0.3);
                background: linear-gradient(135deg,
                    rgba(251, 191, 36, 0.02) 0%,
                    rgba(251, 191, 36, 0.05) 100%);
            }

            .critical-card {
                animation: pulse 2s infinite;
                border-color: rgba(239, 68, 68, 0.3);
                background: linear-gradient(135deg,
                    rgba(239, 68, 68, 0.02) 0%,
                    rgba(239, 68, 68, 0.05) 100%);
            }

            @keyframes pulse {
                0%, 100% {
                    opacity: 1;
                }
                50% {
                    opacity: 0.9;
                }
            }

            :host ::ng-deep .progress-green .p-progressbar-value {
                background: #10b981;
            }

            :host ::ng-deep .progress-yellow .p-progressbar-value {
                background: #f59e0b;
            }

            :host ::ng-deep .progress-orange .p-progressbar-value {
                background: #fb923c;
            }

            :host ::ng-deep .progress-red .p-progressbar-value {
                background: #ef4444;
            }

            :host ::ng-deep .p-progressbar {
                background: rgba(0, 0, 0, 0.08);
                border-radius: 4px;
                overflow: hidden;
            }

            .card {
                padding: 1.25rem;
                background: var(--surface-card);
                border-radius: 12px;
                box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            }

            /* Dark mode support */
            @media (prefers-color-scheme: dark) {
                :host ::ng-deep .p-progressbar {
                    background: rgba(255, 255, 255, 0.08);
                }
            }

        `
    ]
})
export class SystemMetricsCardsWidget implements OnInit, OnDestroy {
    loading = true;
    autoRefresh = false;
    lastUpdated = new Date();

    cpuPercent = 0;
    memPercent = 0;
    diskPercent = 0;
    dirSizePercentOfDisk = 0;
    dirSizeBytes = 0;

    memUsed = 0;
    memMax = 0;
    diskFree = 0;

    subscription?: Subscription;
    refreshSubscription?: Subscription;
    private lastMetrics: ResourceMetrics | null = null;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.loadMetrics();
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    toggleAutoRefresh(): void {
        if (this.autoRefresh) {
            this.refreshSubscription = interval(30000).subscribe(() => {
                this.loadMetrics();
            });
        } else {
            this.refreshSubscription?.unsubscribe();
        }
    }

    private loadMetrics(): void {
        this.loading = true;
        forkJoin({
            metrics: this.dashboardService.getResourceMetrics(),
            dirSize: this.dashboardService.getDirectorySize()
        }).subscribe(({ metrics, dirSize }) => {
            const combinedMetrics: ResourceMetrics = {
                ...metrics,
                directorySizeBytes: dirSize.directorySizeBytes
            };

            this.lastMetrics = combinedMetrics;
            this.processMetrics(combinedMetrics);
            this.lastUpdated = new Date();
            this.loading = false;
        });
    }

    private processMetrics(metrics: ResourceMetrics): void {
        // CPU
        this.cpuPercent = Math.round(metrics.cpuUsage);

        // Memory
        this.memUsed = metrics.memoryUsedBytes;
        this.memMax = metrics.memoryMaxBytes;
        this.memPercent = Math.round((this.memUsed / this.memMax) * 100);

        // Disk
        const diskUsed = metrics.diskTotalBytes - metrics.diskFreeBytes;
        const diskTotal = metrics.diskTotalBytes;
        this.diskFree = metrics.diskFreeBytes;
        this.diskPercent = Math.round((diskUsed / diskTotal) * 100);

        // Directory
        this.dirSizeBytes = metrics.directorySizeBytes ?? 0;
        this.dirSizePercentOfDisk = diskTotal > 0 ? Math.round((this.dirSizeBytes / diskTotal) * 100) : 0;
    }

    getHealthStatus(): string {
        if (this.cpuPercent > 90 || this.memPercent > 90 || this.diskPercent > 95) {
            return 'Critical';
        } else if (this.cpuPercent > 75 || this.memPercent > 80 || this.diskPercent > 85) {
            return 'Warning';
        }
        return 'Healthy';
    }

    getHealthSeverity(): string {
        const status = this.getHealthStatus();
        if (status === 'Critical') return 'danger';
        if (status === 'Warning') return 'warning';
        return 'success';
    }

    getHealthIcon(): string {
        const status = this.getHealthStatus();
        if (status === 'Critical') return 'pi pi-exclamation-circle';
        if (status === 'Warning') return 'pi pi-exclamation-triangle';
        return 'pi pi-check-circle';
    }

    getProgressBarClass(percent: number): string {
        if (percent > 90) return 'progress-red';
        if (percent > 75) return 'progress-orange';
        if (percent > 60) return 'progress-yellow';
        return 'progress-green';
    }

    getDiskProgressBarClass(percent: number): string {
        if (percent > 90) return 'progress-red';
        if (percent > 85) return 'progress-orange';
        if (percent > 75) return 'progress-yellow';
        return 'progress-green';
    }

    protected formatBytes(bytes: number, decimals = 1): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
