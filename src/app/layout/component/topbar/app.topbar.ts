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
import { DatabaseType, GlobalStateService } from '../../../services/gloable-state.service';
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
    defaultDbOptions: { label: string; value: DatabaseType }[];
    selectedDefaultDb: DatabaseType = null;

    constructor(
        private auth: AuthService,
        public layoutService: LayoutService,
        private globalStateService: GlobalStateService
    ) {
        this.defaultDbOptions = [
            { label: 'Oracle', value: 'ORACLE' },
            { label: 'PostgreSQL', value: 'POSTGRESQL' },
            { label: 'MS SQL', value: 'MSSQL' }
        ];
    }

    ngOnInit(): void {
        // Initialize the dropdown with the current value from the service (or localStorage).
        this.selectedDefaultDb = this.globalStateService.getCurrentDefaultDatabase();
    }

    /**
     * Called when the user changes the default DB selection in the topbar.
     * It updates the global state service.
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
