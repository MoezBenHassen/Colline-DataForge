import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { DashboardService, EndpointMetric } from '../../../services/dashboard.service';

@Component({
    selector: 'app-top-endpoints-widget',
    standalone: true,
    imports: [CommonModule, TableModule, SkeletonModule, TagModule],
    template: `
        <div class="card">
            <h5 class="font-semibold text-xl mb-4">Top Endpoints (Session)</h5>
            <p-table [value]="metrics" [tableStyle]="{ 'min-width': '25rem' }" [loading]="loading">
                <ng-template pTemplate="header">
                    <tr>
                        <th>Path</th>
                        <th style="width: 25%">Hits</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-metric>
                    <tr>
                        <td>
                            <span class="font-mono text-sm">{{ metric.path }}</span>
                        </td>
                        <td>
                            <p-tag [value]="metric.hits" severity="info"></p-tag>
                        </td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="loadingbody">
                    <tr>
                        <td><p-skeleton></p-skeleton></td>
                        <td><p-skeleton></p-skeleton></td>
                    </tr>
                     <tr>
                        <td><p-skeleton></p-skeleton></td>
                        <td><p-skeleton></p-skeleton></td>
                    </tr>
                </ng-template>
                <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="2" class="text-center p-4">
                            No API endpoints have been called yet in this session.
                        </td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class TopEndpointsWidget implements OnInit {
    loading = true;
    metrics: EndpointMetric[] = [];

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.dashboardService.getTopEndpoints().subscribe(data => {
            this.metrics = data;
            this.loading = false;
        });
    }
}
