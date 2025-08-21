import { Component, OnInit } from '@angular/core';
import { Skeleton } from 'primeng/skeleton';
import { DashboardService, TimeDataPoint } from '../../../services/dashboard.service';

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
    imports: [
        Skeleton
        /* ... Add all necessary PrimeNG/Angular modules ... */
    ],
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
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">...</div>
                <div class="mb-4">...</div>
                <div class="mb-4">...</div>
                <div class="grid grid-cols-3 gap-2">...</div>
            }
        </div>
    `
})
export class ServiceDetailsWidgetComponent implements OnInit {
    loading = true;
    avgResponseTime = 124;
    responseTimeChartData: any;
    responseTimeChartOptions: any;
    // ... COPY all properties for metrics, health, and chart here
    // e.g., serviceMetrics, healthIndicators, responseTimeChartData, avgResponseTime
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
            this.updateServiceMetrics(); // These are still static
            this.updateHealthIndicators(false); // Assume online if this call succeeds
            this.loading = false;
        });
    }

    // ... COPY all methods for metrics, health, and chart here
    // e.g., initializeChart, updateChartData, updateServiceMetrics, etc.

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
}
