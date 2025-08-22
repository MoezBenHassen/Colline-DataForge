import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import {Table, TableModule} from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { DashboardService } from '../../../services/dashboard.service';
import { DatabaseType } from '../../../services/gloable-state.service';

@Component({
    selector: 'app-query-explorer-widget',
    standalone: true,
    imports: [CommonModule, DropdownModule, FormsModule, TableModule, InputTextModule, SkeletonModule],
    template: `
        <div class="card h-full">
            <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
                <h5 class="font-semibold text-xl m-0">Query Explorer</h5>
                <p-dropdown
                    [options]="configuredDBs"
                    [(ngModel)]="selectedDb"
                    placeholder="Select a Database"
                    (onChange)="onDbChange()">
                </p-dropdown>
            </div>

            @if (loading) {
                <p-skeleton height="250px"></p-skeleton>
            } @else {
                <p-table
                    #dt
                    [value]="queryKeys"
                    [paginator]="true"
                    [rows]="6"
                    [rowsPerPageOptions]="[6, 10, 20]"
                    [globalFilterFields]="['query']"
                    [scrollable]="true"
                    scrollHeight="400px"
                >
                    <ng-template pTemplate="caption">
                        <div class="flex justify-end">
                            <input pInputText type="text" (input)="onGlobalFilter($event, dt)" placeholder="Search queries..." />
                        </div>
                    </ng-template>
                    <ng-template pTemplate="header">
                        <tr>
                            <th>Available Query Keys for {{ selectedDb }}</th>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="body" let-item>
                        <tr>
                            <td>{{ item.query }}</td>
                        </tr>
                    </ng-template>
                    <ng-template pTemplate="emptymessage">
                        <tr>
                            <td class="text-center p-4">
                                {{ selectedDb ? 'No queries found.' : 'Please select a database to see available queries.' }}
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
            }
        </div>
    `
})
export class QueryExplorerWidget implements OnInit {
    configuredDBs: DatabaseType[] = [];
    selectedDb: DatabaseType | null = null;
    queryKeys: { query: string }[] = [];
    loading = false;

    constructor(private dashboardService: DashboardService) {}

    ngOnInit(): void {
        this.dashboardService.getConfiguredDatabases().subscribe(dbs => {
            this.configuredDBs = dbs;
            if (dbs.length > 0) {
                this.selectedDb = dbs[0];
                this.loadQueriesForDb();
            }
        });
    }

    onDbChange(): void {
        this.loadQueriesForDb();
    }

    private loadQueriesForDb(): void {
        if (!this.selectedDb) return;
        this.loading = true;
        this.queryKeys = [];

        this.dashboardService.getAllQueryKeys(this.selectedDb).subscribe(keys => {
            this.queryKeys = keys.map(key => ({ query: key }));
            this.loading = false;
        });
    }
    onGlobalFilter(event: Event, dt: Table) {
        const input = event.target as HTMLInputElement;
        dt.filterGlobal(input.value, 'contains');
    }


}
