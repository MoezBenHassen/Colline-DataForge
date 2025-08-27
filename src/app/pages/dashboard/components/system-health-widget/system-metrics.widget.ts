import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService, ResourceMetrics } from '../../../../services/dashboard.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { ProgressBarModule } from 'primeng/progressbar';
import { Checkbox } from "primeng/checkbox";
import { FormsModule } from "@angular/forms";
import { TagModule } from 'primeng/tag';
import {DashboardRefreshService} from "../../../../services/dashboard-refersh.service";

@Component({
    selector: 'app-system-metrics-cards-widget',
    standalone: true,
    imports: [
        CommonModule,
        SkeletonModule,
        TooltipModule,
        ProgressBarModule,
        Checkbox,
        FormsModule,
        TagModule
    ],
    templateUrl: './system-health-widget.component.html',
    styleUrls: ['./system-health-styles.scss']
})
export class SystemMetricsCardsWidget implements OnInit, OnDestroy {
    loading = true;
    autoRefresh = false;
    lastUpdated = new Date();

    cpuPercent = 0;
    memPercent = 0;
    diskPercent = 0;
    dirSizePercentOfDisk = 0;
    dirSizeBytes = 0;

    memUsed = 0;
    memMax = 0;
    diskFree = 0;

    subscription?: Subscription;
    refreshSubscription?: Subscription;
    private lastMetrics: ResourceMetrics | null = null;

    constructor(private dashboardService: DashboardService,
                private refreshService: DashboardRefreshService) {}

    ngOnInit(): void {
        this.loadMetrics();
        this.refreshSubscription = this.refreshService.refresh$.subscribe(()=>
        {
          this.loadMetrics();
        });

    }

    ngOnDestroy(): void {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
        if (this.refreshSubscription) {
            this.refreshSubscription.unsubscribe();
        }
        this.refreshSubscription?.unsubscribe();
    }

    toggleAutoRefresh(): void {
        if (this.autoRefresh) {
            this.refreshSubscription = interval(30000).subscribe(() => {
                this.loadMetrics();
            });
        } else {
            this.refreshSubscription?.unsubscribe();
        }
    }

    private loadMetrics(): void {
        this.loading = true;
        forkJoin({
            metrics: this.dashboardService.getResourceMetrics(),
            dirSize: this.dashboardService.getDirectorySize()
        }).subscribe(({ metrics, dirSize }) => {
            const combinedMetrics: ResourceMetrics = {
                ...metrics,
                directorySizeBytes: dirSize.directorySizeBytes
            };

            this.lastMetrics = combinedMetrics;
            this.processMetrics(combinedMetrics);
            this.lastUpdated = new Date();
            this.loading = false;
        });
    }

    private processMetrics(metrics: ResourceMetrics): void {
        // CPU
        this.cpuPercent = Math.round(metrics.cpuUsage);

        // Memory
        this.memUsed = metrics.memoryUsedBytes;
        this.memMax = metrics.memoryMaxBytes;
        this.memPercent = Math.round((this.memUsed / this.memMax) * 100);

        // Disk
        const diskUsed = metrics.diskTotalBytes - metrics.diskFreeBytes;
        const diskTotal = metrics.diskTotalBytes;
        this.diskFree = metrics.diskFreeBytes;
        this.diskPercent = Math.round((diskUsed / diskTotal) * 100);

        // Directory
        this.dirSizeBytes = metrics.directorySizeBytes ?? 0;
        this.dirSizePercentOfDisk = diskTotal > 0 ? Math.round((this.dirSizeBytes / diskTotal) * 100) : 0;
    }

    getHealthStatus(): string {
        if (this.cpuPercent > 90 || this.memPercent > 90 || this.diskPercent > 95) {
            return 'Critical';
        } else if (this.cpuPercent > 75 || this.memPercent > 80 || this.diskPercent > 85) {
            return 'Warning';
        }
        return 'Healthy';
    }

    getHealthSeverity(): string {
        const status = this.getHealthStatus();
        if (status === 'Critical') return 'danger';
        if (status === 'Warning') return 'warning';
        return 'success';
    }

    getHealthIcon(): string {
        const status = this.getHealthStatus();
        if (status === 'Critical') return 'pi pi-exclamation-circle';
        if (status === 'Warning') return 'pi pi-exclamation-triangle';
        return 'pi pi-check-circle';
    }

    getProgressBarClass(percent: number): string {
        if (percent > 90) return 'progress-red';
        if (percent > 75) return 'progress-orange';
        if (percent > 60) return 'progress-yellow';
        return 'progress-green';
    }

    getDiskProgressBarClass(percent: number): string {
        if (percent > 90) return 'progress-red';
        if (percent > 85) return 'progress-orange';
        if (percent > 75) return 'progress-yellow';
        return 'progress-green';
    }

    protected formatBytes(bytes: number, decimals = 1): string {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
    }
}
