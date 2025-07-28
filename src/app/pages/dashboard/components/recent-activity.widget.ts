import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BadgeModule } from 'primeng/badge';
import { ExecutionRecord, ExecutionTrackingService } from '../../../services/execution-tracking.service';
import { Observable } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-recent-activity-widget',
    standalone: true,
    imports: [CommonModule, DatePipe, BadgeModule, TooltipModule],
    template: `
        <div class="card">
            <h5 class="font-semibold text-xl mb-4">Recent Activity</h5>
            <ul class="p-0 m-0 list-none">
                @for (item of history$ | async; track $index) {
                    <li class="flex items-center py-3 border-b border-surface">
                        <div class="w-12 h-12 flex items-center justify-center rounded-full mr-4 shrink-0" [ngClass]="getIconBgClass(item.status)">
                             <i class="!text-xl" [ngClass]="[getIcon(item.status), getIconColorClass(item.status)]"></i>
                        </div>
                        <div class="flex-grow">
                            <div class="text-color font-medium">{{ item.name }}</div>
                            <div class="text-color-secondary text-sm">{{ item.timestamp | date:'mediumTime' }}</div>
                        </div>
                        <p-badge
                            [pTooltip]="item.details" tooltipPosition="left"
                            [value]="item.status"
                            [severity]="getSeverity(item.status)"></p-badge>
                    </li>
                } @empty {
                     <div class="text-center p-4 text-color-secondary">
                        <i class="pi pi-history text-2xl"></i>
                        <p class="mt-2">No executions in this session yet.</p>
                    </div>
                }
            </ul>
        </div>
    `
})
export class RecentActivityWidget implements OnInit {
    history$!: Observable<ExecutionRecord[]>;

    constructor(private trackingService: ExecutionTrackingService) {}

    ngOnInit(): void {
        this.history$ = this.trackingService.executionHistory$;
    }

    getIcon(status: ExecutionRecord['status']): string {
        switch (status) {
            case 'success': return 'pi pi-check';
            case 'warn': return 'pi pi-exclamation-triangle';
            case 'error': return 'pi pi-times';
        }
    }

    getSeverity(status: ExecutionRecord['status']) {
        if(status === 'warn') return 'warn';
        return status === 'success' ? 'success' : 'danger';
    }

    getIconBgClass(status: ExecutionRecord['status']): string {
        switch (status) {
            case 'success': return 'bg-green-100 dark:bg-green-400/10';
            case 'warn': return 'bg-yellow-100 dark:bg-yellow-400/10';
            case 'error': return 'bg-red-100 dark:bg-red-400/10';
        }
    }

    getIconColorClass(status: ExecutionRecord['status']): string {
        switch (status) {
            case 'success': return 'text-green-500';
            case 'warn': return 'text-yellow-500';
            case 'error': return 'text-red-500';
        }
    }
}
