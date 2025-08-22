import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, LoggerInfo } from '../../../services/dashboard.service';
import { Table, TableModule } from 'primeng/table';
import { SkeletonModule } from 'primeng/skeleton';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { FormsModule } from '@angular/forms';
import { TagModule } from 'primeng/tag';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';

// Simplified interface for our table
export interface LoggerDisplay {
    name: string;
    level: string;
}

@Component({
    selector: 'app-log-level-manager-widget',
    standalone: true,
    imports: [CommonModule, TableModule, SkeletonModule, InputTextModule, SelectButtonModule, FormsModule, TagModule, ToastModule],
    providers: [MessageService],
    template: `
        <div class="card h-full">
            <p-toast></p-toast>
            <h5 class="font-semibold text-xl mb-4">Live Log Level Manager</h5>
            <p-table #dt [value]="loggers" [paginator]="true" [rows]="10" [loading]="loading"
                     [globalFilterFields]="['name']" tableStyleClass="p-datatable-sm">
                <ng-template pTemplate="caption">
                    <div class="flex justify-end">
                        <input pInputText type="text" (input)="dt.filterGlobal($any($event.target).value, 'contains')" placeholder="Search loggers..." />
                    </div>
                </ng-template>
                <ng-template pTemplate="header">
                    <tr>
                        <th style="width: 70%">Logger Name</th>
                        <th style="width: 30%">Level</th>
                    </tr>
                </ng-template>
                <ng-template pTemplate="body" let-logger>
                    <tr>
                        <td>
                            <span class="font-mono text-sm">{{ logger.name }}</span>
                        </td>
                        <td>
                            <p-selectButton
                                [options]="logLevels"
                                [(ngModel)]="logger.level"
                                (onChange)="setLogLevel(logger.name, $event.value)"
                                optionLabel="label"
                                optionValue="value">
                            </p-selectButton>
                        </td>
                    </tr>
                </ng-template>
                 <ng-template pTemplate="emptymessage">
                    <tr>
                        <td colspan="2" class="text-center p-4">No loggers found.</td>
                    </tr>
                </ng-template>
            </p-table>
        </div>
    `
})
export class LogLevelManagerWidget implements OnInit {
    loading = true;
    loggers: LoggerDisplay[] = [];
    logLevels: any[] = [];

    constructor(
        private dashboardService: DashboardService,
        private messageService: MessageService
    ) {}

    ngOnInit(): void {
        this.loadLoggers();
    }

    loadLoggers(): void {
        this.loading = true;
        this.dashboardService.getLoggers().subscribe(response => {
            // Transform the map from the API into a flat array for the table
            this.loggers = Object.keys(response.loggers).map(key => ({
                name: key,
                level: response.loggers[key].effectiveLevel
            }));

            // Create options for the select buttons
            this.logLevels = response.levels.map(level => ({ label: level, value: level }));
            // Add a "RESET" option
            this.logLevels.push({ label: 'RESET', value: null });

            this.loading = false;
        });
    }

    setLogLevel(name: string, level: string | null): void {
        this.dashboardService.setLoggerLevel(name, level).subscribe(() => {
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Log level for ${name} updated.`
            });
            // Refresh the list to show the new effective level
            this.loadLoggers();
        });
    }
}
