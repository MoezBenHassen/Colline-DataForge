import { Injectable, signal } from '@angular/core';
import { forkJoin, Observable, tap } from 'rxjs';
import { DbManagementService } from './db-management.service'; // Import the service

// This interface defines the new shape of our dropdown options
export interface DatabaseOption {
    label: string;
    value: 'ORACLE' | 'MSSQL' | 'POSTGRESQL';
    configured: boolean;
    active: boolean;
    disabled: boolean;
}

export const DATABASE_OPTIONS_BASE = [
    { label: 'Oracle', value: 'ORACLE' },
    { label: 'PostgreSQL', value: 'POSTGRESQL' },
    { label: 'MS SQL', value: 'MSSQL' }
] as const;

export type DatabaseType = typeof DATABASE_OPTIONS_BASE[number]['value'] | null;

@Injectable({
    providedIn: 'root'
})
export class GlobalStateService {
    private readonly STORAGE_KEY = 'defaultDatabaseType';

    // This signal will hold our new, enriched options list
    public readonly databaseOptionsWithStatus = signal<DatabaseOption[]>([]);

    private readonly _defaultDatabase = signal<DatabaseType>(this.getInitialState());
    public readonly defaultDatabase = this._defaultDatabase.asReadonly();

    constructor(private dbService: DbManagementService) {
        //this.initializeDbStatus();
        this.refreshDbStatus().subscribe();
    }
    /**
     * Re-fetches the configured and ping status for all databases and updates the signal.
     * @returns An Observable that completes when the refresh is done.
     */
    public refreshDbStatus(): Observable<any> {
        return forkJoin({
            configured: this.dbService.getConfiguredDatabases(),
            pingStatus: this.dbService.getPingStatus()
        }).pipe(
            tap(({ configured, pingStatus }) => {
                const enrichedOptions = DATABASE_OPTIONS_BASE.map(option => {
                    const isConfigured = configured.includes(option.value);
                    const isActive = isConfigured && pingStatus[option.value] === true;
                    return {
                        ...option,
                        configured: isConfigured,
                        active: isActive,
                        disabled: !isConfigured
                    };
                });
                this.databaseOptionsWithStatus.set(enrichedOptions);
                console.log('Database statuses have been refreshed.');
            })
        );
    }
    private initializeDbStatus(): void {
        // Use forkJoin to make both API calls in parallel
        forkJoin({
            configured: this.dbService.getConfiguredDatabases(),
            pingStatus: this.dbService.getPingStatus()
        }).subscribe(({ configured, pingStatus }) => {

            const enrichedOptions = DATABASE_OPTIONS_BASE.map(option => {
                const isConfigured = configured.includes(option.value);
                const isActive = isConfigured && pingStatus[option.value] === true;

                return {
                    ...option,
                    configured: isConfigured,
                    active: isActive,
                    disabled: !isConfigured // An option is disabled if it's not configured
                };
            });

            this.databaseOptionsWithStatus.set(enrichedOptions);
        });
    }


    private getInitialState(): DatabaseType {
        return localStorage.getItem(this.STORAGE_KEY) as DatabaseType | null;
    }
    /**
     * Updates the default database type.
     */
    setDefaultDatabase(dbType: DatabaseType): void {
        if (dbType) {
            localStorage.setItem(this.STORAGE_KEY, dbType);
        } else {
            localStorage.removeItem(this.STORAGE_KEY);
        }
        // Use .set() to update the signal's value
        this._defaultDatabase.set(dbType);
    }

}
