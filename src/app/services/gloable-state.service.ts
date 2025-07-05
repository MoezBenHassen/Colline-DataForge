import { Injectable, signal } from '@angular/core';

//export type DatabaseType = 'ORACLE' | 'MSSQL' | 'POSTGRESQL' | null;
export const DATABASE_OPTIONS = [
    { label: 'Oracle', value: 'ORACLE' },
    { label: 'PostgreSQL', value: 'POSTGRESQL' },
    { label: 'MS SQL', value: 'MSSQL' }
] as const;

// 2. Derive the type from the array's values.
//    This creates the type: 'ORACLE' | 'MSSQL' | 'POSTGRESQL' | null
export type DatabaseType = typeof DATABASE_OPTIONS[number]['value'] | null;

@Injectable({
    providedIn: 'root'
})
export class GlobalStateService {
    private readonly STORAGE_KEY = 'defaultDatabaseType';
    // --- ADD THIS OPTIONS ARRAY ---
    public readonly databaseOptions = DATABASE_OPTIONS;
    // -
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
