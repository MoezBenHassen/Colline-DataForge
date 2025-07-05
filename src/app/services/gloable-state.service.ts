import { Injectable, signal } from '@angular/core';

export type DatabaseType = 'ORACLE' | 'MSSQL' | 'POSTGRESQL' | null;

@Injectable({
    providedIn: 'root'
})
export class GlobalStateService {
    private readonly STORAGE_KEY = 'defaultDatabaseType';

    // Create a writable signal for internal state
    private readonly _defaultDatabase = signal<DatabaseType>(this.getInitialState());

    // Expose the signal as a read-only version to prevent outside components from changing it
    public readonly defaultDatabase = this._defaultDatabase.asReadonly();

    constructor() { }

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
