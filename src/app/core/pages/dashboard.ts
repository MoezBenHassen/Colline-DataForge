import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseStatusWidget } from '../../../app/pages/dashboard/components/database-status.widget'
import { RecentActivityWidget } from '../../../app/pages/dashboard/components/recent-activity.widget';
import { EndpointStatsWidget } from '../../../app/pages/dashboard/components/endpoint-stats.widget';
import {QueryExplorerWidget} from "../../pages/dashboard/components/query-explorer.widget";
import {QuickActionsWidget} from "../../pages/dashboard/components/quick-actions.widget";
import {SystemMetricsWidget} from "../../pages/dashboard/components/system-metrics.widget";
import {UptimeWidget} from "../../pages/dashboard/components/uptime.widget";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    // Import your new, dynamic widgets
    imports: [CommonModule, DatabaseStatusWidget, RecentActivityWidget, EndpointStatsWidget, QueryExplorerWidget, QuickActionsWidget, SystemMetricsWidget, UptimeWidget],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-4">
                <app-endpoint-stats-widget />
            </div>
            <div class="col-span-12 lg:col-span-4">
                <app-uptime-widget />
            </div>
            <div class="col-span-12 lg:col-span-4">
                <app-quick-actions-widget />
            </div>

            <div class="col-span-12">
                <app-system-metrics-widget />
            </div>
            <div class="col-span-12">
                <app-database-status-widget />
            </div>

            <div class="col-span-12 xl:col-span-6">
                <app-recent-activity-widget />
            </div>
            <div class="col-span-12 xl:col-span-6">
                <app-query-explorer-widget />
            </div>
        </div>
    `
})
export class Dashboard {
    constructor() {}
}
