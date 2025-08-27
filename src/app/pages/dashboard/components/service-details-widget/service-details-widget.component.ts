import {Component, effect, OnDestroy, OnInit, Signal} from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, TimeDataPoint } from '../../../../services/dashboard.service';
import { ChartModule } from 'primeng/chart';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { TooltipItem } from 'chart.js';
import { LayoutService } from '../../../../layout/service/layout.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { environment } from '../../../../../environments/environment';
import {forkJoin, Subscription} from 'rxjs';
import {SelectButton} from "primeng/selectbutton";
import {DashboardRefreshService} from "../../../../services/dashboard-refersh.service";
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
    imports: [CommonModule, SkeletonModule, TagModule, TooltipModule, ChartModule, ButtonModule, SelectButton],
    templateUrl:'./service-details-widget.component.html',
    styleUrls: ['./service-details-widget-styles.scss']
})
export class ServiceDetailsWidgetComponent implements OnInit, OnDestroy {
    loading = true;
    avgResponseTime = 124;
    responseTimeChartData: any;
    responseTimeChartOptions: any;
    serviceMetrics: ServiceMetric[] = [];
    healthIndicators: any[] = [];
    private lastResponseTimeData: TimeDataPoint[] = [];
    themeConfig!: Signal<any>;
    activeSessions = 0;
    private themeSubscription?: Subscription;
    private refreshSubscription?: Subscription;
    constructor(
        private dashboardService: DashboardService,
        private layoutService: LayoutService,
        private refreshService: DashboardRefreshService
    ) {

    }

    ngOnInit(): void {
        // 1. Set up the chart's appearance first.
        this.initializeChart();

        // 2. Load the initial data, which will show the skeleton loader.
        this.loadDetails();

        // 3. Subscribe to theme changes to update chart colors.
        this.themeSubscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initializeChart();
            // Re-apply existing data to the newly themed chart
            this.updateChartData(this.lastResponseTimeData);
        });

        // 4. Subscribe to the global refresh button.
        this.refreshSubscription = this.refreshService.refresh$.subscribe(() => {
            this.loadDetails();
        });
    }
    ngOnDestroy(): void {
        this.themeSubscription?.unsubscribe();
        this.refreshSubscription?.unsubscribe();
    }

    loadDetails(): void {
        this.loading = true;
        forkJoin({
            responseTimes: this.dashboardService.getResponseTimeHistory(),
            sessions: this.dashboardService.getActiveSessions()
        }).subscribe(({ responseTimes, sessions }) => {
            this.lastResponseTimeData = responseTimes;
            this.activeSessions = sessions;

            this.updateChartData(responseTimes);
            this.updateServiceMetrics();
            this.updateHealthIndicators(false);

            // Set loading to false only after all data is processed.
            this.loading = false;
        });
    }

    private updateServiceMetrics(): void {
        this.serviceMetrics = [
            { label: 'Response Time', value: `${this.avgResponseTime}ms`, icon: 'pi-bolt', color: 'yellow', trend: 'down', trendValue: '12%' },
            { label: 'Throughput', value: '2.4k/s', icon: 'pi-arrow-right-arrow-left', color: 'blue', trend: 'up', trendValue: '8%' },
            { label: 'Active Sessions', value: this.activeSessions, icon: 'pi-users', color: 'green', trend: 'stable', trendValue: '0%' },
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
        // Get theme colors for a consistent look
        const textColor = documentStyle.getPropertyValue('--p-text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--p-text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--p-surface-border');

        this.responseTimeChartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.3,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: true,
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'var(--p-surface-overlay)',
                    borderColor: 'var(--p-surface-border)',
                    borderWidth: 1,
                    displayColors: false,
                    // ✅ Explicitly set font colors to prevent flicker
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 12 },
                    titleColor: textColor,
                    bodyColor: textColor,
                    callbacks: {
                        title: (context: TooltipItem<'line'>[]) => 'At ' + context[0].label,
                        label: (context: TooltipItem<'line'>) => `Response Time: ${context.parsed.y}ms`
                    }
                }
            },
            scales: {
                x: { display: false },
                y: {
                    display: true,
                    ticks: { color: textColorSecondary }, // This will now update on theme change
                    grid: { color: surfaceBorder } // This will also update
                }
            },
            elements: {
                point: {
                    radius: 0, // Hide points by default
                    hoverRadius: 7, // Show a larger point on hover
                    hoverBackgroundColor: 'var(--p-primary-color)',
                    hoverBorderColor: '#ffffff',
                    hoverBorderWidth: 2
                },
                line: {
                    borderWidth: 2,
                    tension: 0.4 // Smooth, curved line
                }
            }
        };

        this.updateChartData([]);
    }

    private updateChartData(data: TimeDataPoint[]): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const values = data.map((point) => point.value);

        if (values.length > 0) {
            this.avgResponseTime = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
        }

        this.responseTimeChartData = {
            labels: data.map((point) => new Date(point.timestamp).toLocaleTimeString()),
            datasets: [
                {
                    data: values,
                    // --- Use Theme Colors for the Line and Fill ---
                    borderColor: documentStyle.getPropertyValue('--p-primary-color'),
                    backgroundColor: this.hexToRgba(documentStyle.getPropertyValue('--p-primary-color'), 0.1),
                    fill: true
                }
            ]
        };
    }

    private hexToRgba(hex: string, alpha: number) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }

    // ✅ Added all missing helper methods
    getTrendClass(trend: 'up' | 'down' | 'stable'): string {
        switch (trend) {
            case 'up':
                return 'text-green-500';
            case 'down':
                return 'text-red-500';
            case 'stable':
                return 'text-gray-500';
        }
    }

    getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
        switch (trend) {
            case 'up':
                return 'pi pi-arrow-up text-xs';
            case 'down':
                return 'pi pi-arrow-down text-xs';
            case 'stable':
                return 'pi pi-minus text-xs';
        }
    }

    getIndicatorBgClass(status: string): string {
        switch (status) {
            case 'healthy':
                return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
            case 'warning':
                return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
            case 'error':
                return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
            default:
                return 'bg-gray-50 dark:bg-gray-900/20';
        }
    }

    getIndicatorIcon(status: string): string {
        switch (status) {
            case 'healthy':
                return 'pi pi-check-circle text-green-500 text-xs';
            case 'warning':
                return 'pi pi-exclamation-triangle text-yellow-500 text-xs';
            case 'error':
                return 'pi pi-times-circle text-red-500 text-xs';
            default:
                return 'pi pi-circle text-gray-500 text-xs';
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

    viewLogs(): void {
        const logUrl = `${environment.apiUrl}/actuator/logfile`;
        window.open(logUrl, '_blank');
    }
}
