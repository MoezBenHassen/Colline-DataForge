import { Component, effect, OnInit, Signal } from '@angular/core';
import {MenuItem, MessageService} from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../app.configurator';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Tooltip } from 'primeng/tooltip';
import { Ripple } from 'primeng/ripple';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import {
    DatabaseType,
    GlobalStateService,
    DatabaseOption
} from '../../../services/gloable-state.service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import {DbManagementService} from "../../../services/db-management.service";
import {Divider} from "primeng/divider";

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, Tooltip, Ripple, OverlayBadgeModule, Select, FormsModule, Button],
    templateUrl: 'topbar-component.html'
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    selectedDefaultDb: DatabaseType = null;
    // This property now holds a signal of the enriched options
    public readonly dbOptions: Signal<DatabaseOption[]>;
    public isRefreshingDbStatus = false;
    public isReloadingQueries = false;

    constructor(
        private auth: AuthService,
        public layoutService: LayoutService,
        private globalStateService: GlobalStateService,
        private dbService: DbManagementService,
        private messageService: MessageService
    ) {
        // Get the signal directly from the service
        this.dbOptions = this.globalStateService.databaseOptionsWithStatus;

        effect(() => {
            this.selectedDefaultDb = this.globalStateService.defaultDatabase();
        });
    }

    onReloadQueries(): void {
        this.isReloadingQueries = true;
        this.dbService.reloadQueries().subscribe({
            next: (response) => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Queries Reloaded',
                    detail: response,
                    life: 3000
                });
                this.isReloadingQueries = false;
            },
            error: (err) => {
                const detail = err.error || 'Failed to connect to the server';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Reloading Queries',
                    detail: detail,
                    life: 3000
                });
                this.isReloadingQueries = false;
            }
        });
    }
    ngOnInit(): void {
        // Initialize the dropdown by reading the signal's current value
    }
    onRefreshDbStatus(): void {
        this.isRefreshingDbStatus = true; // Show loading spinner
        this.globalStateService.refreshDbStatus().subscribe({
            // When the refresh is complete, hide the spinner
            complete: () => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Queries Reloaded',
                    detail: ' 📀🔮 Database status refreshed successfully',
                    life: 3000
                });
                this.isRefreshingDbStatus = false;
            },
            error: () => {
                const detail = 'Failed to connect to the server';
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error Refreshing DB Status',
                    detail: detail,
                    life: 3000
                });
                this.isRefreshingDbStatus = false; // Also hide on error
            }
        });
    }
    /**
     * Called when the user changes the default DB. It still just calls the service.
     */
    onDefaultDbChange(event: { value: DatabaseType }): void {
        this.globalStateService.setDefaultDatabase(event.value);
    }

    logout(): void {
        console.log('Logging out...');
        this.auth.logout();
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
