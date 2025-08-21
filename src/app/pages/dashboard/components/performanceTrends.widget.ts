import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';
import { ButtonModule } from 'primeng/button';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';

interface TimeRange {
    label: string;
    value: string;
}

@Component({
    selector: 'app-performance-trends-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, ButtonModule, SelectButtonModule, FormsModule],
    template: `
        <div class="card !mb-8">
            <div class="flex justify-between items-center mb-4">
                <h5 class="font-semibold text-xl">Performance Trends</h5>
                <p-selectButton
                    [options]="timeRanges"
                    [(ngModel)]="selectedTimeRange"
                    optionLabel="label"
                    optionValue="value"
                    (onChange)="onTimeRangeChange()"
                    styleClass="p-button-sm">
                </p-selectButton>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
                <!-- KPI Cards -->
                <div class="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Avg Response Time</p>
                            <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">124ms</p>
                        </div>
                        <div class="flex items-center text-green-500">
                            <i class="pi pi-arrow-down text-sm mr-1"></i>
                            <span class="text-sm font-medium">12%</span>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Success Rate</p>
                            <p class="text-2xl font-bold text-green-600 dark:text-green-400">99.8%</p>
                        </div>
                        <div class="flex items-center text-green-500">
                            <i class="pi pi-arrow-up text-sm mr-1"></i>
                            <span class="text-sm font-medium">0.3%</span>
                        </div>
                    </div>
                </div>

                <div class="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 dark:text-gray-400 mb-1">Throughput</p>
                            <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">2.4k/s</p>
                        </div>
                        <div class="flex items-center text-green-500">
                            <i class="pi pi-arrow-up text-sm mr-1"></i>
                            <span class="text-sm font-medium">18%</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Chart -->
            <p-chart type="line" [data]="chartData" [options]="chartOptions" height="300px"></p-chart>
        </div>
    `,
    styles: [`
        :host ::ng-deep .p-selectbutton .p-button {
            padding: 0.25rem 0.5rem;
            font-size: 0.875rem;
        }

        :host ::ng-deep .p-selectbutton .p-button.p-highlight {
            background: var(--primary-color);
            border-color: var(--primary-color);
        }
    `]
})
export class PerformanceTrendsWidget implements OnInit, OnDestroy {
    chartData: any;
    chartOptions: any;
    subscription!: Subscription;

    timeRanges: TimeRange[] = [
        { label: '1H', value: '1h' },
        { label: '24H', value: '24h' },
        { label: '7D', value: '7d' },
        { label: '30D', value: '30d' }
    ];

    selectedTimeRange = '24h';

    constructor(public layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit() {
        this.initChart();
    }

    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onTimeRangeChange() {
        // Refresh chart data based on selected time range
        this.initChart();
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        // Generate sample data based on time range
        const labels = this.generateLabels();
        const responseTimeData = this.generateData(100, 150);
        const throughputData = this.generateData(2000, 2800);
        const errorRateData = this.generateData(0, 5);

        this.chartData = {
            labels: labels,
            datasets: [
                {
                    label: 'Response Time (ms)',
                    data: responseTimeData,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--blue-500'),
                    backgroundColor: documentStyle.getPropertyValue('--blue-500'),
                    tension: 0.4,
                    yAxisID: 'y'
                },
                {
                    label: 'Throughput (req/s)',
                    data: throughputData,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--green-500'),
                    backgroundColor: documentStyle.getPropertyValue('--green-500'),
                    tension: 0.4,
                    yAxisID: 'y1'
                },
                {
                    label: 'Error Rate (%)',
                    data: errorRateData,
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--red-500'),
                    backgroundColor: documentStyle.getPropertyValue('--red-500'),
                    tension: 0.4,
                    yAxisID: 'y2',
                    hidden: true // Hidden by default
                }
            ]
        };

        this.chartOptions = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
            plugins: {
                legend: {
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            scales: {
                x: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Response Time (ms)',
                        color: textColorSecondary
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: surfaceBorder,
                        drawBorder: false
                    },
                    title: {
                        display: true,
                        text: 'Throughput (req/s)',
                        color: textColorSecondary
                    }
                },
                y2: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        };
    }

    private generateLabels(): string[] {
        const count = this.selectedTimeRange === '1h' ? 12 :
            this.selectedTimeRange === '24h' ? 24 :
                this.selectedTimeRange === '7d' ? 7 : 30;

        const labels = [];
        for (let i = 0; i < count; i++) {
            if (this.selectedTimeRange === '1h') {
                labels.push(`${i * 5}m`);
            } else if (this.selectedTimeRange === '24h') {
                labels.push(`${i}:00`);
            } else {
                labels.push(`Day ${i + 1}`);
            }
        }
        return labels;
    }

    private generateData(min: number, max: number): number[] {
        const count = this.selectedTimeRange === '1h' ? 12 :
            this.selectedTimeRange === '24h' ? 24 :
                this.selectedTimeRange === '7d' ? 7 : 30;

        const data = [];
        for (let i = 0; i < count; i++) {
            data.push(Math.floor(Math.random() * (max - min + 1)) + min);
        }
        return data;
    }
}
