import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, ResourceMetrics } from '../../../services/dashboard.service';
import { Subscription } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
    selector: 'app-system-metrics-widget',
    standalone: true,
    imports: [CommonModule, ChartModule, SkeletonModule],
    template: `
        <div class="card">
            <h5 class="font-semibold text-xl mb-4">Backend System Resources</h5>
            @if(loading) {
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <p-skeleton shape="circle" size="120px" styleClass="mx-auto"></p-skeleton>
                    <p-skeleton shape="circle" size="120px" styleClass="mx-auto"></p-skeleton>
                    <p-skeleton shape="circle" size="120px" styleClass="mx-auto"></p-skeleton>
                </div>
            } @else {
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                        <p-chart type="doughnut" [data]="cpuData" [options]="cpuChartOptions" [plugins]="[centerTextPlugin]" height="120px"></p-chart>
                        <div class="font-medium mt-2">CPU Usage</div>
                    </div>
                    <div>
                        <p-chart type="doughnut" [data]="memoryData" [options]="memoryChartOptions" [plugins]="[centerTextPlugin]" height="120px"></p-chart>
                        <div class="font-medium mt-2">Memory</div>
                    </div>
                    <div>
                        <p-chart type="doughnut" [data]="diskData" [options]="diskChartOptions" [plugins]="[centerTextPlugin]" height="120px"></p-chart>
                        <div class="font-medium mt-2">Disk Space</div>
                    </div>
                </div>
            }
        </div>
    `
})
export class SystemMetricsWidget implements OnInit, OnDestroy {
    loading = true;
    cpuData: any;
    memoryData: any;
    diskData: any;

    // Use separate options for each chart to allow for custom tooltips
    cpuChartOptions: any;
    memoryChartOptions: any;
    diskChartOptions: any;

    subscription: Subscription;
    centerTextPlugin: any;
    private lastMetrics: ResourceMetrics | null = null; // Store last metrics for theme updates

    constructor(private dashboardService: DashboardService, public layoutService: LayoutService) {
        // Fix: Use last known metrics to regenerate charts on theme change
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            if (this.lastMetrics) {
                this.createCharts(this.lastMetrics);
            }
        });
        this.initializeChartPlugin();
    }

    ngOnInit(): void {
        this.dashboardService.getResourceMetrics().subscribe(metrics => {
            this.lastMetrics = metrics; // Save the latest metrics
            this.createCharts(metrics);
            this.loading = false;
        });
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
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

    /**
     * Formats bytes into a human-readable string (KB, MB, GB, etc.).
     */
    private formatBytes(bytes: number, decimals = 1): string {
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
                    callbacks: {} // To be customized for each chart
                }
            }
        });

        // CPU Chart
        const cpuUsed = Math.round(metrics.cpuUsage);
        this.cpuData = this.buildChartData(`${cpuUsed}%`, [cpuUsed, 100 - cpuUsed], [documentStyle.getPropertyValue('--p-cyan-500'), surfaceBorder]);
        this.cpuChartOptions = getBaseOptions();
        this.cpuChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            const label = context.dataIndex === 0 ? 'Used' : 'Free';
            return `${label}: ${context.raw}%`;
        };

        // Memory Chart
        const memUsed = metrics.memoryUsedBytes;
        const memMax = metrics.memoryMaxBytes;
        const memPercent = Math.round((memUsed / memMax) * 100);
        this.memoryData = this.buildChartData(`${memPercent}%`, [memUsed, memMax - memUsed], [documentStyle.getPropertyValue('--p-orange-500'), surfaceBorder]);
        this.memoryChartOptions = getBaseOptions();
        this.memoryChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            const value = this.formatBytes(context.raw);
            if (context.dataIndex === 0) {
                return `Used: ${value} of ${this.formatBytes(memMax)}`;
            }
            return `Free: ${value}`;
        };

        // Disk Chart
        const diskUsed = metrics.diskTotalBytes - metrics.diskFreeBytes;
        const diskTotal = metrics.diskTotalBytes;
        const diskPercent = Math.round((diskUsed / diskTotal) * 100);
        this.diskData = this.buildChartData(`${diskPercent}%`, [diskUsed, metrics.diskFreeBytes], [documentStyle.getPropertyValue('--p-purple-500'), surfaceBorder]);
        this.diskChartOptions = getBaseOptions();
        this.diskChartOptions.plugins.tooltip.callbacks.label = (context: any) => {
            const value = this.formatBytes(context.raw);
            if (context.dataIndex === 0) {
                return `Used: ${value} of ${this.formatBytes(diskTotal)}`;
            }
            return `Free: ${value}`;
        };
    }

    private buildChartData(text: string, data: number[], colors: string[]): any {
        return {
            datasets: [{ data, backgroundColor: colors, hoverBackgroundColor: colors }],
            centerText: text
        };
    }
}
