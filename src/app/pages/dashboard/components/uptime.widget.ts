import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, TimeDataPoint, UptimeInfo } from '../../../services/dashboard.service';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { ProgressBarModule } from 'primeng/progressbar';
import { ChartModule } from 'primeng/chart';
import { forkJoin, interval, Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';

interface ServiceMetric {
    label: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

@Component({
    selector: 'app-backend-service-status-widget',
    standalone: true,
    imports: [
        CommonModule,
        SkeletonModule,
        CardModule,
        DatePipe,
        TagModule,
        TooltipModule,
        DividerModule,
        ProgressBarModule,
        ChartModule,
        ButtonModule
    ],
    template: `
        <div class="card h-full">
            <!-- Header -->
            <div class="flex items-center justify-between mb-4">
                <h5 class="font-semibold text-xl">Backend Service Status</h5>
                <div class="flex items-center gap-2">
                    @if (!loading && uptimeInfo) {
                        <button
                            pButton
                            type="button"
                            icon="pi pi-refresh"
                            class="p-button-text p-button-rounded p-button-sm"
                            (click)="refresh()"
                            [disabled]="isRefreshing"
                            pTooltip="Refresh status">
                        </button>
                        <p-tag
                            [value]="serviceStatus"
                            [severity]="getStatusSeverity()"
                            [icon]="getStatusIcon()"
                            styleClass="px-3 py-1">
                        </p-tag>
                    }
                </div>
            </div>

            @if (loading) {
                <!-- Loading State -->
                <div class="space-y-4">
                    <!-- Main Status Skeleton -->
                    <div class="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                        <div class="flex items-center gap-4">
                            <p-skeleton shape="circle" size="3.5rem"></p-skeleton>
                            <div class="flex-1">
                                <p-skeleton height="1rem" width="40%" styleClass="mb-2"></p-skeleton>
                                <p-skeleton height="2rem" width="60%"></p-skeleton>
                            </div>
                            <p-skeleton height="2.5rem" width="5rem"></p-skeleton>
                        </div>
                    </div>

                    <!-- Metrics Grid Skeleton -->
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        @for (i of [1, 2, 3, 4]; track i) {
                            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <p-skeleton height="0.75rem" width="60%" styleClass="mb-2"></p-skeleton>
                                <p-skeleton height="1.5rem" width="80%"></p-skeleton>
                            </div>
                        }
                    </div>

                    <!-- Chart Skeleton -->
                    <p-skeleton height="150px" width="100%"></p-skeleton>
                </div>
            } @else if(uptimeInfo) {
                <!-- Main Service Status -->
                <div class="p-4 rounded-lg mb-4"
                     [ngClass]="getMainStatusClass()">
                    <div class="flex items-center justify-between">
                        <div class="flex items-center gap-4">
                            <div class="relative">
                                <div class="w-14 h-14 rounded-full flex items-center justify-center"
                                     [ngClass]="getStatusBgClass()">
                                    <i class="pi pi-power-off text-2xl"
                                       [ngClass]="getStatusTextClass()"></i>
                                </div>
                                <!-- Animated pulse for online status -->
                                @if (serviceStatus === 'ONLINE') {
                                    <span class="absolute top-0 right-0 h-3 w-3">
                                        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                        <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                                    </span>
                                }
                            </div>
                            <div>
                                <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Uptime</div>
                                <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formattedUptime }}</div>
                                <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                    Since {{ uptimeInfo.lastRestart | date:'medium' }}
                                </div>
                            </div>
                        </div>
                        <div class="text-right">
                            <div class="text-3xl font-bold" [ngClass]="getUptimePercentageClass()">
                                {{ uptimePercentage }}%
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">Availability</div>
                        </div>
                    </div>
                </div>

                <!-- Key Metrics Grid -->
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    @for (metric of serviceMetrics; track metric.label) {
                        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center justify-between mb-1">
                                <i [class]="'pi ' + metric.icon + ' text-' + metric.color + '-500'"></i>
                                @if (metric.trend) {
                                    <div class="flex items-center text-xs"
                                         [ngClass]="getTrendClass(metric.trend)">
                                        <i [class]="getTrendIcon(metric.trend)"></i>
                                        <span class="ml-1">{{ metric.trendValue }}</span>
                                    </div>
                                }
                            </div>
                            <div class="text-xs text-gray-600 dark:text-gray-400">{{ metric.label }}</div>
                            <div class="font-semibold text-lg text-gray-900 dark:text-white">{{ metric.value }}</div>
                        </div>
                    }
                </div>

                <!-- Health Indicators -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Health Indicators</span>
                        <span class="text-xs text-gray-500">All Systems</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        @for (indicator of healthIndicators; track indicator.name) {
                            <div class="flex items-center justify-between p-2 rounded-lg"
                                 [ngClass]="getIndicatorBgClass(indicator.status)"
                                 [pTooltip]="indicator.tooltip"
                                 tooltipPosition="top">
                                <span class="text-xs font-medium">{{ indicator.name }}</span>
                                <i [class]="getIndicatorIcon(indicator.status)"></i>
                            </div>
                        }
                    </div>
                </div>

                <!-- Response Time Chart -->
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Response Time (last hour)</span>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Avg: {{ avgResponseTime }}ms</span>
                            <p-tag
                                [value]="getResponseTimeStatus()"
                                [severity]="getResponseTimeSeverity()"
                                styleClass="text-xs px-2 py-0">
                            </p-tag>
                        </div>
                    </div>
                    <p-chart type="line" [data]="responseTimeChartData" [options]="responseTimeChartOptions" height="120px"></p-chart>
                </div>

                <!-- Service Actions -->
                <div class="grid grid-cols-3 gap-2">
                    <button pButton
                            type="button"
                            label="View Logs"
                            icon="pi pi-file-text"
                            class="p-button-sm p-button-outlined"
                            pTooltip="View application logs">
                    </button>
                    <button pButton
                            type="button"
                            label="Metrics"
                            icon="pi pi-chart-bar"
                            class="p-button-sm p-button-outlined"
                            pTooltip="Detailed metrics">
                    </button>
                    <button pButton
                            type="button"
                            label="Restart"
                            icon="pi pi-replay"
                            class="p-button-sm p-button-danger p-button-outlined"
                            pTooltip="Restart service"
                            [disabled]="true">
                    </button>
                </div>
            }
        </div>
    `,
    styles: [`
        :host ::ng-deep .p-divider {
            margin: 1rem 0;
        }

        .space-y-4 > * + * {
            margin-top: 1rem;
        }

        @keyframes pulse-soft {
            0%, 100% {
                opacity: 1;
            }
            50% {
                opacity: 0.8;
            }
        }

        .animate-ping {
            animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite;
        }

        @keyframes ping {
            75%, 100% {
                transform: scale(2);
                opacity: 0;
            }
        }

        .card {
            height: 100%;
            display: flex;
            flex-direction: column;
        }

        :host ::ng-deep .p-chart canvas {
            border-radius: 0.375rem;
        }

        :host ::ng-deep .p-button-sm {
            font-size: 0.875rem;
            padding: 0.5rem 1rem;
        }

        :host ::ng-deep .p-tag {
            font-weight: 600;
        }
    `]
})



export class BackendServiceStatusWidget implements OnInit, OnDestroy {
    loading = true;
    isRefreshing = false;
    uptimeInfo: UptimeInfo | null = null;
    formattedUptime = '';
    serviceStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' = 'ONLINE';
    uptimePercentage = 99.9;
    avgResponseTime = 124;

    serviceMetrics: ServiceMetric[] = [];
    healthIndicators: any[] = [];

    responseTimeChartData: any;
    responseTimeChartOptions: any;

    private refreshSubscription?: Subscription;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.loadData();
        this.initializeChart();

        // Auto-refresh every 30 seconds
        this.refreshSubscription = interval(30000).subscribe(() => {
            this.loadData();
        });
    }

    ngOnDestroy(): void {
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
    }

    refresh(): void {
        this.isRefreshing = true;
        this.loadData();
        setTimeout(() => {
            this.isRefreshing = false;
        }, 1000);
    }

    private loadData(): void {
        // Use forkJoin to fetch both uptime and response times at once
        forkJoin({
            uptime: this.dashboardService.getUptimeInfo(),
            responseTimes: this.dashboardService.getResponseTimeHistory()
        }).subscribe(({ uptime, responseTimes }) => {
            this.uptimeInfo = uptime;
            this.formattedUptime = this.formatUptime(uptime.uptimeSeconds);

            // Pass the real data to the chart update method
            this.updateChartData(responseTimes);

            this.updateServiceMetrics(); // You could update avgResponseTime here too
            this.updateHealthIndicators();
            this.loading = false;
        });
    }

    private updateServiceMetrics(): void {
        this.serviceMetrics = [
            {
                label: 'Response Time',
                value: `${this.avgResponseTime}ms`,
                icon: 'pi-bolt',
                color: 'yellow',
                trend: 'down',
                trendValue: '12%'
            },
            {
                label: 'Throughput',
                value: '2.4k/s',
                icon: 'pi-arrow-right-arrow-left',
                color: 'blue',
                trend: 'up',
                trendValue: '8%'
            },
            {
                label: 'Active Sessions',
                value: 847,
                icon: 'pi-users',
                color: 'green',
                trend: 'stable',
                trendValue: '0%'
            },
            {
                label: 'Error Rate',
                value: '0.02%',
                icon: 'pi-exclamation-triangle',
                color: 'red',
                trend: 'down',
                trendValue: '5%'
            }
        ];
    }

    private updateHealthIndicators(): void {
        this.healthIndicators = [
            { name: 'Database', status: 'healthy', tooltip: 'All database connections healthy' },
            { name: 'Cache', status: 'healthy', tooltip: 'Redis cache operational' },
            { name: 'Queue', status: 'warning', tooltip: 'High queue depth detected' },
            { name: 'Storage', status: 'healthy', tooltip: 'Storage usage normal' },
            { name: 'Memory', status: 'healthy', tooltip: 'Memory usage within limits' },
            { name: 'API Gateway', status: 'healthy', tooltip: 'All endpoints responsive' }
        ];
    }

    private initializeChart(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.responseTimeChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.3,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: '#fff',
                    borderWidth: 1,
                    displayColors: false,
                    callbacks: {
                        label: function(context: any) {
                            return context.parsed.y + 'ms';
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: false
                },
                y: {
                    display: false,
                    beginAtZero: false
                }
            },
            elements: {
                point: {
                    radius: 0
                },
                line: {
                    borderWidth: 2,
                    tension: 0.4
                }
            }
        };

        this.updateChartData([]);
    }
// Modify updateChartData to accept the real data
    private updateChartData(data: TimeDataPoint[]): void {
        const documentStyle = getComputedStyle(document.documentElement);

        // Format the data for the chart
        const labels = data.map(point => new Date(point.timestamp).toLocaleTimeString());
        const values = data.map(point => point.value);

        // You can also calculate the new average response time here
        if (values.length > 0) {
            this.avgResponseTime = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        }

        this.responseTimeChartData = {
            labels: labels,
            datasets: [{
                data: values,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true
            }]
        };
    }

    private generateResponseTimeData(): { labels: string[], values: number[] } {
        const labels = [];
        const values = [];
        const now = new Date();

        for (let i = 59; i >= 0; i--) {
            const time = new Date(now.getTime() - i * 60000);
            labels.push(time.toLocaleTimeString());
            values.push(Math.floor(Math.random() * 50) + 100);
        }

        return { labels, values };
    }

    private formatUptime(totalSeconds: number): string {
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);

        return parts.join(' ') || '0m';
    }

    getStatusSeverity(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'success';
            case 'DEGRADED': return 'warning';
            case 'OFFLINE': return 'danger';
        }
    }

    getStatusIcon(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'pi pi-check-circle';
            case 'DEGRADED': return 'pi pi-exclamation-triangle';
            case 'OFFLINE': return 'pi pi-times-circle';
        }
    }

    getMainStatusClass(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
            case 'DEGRADED': return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
            case 'OFFLINE': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
        }
    }

    getStatusBgClass(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'bg-green-100 dark:bg-green-800/30';
            case 'DEGRADED': return 'bg-yellow-100 dark:bg-yellow-800/30';
            case 'OFFLINE': return 'bg-red-100 dark:bg-red-800/30';
        }
    }

    getStatusTextClass(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'text-green-600 dark:text-green-400';
            case 'DEGRADED': return 'text-yellow-600 dark:text-yellow-400';
            case 'OFFLINE': return 'text-red-600 dark:text-red-400';
        }
    }

    getUptimePercentageClass(): string {
        if (this.uptimePercentage >= 99.9) return 'text-green-600 dark:text-green-400';
        if (this.uptimePercentage >= 99.0) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

    getTrendClass(trend: 'up' | 'down' | 'stable'): string {
        switch (trend) {
            case 'up': return 'text-green-500';
            case 'down': return 'text-red-500';
            case 'stable': return 'text-gray-500';
        }
    }

    getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
        switch (trend) {
            case 'up': return 'pi pi-arrow-up text-xs';
            case 'down': return 'pi pi-arrow-down text-xs';
            case 'stable': return 'pi pi-minus text-xs';
        }
    }

    getIndicatorBgClass(status: string): string {
        switch (status) {
            case 'healthy': return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
            case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
            case 'error': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
            default: return 'bg-gray-50 dark:bg-gray-900/20';
        }
    }

    getIndicatorIcon(status: string): string {
        switch (status) {
            case 'healthy': return 'pi pi-check-circle text-green-500 text-xs';
            case 'warning': return 'pi pi-exclamation-triangle text-yellow-500 text-xs';
            case 'error': return 'pi pi-times-circle text-red-500 text-xs';
            default: return 'pi pi-circle text-gray-500 text-xs';
        }
    }

    getResponseTimeStatus(): string {
        if (this.avgResponseTime < 100) return 'Excellent';
        if (this.avgResponseTime < 200) return 'Good';
        if (this.avgResponseTime < 500) return 'Fair';
        return 'Poor';
    }

    getResponseTimeSeverity(): string {
        if (this.avgResponseTime < 100) return 'success';
        if (this.avgResponseTime < 200) return 'info';
        if (this.avgResponseTime < 500) return 'warning';
        return 'danger';
    }
}
