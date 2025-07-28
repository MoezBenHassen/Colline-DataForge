import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, UptimeInfo } from '../../../services/dashboard.service';
import { CardModule } from 'primeng/card';

@Component({
    selector: 'app-uptime-widget',
    standalone: true,
    imports: [CommonModule, SkeletonModule, CardModule, DatePipe],
    template: `
        <div class="card h-full">
            <h5 class="font-semibold text-xl mb-4">Service Status</h5>
            @if (loading) {
                <div class="flex flex-col gap-4">
                    <p-skeleton height="2rem" width="75%"></p-skeleton>
                    <p-skeleton height="2rem" width="90%"></p-skeleton>
                </div>
            } @else if(uptimeInfo) {
                 <ul class="list-none p-0 m-0">
                    <li class="flex items-center mb-4">
                        <i class="pi pi-clock text-green-500 text-xl mr-3"></i>
                        <div>
                            <div class="text-color-secondary">Uptime</div>
                            <div class="font-bold text-lg">{{ formattedUptime }}</div>
                        </div>
                    </li>
                    <li class="flex items-center">
                        <i class="pi pi-calendar-plus text-primary text-xl mr-3"></i>
                        <div>
                            <div class="text-color-secondary">Last Restart</div>
                            <div class="font-bold text-lg">{{ uptimeInfo.lastRestart | date:'medium' }}</div>
                        </div>
                    </li>
                </ul>
            }
        </div>
    `
})
export class UptimeWidget implements OnInit {
    loading = true;
    uptimeInfo: UptimeInfo | null = null;
    formattedUptime = '';

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.dashboardService.getUptimeInfo().subscribe(data => {
            this.uptimeInfo = data;
            this.formattedUptime = this.formatUptime(data.uptimeSeconds);
            this.loading = false;
        });
    }

    private formatUptime(totalSeconds: number): string {
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);

        let result = '';
        if (days > 0) result += `${days}d `;
        if (hours > 0) result += `${hours}h `;
        if (minutes > 0) result += `${minutes}m `;
        result += `${seconds}s`;
        return result.trim();
    }
}
