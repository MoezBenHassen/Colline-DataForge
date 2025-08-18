import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, ResourceMetrics } from '../../../services/dashboard.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import {Checkbox} from "primeng/checkbox";
import {FormsModule} from "@angular/forms";

@Component({
    selector: 'app-system-metrics-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, SkeletonModule, TooltipModule, ProgressBarModule, Checkbox, FormsModule],
    template: `
        <div class="card">
            <div class="flex justify-between items-center mb-4">
                <h5 class="font-semibold text-xl">Backend System Resources</h5>
                <div class="flex items-center gap-2">
                    <span class="text-sm text-gray-500">Auto-refresh</span>
                    <p-checkbox [(ngModel)]="autoRefresh" (onChange)="toggleAutoRefresh()"></p-checkbox>
                </div>
            </div>

            @if (loading) {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    @for (i of [1, 2, 3, 4]; track i) {
                        <div class="metric-card">
                            <p-skeleton shape="circle" size="120px" styleClass="mx-auto mb-2"></p-skeleton>
                            <p-skeleton width="60%" height="1rem" styleClass="mx-auto"></p-skeleton>
                        </div>
                    }
                </div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
                    <!-- CPU Usage -->
                    <div class="metric-card" [class.alert]="cpuPercent > 80">
                        <div class="relative">
                            <p-chart type="doughnut" [data]="cpuData" [options]="cpuChartOptions" [plugins]="[centerTextPlugin]" height="120px"> </p-chart>
                            @if (cpuPercent > 80) {
                                <i class="pi pi-exclamation-triangle absolute top-0 right-0 text-orange-500" pTooltip="High CPU usage detected"></i>
                            }
                        </div>
                        <div class="metric-label">
                            <i class="pi pi-microchip mr-2 text-cyan-500"></i>
                            CPU Usage
                        </div>
                        <div class="metric-detail">
                            <p-progressBar [value]="cpuPercent" [showValue]="false" styleClass="h-1 mt-2"> </p-progressBar>
                        </div>
                    </div>

                    <!-- Memory -->
                    <div class="metric-card" [class.alert]="memPercent > 85">
                        <div class="relative">
                            <p-chart type="doughnut" [data]="memoryData" [options]="memoryChartOptions" [plugins]="[centerTextPlugin]" height="120px"> </p-chart>
                            @if (memPercent > 85) {
                                <i class="pi pi-exclamation-triangle absolute top-0 right-0 text-orange-500" pTooltip="High memory usage"></i>
                            }
                        </div>
                        <div class="metric-label">
                            <i class="pi pi-database mr-2 text-orange-500"></i>
                            Memory
                        </div>
                        <div class="metric-detail text-xs text-gray-600">{{ formatBytes(memUsed) }} / {{ formatBytes(memMax) }}</div>
                    </div>

                    <!-- Disk Space -->
                    <div class="metric-card" [class.alert]="diskPercent > 90">
                        <div class="relative">
                            <p-chart type="doughnut" [data]="diskData" [options]="diskChartOptions" [plugins]="[centerTextPlugin]" height="120px"> </p-chart>
                            @if (diskPercent > 90) {
                                <i class="pi pi-exclamation-triangle absolute top-0 right-0 text-red-500" pTooltip="Low disk space!"></i>
                            }
                        </div>
                        <div class="metric-label">
                            <i class="pi pi-server mr-2 text-purple-500"></i>
                            Disk Space
                        </div>
                        <div class="metric-detail text-xs text-gray-600">{{ formatBytes(diskFree) }} free</div>
                    </div>

                    <!-- Data Directory -->
                    <div class="metric-card">
                        <div class="relative">
                            <p-chart type="doughnut" [data]="directoryData" [options]="directoryChartOptions" [plugins]="[centerTextPlugin]" height="120px"> </p-chart>
                        </div>
                        <div class="metric-label">
                            <i class="pi pi-folder mr-2 text-green-500"></i>
                            Data Directory
                        </div>
                        <div class="metric-detail text-xs text-gray-600">{{ dirSizePercentOfDisk }}% of total disk</div>
                    </div>
                </div>

                <!-- System Health Summary -->
                <div class="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-2">
                            <i class="pi pi-info-circle text-blue-500"></i>
                            <span class="font-medium">System Health:</span>
                            <span [class]="getHealthStatusClass()">{{ getHealthStatus() }}</span>
                        </div>
                        <span class="text-sm text-gray-500"> Last updated: {{ lastUpdated | date: 'short' }} </span>
                    </div>
                </div>
            }
        </div>
    `,
    styles: [
        `
            .metric-card {
                padding: 1rem;
                border-radius: 8px;
                background: var(--surface-50);
                transition: all 0.3s ease;
                position: relative;
            }

            .metric-card:hover {
                transform: translateY(-2px);
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            }

            .metric-card.alert {
                animation: pulse 2s infinite;
            }

            @keyframes pulse {
                0%,
                100% {
                    background: var(--surface-50);
                }
                50% {
                    background: rgba(251, 191, 36, 0.1);
                }
            }

            .metric-label {
                font-weight: 600;
                margin-top: 0.75rem;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .metric-detail {
                margin-top: 0.25rem;
                color: var(--text-color-secondary);
            }

            :host ::ng-deep .p-chart {
                transition: transform 0.3s ease;
            }

            :host ::ng-deep .p-chart:hover {
                transform: scale(1.05);
            }
        `
    ]
})
export class SystemMetricsWidget implements OnInit, OnDestroy {
    loading = true;
    autoRefresh = false;
    lastUpdated = new Date();

    cpuData: any;
    memoryData: any;
    diskData: any;
    directoryData: any;

    cpuPercent = 0;
    memPercent = 0;
    diskPercent = 0;
    dirSizePercentOfDisk = 0;

    memUsed = 0;
    memMax = 0;
    diskFree = 0;

    cpuChartOptions: any;
    memoryChartOptions: any;
    diskChartOptions: any;
    directoryChartOptions: any;

    subscription: Subscription;
    refreshSubscription?: Subscription;
    centerTextPlugin: any;
    private lastMetrics: ResourceMetrics | null = null;

    constructor(
        private dashboardService: DashboardService,
        public layoutService: LayoutService
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            if (this.lastMetrics) {
                this.createCharts(this.lastMetrics);
            }
        });
        this.initializeChartPlugin();
    }

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
            this.createCharts(combinedMetrics);
            this.lastUpdated = new Date();
            this.loading = false;
        });
    }

    getHealthStatus(): string {
        if (this.cpuPercent > 90 || this.memPercent > 90 || this.diskPercent > 95) {
            return 'Critical';
        } else if (this.cpuPercent > 75 || this.memPercent > 80 || this.diskPercent > 85) {
            return 'Warning';
        }
        return 'Healthy';
    }

    getHealthStatusClass(): string {
        const status = this.getHealthStatus();
        if (status === 'Critical') return 'text-red-600 font-bold';
        if (status === 'Warning') return 'text-orange-500 font-medium';
        return 'text-green-600 font-medium';
    }

    private initializeChartPlugin() {
        this.centerTextPlugin = {
            id: 'centerText',
            afterDraw: (chart: any) => {
                if (chart.data.centerText) {
                    const ctx = chart.ctx;
                    const chartArea = chart.chartArea;
                    if (!chartArea) return;

                    const x = (chartArea.left + chartArea.right) / 2;
                    const y = (chartArea.top + chartArea.bottom) / 2;
                    const textColor = getComputedStyle(document.documentElement).getPropertyValue('--text-color');

                    ctx.save();
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    const radius = Math.min(chartArea.width, chartArea.height) / 2;
                    const fontSize = Math.floor(radius / 2.5);
                    ctx.font = `bold ${fontSize}px sans-serif`;
                    ctx.fillStyle = textColor;
                    ctx.fillText(chart.data.centerText, x, y);
                    ctx.restore();
                }
            }
        };
    }

    protected formatBytes(bytes: number, decimals = 1): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }

    private createCharts(metrics: ResourceMetrics): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const getBaseOptions = () => ({
            cutout: '60%',
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    callbacks: {}
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true
            }
        });

        // CPU Chart
        this.cpuPercent = Math.round(metrics.cpuUsage);
        this.cpuData = this.buildChartData(`${this.cpuPercent}%`, [this.cpuPercent, 100 - this.cpuPercent], this.getGradientColors('cyan', this.cpuPercent));
        this.cpuChartOptions = getBaseOptions();
        this.cpuChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            const label = context.dataIndex === 0 ? 'Used' : 'Free';
            return `${label}: ${context.raw}%`;
        };

        // Memory Chart
        this.memUsed = metrics.memoryUsedBytes;
        this.memMax = metrics.memoryMaxBytes;
        this.memPercent = Math.round((this.memUsed / this.memMax) * 100);
        this.memoryData = this.buildChartData(`${this.memPercent}%`, [this.memUsed, this.memMax - this.memUsed], this.getGradientColors('orange', this.memPercent));
        this.memoryChartOptions = getBaseOptions();
        this.memoryChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            const value = this.formatBytes(context.raw);
            if (context.dataIndex === 0) {
                return `Used: ${value} of ${this.formatBytes(this.memMax)}`;
            }
            return `Free: ${value}`;
        };

        // Disk Chart
        const diskUsed = metrics.diskTotalBytes - metrics.diskFreeBytes;
        const diskTotal = metrics.diskTotalBytes;
        this.diskFree = metrics.diskFreeBytes;
        this.diskPercent = Math.round((diskUsed / diskTotal) * 100);
        this.diskData = this.buildChartData(`${this.diskPercent}%`, [diskUsed, metrics.diskFreeBytes], this.getGradientColors('purple', this.diskPercent));
        this.diskChartOptions = getBaseOptions();
        this.diskChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            const value = this.formatBytes(context.raw);
            if (context.dataIndex === 0) {
                return `Used: ${value} of ${this.formatBytes(diskTotal)}`;
            }
            return `Free: ${value}`;
        };

        // Directory Chart
        const dirSizeBytes = metrics.directorySizeBytes ?? 0;
        this.dirSizePercentOfDisk = diskTotal > 0 ? Math.round((dirSizeBytes / diskTotal) * 100) : 0;

        this.directoryData = this.buildChartData(this.formatBytes(dirSizeBytes), [dirSizeBytes, diskTotal - dirSizeBytes], this.getGradientColors('green', this.dirSizePercentOfDisk));
        this.directoryChartOptions = getBaseOptions();
        this.directoryChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            if (context.dataIndex === 0) {
                return `Directory: ${this.formatBytes(context.raw)} (${this.dirSizePercentOfDisk}% of disk)`;
            }
            return `Other Disk Space: ${this.formatBytes(context.raw)}`;
        };
    }

    private getGradientColors(baseColor: string, percentage: number): string[] {
        const documentStyle = getComputedStyle(document.documentElement);
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        let intensity = '500';
        if (percentage > 90) intensity = '700';
        else if (percentage > 75) intensity = '600';

        return [documentStyle.getPropertyValue(`--p-${baseColor}-${intensity}`), surfaceBorder];
    }

    private buildChartData(text: string, data: number[], colors: string[]): any {
        return {
            datasets: [
                {
                    data,
                    backgroundColor: colors,
                    hoverBackgroundColor: colors,
                    borderWidth: 0
                }
            ],
            centerText: text
        };
    }
}
