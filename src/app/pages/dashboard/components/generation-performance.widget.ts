import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, PrometheusResult } from '../../../services/dashboard.service';
import { LayoutService } from '../../../layout/service/layout.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-generation-performance-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, SkeletonModule],
    template: `
        <div class="card">
            <h5 class="font-semibold text-xl mb-4">Average Generation Latency (Last 5m)</h5>
            @if(loading) {
                <p-skeleton height="250px"></p-skeleton>
            } @else {
                @if(chartData && chartData.datasets[0].data.length > 0) {
                    <p-chart type="bar" [data]="chartData" [options]="chartOptions" height="250px"></p-chart>
                } @else {
                    <div class="text-center p-4 text-color-secondary">
                        <i class="pi pi-chart-bar text-2xl"></i>
                        <p class="mt-2">No file generation metrics found in Prometheus.</p>
                    </div>
                }
            }
        </div>
    `
})
export class GenerationPerformanceWidget implements OnInit, OnDestroy {
    loading = true;
    chartData: any;
    chartOptions: any;
    private subscription: Subscription;
    private prometheusResults: PrometheusResult[] = []; // Store results for theme changes

    constructor(
        private dashboardService: DashboardService,
        private layoutService: LayoutService,
    ) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            // Re-initialize the chart with new theme colors if data exists
            if (this.prometheusResults.length > 0) {
                this.createChart(this.prometheusResults);
            }
        });
    }

    ngOnInit(): void {
        const promQL = `
            rate(http_server_requests_seconds_sum{uri=~"/api/excel/.*"}[5m])
            /
            rate(http_server_requests_seconds_count{uri=~"/api/excel/.*"}[5m])
        `;

        this.dashboardService.executePromQL(promQL.trim()).subscribe({
            next: (response) => {
                this.prometheusResults = response.data.result;
                this.createChart(this.prometheusResults);
                this.loading = false;
            },
            error: (err) => {
                console.error('Failed to fetch generation performance metrics:', err);
                this.loading = false;
                // Initialize with empty data to show the "No metrics found" message
                this.createChart([]);
            }
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    private createChart(results: PrometheusResult[]): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        const labels = results.map(r => r.metric['uri']?.replace('/api/excel/', '') || 'unknown');
        const data = results.map(r => parseFloat(r.value[1])); // Use numbers for data

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Average Duration (seconds)',
                    data: data,
                    backgroundColor: documentStyle.getPropertyValue('--p-teal-400'),
                    borderColor: documentStyle.getPropertyValue('--p-teal-400')
                }
            ]
        };

        this.chartOptions = {
            indexAxis: 'y',
            maintainAspectRatio: false,
            aspectRatio: 0.8,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: (context: any) => {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.x !== null) {
                                // Format to 4 decimal places only in the tooltip
                                label += context.parsed.x.toFixed(4) + ' s';
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    ticks: { color: textColorSecondary, font: { weight: 500 } },
                    grid: { color: surfaceBorder, drawBorder: false },
                    title: {
                        display: true,
                        text: 'Average Latency (seconds)',
                        color: textColorSecondary
                    }
                },
                y: {
                    ticks: { color: textColorSecondary },
                    grid: { display: false }
                }
            }
        };
    }
}
