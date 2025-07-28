import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseStatusWidget } from '../../../app/pages/dashboard/components/database-status.widget'
import { RecentActivityWidget } from '../../../app/pages/dashboard/components/recent-activity.widget';
import { EndpointStatsWidget } from '../../../app/pages/dashboard/components/endpoint-stats.widget';
import {QueryExplorerWidget} from "../../pages/dashboard/components/query-explorer.widget";
import {QuickActionsWidget} from "../../pages/dashboard/components/quick-actions.widget";

@Component({
    selector: 'app-dashboard',
    standalone: true,
    // Import your new, dynamic widgets
    imports: [CommonModule, DatabaseStatusWidget, RecentActivityWidget, EndpointStatsWidget, QueryExplorerWidget, QuickActionsWidget],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 lg:col-span-5">
                <app-endpoint-stats-widget />
            </div>
            <div class="col-span-12 lg:col-span-7">
                <app-database-status-widget />
            </div>
            <div class="col-span-12 lg:col-span-5">
                <app-quick-actions-widget />
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
