import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule } from 'primeng/chart';
import { Subscription } from 'rxjs';
import { ENDPOINTS_METADATA } from '../../../core/constants/endpoints-metadata';
import { LayoutService } from '../../../layout/service/layout.service';
import { ENDPOINTS_XML_METADATA } from '../../../core/constants/endpoints-xml-metadata';

@Component({
    selector: 'app-endpoint-stats-widget',
    standalone: true,
    imports: [CommonModule, ChartModule],
    template: `
        <div class="card h-full flex flex-col">
            <div class="font-semibold text-xl mb-2">Endpoint Stats</div>
            <div class="flex items-baseline">
                <div class="text-4xl font-bold text-color">{{ totalEndpoints }}</div>
                <div class="text-color-secondary ml-2">Total Endpoints</div>
            </div>
            <div class="flex-grow mt-4">
                 <p-chart type="pie" [data]="pieData" [options]="pieOptions" height="250px"></p-chart>
            </div>
        </div>
    `
})
export class EndpointStatsWidget implements OnInit, OnDestroy {
    totalEndpoints = 0;
    pieData: any;
    pieOptions: any;
    subscription: Subscription;

    constructor(private layoutService: LayoutService) {
        this.subscription = this.layoutService.configUpdate$.subscribe(() => {
            this.initChart();
        });
    }

    ngOnInit(): void {
        this.totalEndpoints = Object.keys(ENDPOINTS_METADATA).length;
        this.initChart();
    }

    initChart(): void {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color');
        const allEndpoints = [
            ...Object.values(ENDPOINTS_METADATA),
            ...Object.values(ENDPOINTS_XML_METADATA)
        ];
        this.totalEndpoints = allEndpoints.length;

        // 4. Use the combined array to calculate the tags
        const tags = allEndpoints.reduce((acc, meta) => {
            const tag = meta.swaggerTag || 'Uncategorized';
            acc[tag] = (acc[tag] || 0) + 1;
            return acc;
        }, {} as { [key: string]: number });

        const labels = Object.keys(tags);
        const data = Object.values(tags);

        this.pieData = {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: [
                    documentStyle.getPropertyValue('--p-indigo-500'),
                    documentStyle.getPropertyValue('--p-purple-500'),
                    documentStyle.getPropertyValue('--p-teal-500'),
                    documentStyle.getPropertyValue('--p-orange-500'),
                ]
            }]
        };

        this.pieOptions = {
            maintainAspectRatio: false,
            aspectRatio: 1,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        color: textColor
                    }
                }
            }
        };
    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }
}
