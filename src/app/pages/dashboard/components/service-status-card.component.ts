import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { DashboardService, UptimeInfo } from '../../../services/dashboard.service';
import { TagModule } from 'primeng/tag';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@Component({
    selector: 'app-service-status-card',
    standalone: true,
    imports: [CommonModule, TagModule, ButtonModule, TooltipModule, DatePipe],
    template: `
    <div class="card">
      <div class="flex items-center justify-between mb-4">
        <h5 class="font-semibold text-xl">Backend Service Status</h5>
        <div class="flex items-center gap-2">
            <button class="p-button p-button-outlined p-button-rounded"
                    (click)="loadData()" [disabled]="serviceStatus === 'CHECKING'"
                    pTooltip="Refresh status">
                <i class="pi pi-refresh" [class.pi-spin]="isRefreshing"></i>
            </button>
          <p-tag [value]="serviceStatus" [severity]="getStatusSeverity()" [icon]="getStatusIcon()" styleClass="px-3 py-1"></p-tag>
        </div>
      </div>
      <div class="p-4 rounded-lg" [ngClass]="getMainStatusClass()">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-4">
            <div class="relative">
              <div class="w-14 h-14 rounded-full flex items-center justify-center" [ngClass]="getStatusBgClass()">
                <i class="pi pi-power-off text-2xl" [ngClass]="getStatusTextClass()"></i>
              </div>
              @if (serviceStatus === 'ONLINE') {
                <span class="absolute top-0 right-0 h-3 w-3">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
              }
            </div>
            <div>
              <div class="text-sm text-gray-600 dark:text-gray-400 mb-1">Service Uptime</div>
              <div class="text-2xl font-bold text-gray-900 dark:text-white">{{ formattedUptime }}</div>
              @if (uptimeInfo) {
                <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  Since {{ uptimeInfo.lastRestart | date:'medium' }}
                </div>
              }
            </div>
          </div>
          <div class="text-right">
            <div class="text-3xl font-bold" [ngClass]="getUptimePercentageClass()">{{ uptimePercentage }}%</div>
            <div class="text-xs text-gray-600 dark:text-gray-400">Availability</div>
          </div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .animate-ping { animation: ping 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
    @keyframes ping { 75%, 100% { transform: scale(2); opacity: 0; } }
  `]
})
export class ServiceStatusCardComponent implements OnInit {
    uptimeInfo: UptimeInfo | null = null;
    formattedUptime: string | number = '...';
    uptimePercentage = 99.9;
    serviceStatus: 'ONLINE' | 'DEGRADED' | 'OFFLINE' | 'CHECKING' = 'CHECKING';
    avgResponseTime = 124;
    constructor(private dashboardService: DashboardService) {}
    isRefreshing = false;

    ngOnInit(): void { this.loadData(); }

    loadData(): void {
        this.serviceStatus = 'CHECKING';
        this.isRefreshing = true;
        this.dashboardService.getUptimeInfo().subscribe({
            next: (uptime) => {
                if (uptime.status === 'OFFLINE') {
                    this.handleOfflineState();
                    this.isRefreshing = false;
                } else {
                    this.uptimeInfo = uptime;
                    this.serviceStatus = 'ONLINE';
                    this.formattedUptime = this.formatUptime(uptime.uptimeSeconds);
                    this.uptimePercentage = 99.9;
                    this.isRefreshing = false;
                }
            },
            error: () => this.handleOfflineState()
        });
    }

    private handleOfflineState(): void {
        this.serviceStatus = 'OFFLINE';
        this.formattedUptime = '0m';
        this.uptimePercentage = 0;
        this.uptimeInfo = { uptimeSeconds: 0, lastRestart: new Date().toISOString() };
    }

    getTrendClass(trend: 'up' | 'down' | 'stable'): string {
        switch (trend) {
            case 'up': return 'text-green-500';
            case 'down': return 'text-red-500';
            case 'stable': return 'text-gray-500';
        }
    }

    getTrendIcon(trend: 'up' | 'down' | 'stable'): string {
        switch (trend) {
            case 'up': return 'pi pi-arrow-up text-xs';
            case 'down': return 'pi pi-arrow-down text-xs';
            case 'stable': return 'pi pi-minus text-xs';
        }
    }

    getIndicatorBgClass(status: string): string {
        switch (status) {
            case 'healthy': return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
            case 'warning': return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
            case 'error': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
            default: return 'bg-gray-50 dark:bg-gray-900/20';
        }
    }

    getIndicatorIcon(status: string): string {
        switch (status) {
            case 'healthy': return 'pi pi-check-circle text-green-500 text-xs';
            case 'warning': return 'pi pi-exclamation-triangle text-yellow-500 text-xs';
            case 'error': return 'pi pi-times-circle text-red-500 text-xs';
            default: return 'pi pi-circle text-gray-500 text-xs';
        }
    }

    getResponseTimeStatus(): string {
        if (this.avgResponseTime < 100) return 'Excellent';
        if (this.avgResponseTime < 200) return 'Good';
        if (this.avgResponseTime < 500) return 'Fair';
        return 'Poor';
    }

    getResponseTimeSeverity(): string {
        if (this.avgResponseTime < 100) return 'success';
        if (this.avgResponseTime < 200) return 'info';
        if (this.avgResponseTime < 500) return 'warning';
        return 'danger';
    }
    private formatUptime(totalSeconds: number): string {
        const days = Math.floor(totalSeconds / 86400);
        totalSeconds %= 86400;
        const hours = Math.floor(totalSeconds / 3600);
        totalSeconds %= 3600;
        const minutes = Math.floor(totalSeconds / 60);

        const parts = [];
        if (days > 0) parts.push(`${days}d`);
        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);

        return parts.join(' ') || '0m';
    }

    getStatusSeverity(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'success';
            case 'DEGRADED': return 'warning';
            case 'OFFLINE': return 'danger';
            case 'CHECKING': return 'info'; // Use a neutral color
        }
    }

    getStatusIcon(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'pi pi-check-circle';
            case 'DEGRADED': return 'pi pi-exclamation-triangle';
            case 'OFFLINE': return 'pi pi-times-circle';
            case 'CHECKING': return 'pi pi-spin pi-spinner';
        }
    }

    getMainStatusClass(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800';
            case 'DEGRADED': return 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800';
            case 'OFFLINE': return 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800';
            case 'CHECKING': return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
        }

    }

    getStatusBgClass(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'bg-green-100 dark:bg-green-800/30';
            case 'DEGRADED': return 'bg-yellow-100 dark:bg-yellow-800/30';
            case 'OFFLINE': return 'bg-red-100 dark:bg-red-800/30';
            case 'CHECKING': return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
        }
    }

    getStatusTextClass(): string {
        switch (this.serviceStatus) {
            case 'ONLINE': return 'text-green-600 dark:text-green-400';
            case 'DEGRADED': return 'text-yellow-600 dark:text-yellow-400';
            case 'OFFLINE': return 'text-red-600 dark:text-red-400';
            case 'CHECKING': return 'bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800';
        }
    }

    getUptimePercentageClass(): string {
        if (this.uptimePercentage >= 99.9) return 'text-green-600 dark:text-green-400';
        if (this.uptimePercentage >= 99.0) return 'text-yellow-600 dark:text-yellow-400';
        return 'text-red-600 dark:text-red-400';
    }

}
