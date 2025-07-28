import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatabaseStatusWidget } from '../../../app/pages/dashboard/components/database-status.widget'
import { RecentActivityWidget } from '../../../app/pages/dashboard/components/recent-activity.widget';
import { EndpointStatsWidget } from '../../../app/pages/dashboard/components/endpoint-stats.widget';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    // Import your new, dynamic widgets
    imports: [
        CommonModule,
        DatabaseStatusWidget,
        RecentActivityWidget,
        EndpointStatsWidget
    ],
    template: `
        <div class="grid grid-cols-12 gap-6">
            <div class="col-span-12 md:col-span-6 xl:col-span-8">
                <app-database-status-widget />
            </div>
            <div class="col-span-12 md:col-span-6 xl:col-span-4">
                <app-endpoint-stats-widget />
            </div>

            <div class="col-span-12">
                <app-recent-activity-widget />
            </div>
        </div>
    `
})
export class Dashboard {
    constructor() {}
}
