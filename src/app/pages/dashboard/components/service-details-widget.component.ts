import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, TimeDataPoint } from '../../../services/dashboard.service';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';

// Helper interface, same as before
interface ServiceMetric {
    label: string;
    value: string | number;
    icon: string;
    color: string;
    trend?: 'up' | 'down' | 'stable';
    trendValue?: string;
}

@Component({
    selector: 'app-service-details-widget',
    standalone: true,
    // ✅ Fully populated imports array
    imports: [
        CommonModule,
        SkeletonModule,
        TagModule,
        TooltipModule,
        ChartModule,
        ButtonModule
    ],
    // ✅ Complete HTML template
    template: `
        <div class="card h-full">
            @if (loading) {
                <div class="space-y-4">
                    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        @for (i of [1, 2, 3, 4]; track i) {
                            <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                                <p-skeleton height="0.75rem" width="60%" styleClass="mb-2"></p-skeleton>
                                <p-skeleton height="1.5rem" width="80%"></p-skeleton>
                            </div>
                        }
                    </div>
                    <p-skeleton height="150px" width="100%"></p-skeleton>
                </div>
            } @else {
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                    @for (metric of serviceMetrics; track metric.label) {
                        <div class="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                            <div class="flex items-center justify-between mb-1">
                                <i [class]="'pi ' + metric.icon + ' text-' + metric.color + '-500'"></i>
                                @if (metric.trend) {
                                    <div class="flex items-center text-xs" [ngClass]="getTrendClass(metric.trend)">
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

                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Health Indicators</span>
                        <span class="text-xs text-gray-500">All Systems</span>
                    </div>
                    <div class="grid grid-cols-3 gap-2">
                        @for (indicator of healthIndicators; track indicator.name) {
                            <div class="flex items-center justify-between p-2 rounded-lg"
                                 [ngClass]="getIndicatorBgClass(indicator.status)"
                                 [pTooltip]="indicator.tooltip" tooltipPosition="top">
                                <span class="text-xs font-medium">{{ indicator.name }}</span>
                                <i [class]="getIndicatorIcon(indicator.status)"></i>
                            </div>
                        }
                    </div>
                </div>

                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium text-gray-700 dark:text-gray-300">Response Time (last hour)</span>
                        <div class="flex items-center gap-2">
                            <span class="text-xs text-gray-500">Avg: {{ avgResponseTime }}ms</span>
                            <p-tag [value]="getResponseTimeStatus()" [severity]="getResponseTimeSeverity()" styleClass="text-xs px-2 py-0"></p-tag>
                        </div>
                    </div>
                    <p-chart type="line" [data]="responseTimeChartData" [options]="responseTimeChartOptions" height="120px"></p-chart>
                </div>

                <div class="grid grid-cols-3 gap-2">
                    <button pButton type="button" label="View Logs" icon="pi pi-file-text" class="p-button-sm p-button-outlined" pTooltip="View application logs"></button>
                    <button pButton type="button" label="Metrics" icon="pi pi-chart-bar" class="p-button-sm p-button-outlined" pTooltip="Detailed metrics"></button>
                    <button pButton type="button" label="Restart" icon="pi pi-replay" class="p-button-sm p-button-danger p-button-outlined" pTooltip="Restart service" [disabled]="true"></button>
                </div>
            }
        </div>
    `
})
export class ServiceDetailsWidgetComponent implements OnInit {
    loading = true;
    avgResponseTime = 124;
    responseTimeChartData: any;
    responseTimeChartOptions: any;
    serviceMetrics: ServiceMetric[] = [];
    healthIndicators: any[] = [];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.loadDetails();
        this.initializeChart();
    }

    loadDetails(): void {
        this.loading = true;
        this.dashboardService.getResponseTimeHistory().subscribe((responseTimes) => {
            this.updateChartData(responseTimes);
            this.updateServiceMetrics();
            this.updateHealthIndicators(false);
            this.loading = false;
        });
    }

    private updateServiceMetrics(): void {
        this.serviceMetrics = [
            { label: 'Response Time', value: `${this.avgResponseTime}ms`, icon: 'pi-bolt', color: 'yellow', trend: 'down', trendValue: '12%' },
            { label: 'Throughput', value: '2.4k/s', icon: 'pi-arrow-right-arrow-left', color: 'blue', trend: 'up', trendValue: '8%' },
            { label: 'Active Sessions', value: 847, icon: 'pi-users', color: 'green', trend: 'stable', trendValue: '0%' },
            { label: 'Error Rate', value: '0.02%', icon: 'pi-exclamation-triangle', color: 'red', trend: 'down', trendValue: '5%' }
        ];
    }

    private updateHealthIndicators(isOffline: boolean): void {
        if (isOffline) {
            this.healthIndicators = [
                { name: 'Database', status: 'error', tooltip: 'Connection failed' },
                { name: 'Cache', status: 'error', tooltip: 'Connection failed' },
                { name: 'API Gateway', status: 'error', tooltip: 'Backend service is unreachable' }
            ];
            return;
        }
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
        this.responseTimeChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.3,
            plugins: {
                legend: { display: false },
                tooltip: {
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    callbacks: {
                        label: (context: any) => context.parsed.y + 'ms'
                    }
                }
            },
            scales: { x: { display: false }, y: { display: false } },
            elements: { point: { radius: 0 }, line: { borderWidth: 2, tension: 0.4 } }
        };
        this.updateChartData([]);
    }

    private updateChartData(data: TimeDataPoint[]): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const values = data.map(point => point.value);

        if (values.length > 0) {
            this.avgResponseTime = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        }

        this.responseTimeChartData = {
            labels: data.map(point => new Date(point.timestamp).toLocaleTimeString()),
            datasets: [{
                data: values,
                borderColor: documentStyle.getPropertyValue('--blue-500'),
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                fill: true
            }]
        };
    }

    // ✅ Added all missing helper methods
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
