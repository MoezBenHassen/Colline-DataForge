import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from '../app.configurator';
import { LayoutService } from '../../service/layout.service';
import { AuthService } from '../../../services/auth/auth.service';
import { Tooltip } from 'primeng/tooltip';
import { Ripple } from 'primeng/ripple';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { DatabaseType, GlobalStateService, DATABASE_OPTIONS } from '../../../services/gloable-state.service';
import { Select } from 'primeng/select';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, Tooltip, Ripple, OverlayBadgeModule, Select, FormsModule],
    templateUrl: 'topbar-component.html'
})
export class AppTopbar implements OnInit {
    items!: MenuItem[];
    selectedDefaultDb: DatabaseType = null;
    // --- THIS IS THE SIMPLIFIED TYPE DEFINITION ---
    // The type is now inferred directly from the constant.
    // public readonly defaultDbOptions: typeof DATABASE_OPTIONS;
    // 1. We'll use a slightly less strict (but still type-safe) mutable type here.
    public readonly defaultDbOptions: { label: string; value: DatabaseType }[];

    constructor(
        private auth: AuthService,
        public layoutService: LayoutService,
        private globalStateService: GlobalStateService
    ) {
        // 2. THIS IS THE FIX: Create a new, MUTABLE copy of the readonly options.
        // The spread syntax `[...]` creates a new array that the p-select component can accept.
        this.defaultDbOptions = [...this.globalStateService.databaseOptions];
    }

    ngOnInit(): void {
        // Initialize the dropdown by reading the signal's current value
        this.selectedDefaultDb = this.globalStateService.defaultDatabase();
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
