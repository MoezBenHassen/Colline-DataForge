import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

// Define a type for clarity, allowing null when no default is set.
export type DatabaseType = 'ORACLE' | 'MSSQL' | 'POSTGRESQL' | null;

@Injectable({
    providedIn: 'root'
})
export class GlobalStateService {
    private readonly STORAGE_KEY = 'defaultDatabaseType';

    // BehaviorSubject holds the current value and emits it immediately to new subscribers.
    private readonly _defaultDatabase$ = new BehaviorSubject<DatabaseType>(this.getInitialState());

    // Expose the state as a public, read-only observable for components to subscribe to.
    public readonly defaultDatabase$: Observable<DatabaseType> = this._defaultDatabase$.asObservable();

    constructor() { }

    private getInitialState(): DatabaseType {
        // On startup, load the saved state from localStorage.
        return localStorage.getItem(this.STORAGE_KEY) as DatabaseType | null;
    }

    /**
     * Updates the default database type, saves it to localStorage,
     * and notifies all subscribed components of the change.
     * @param dbType The new database type, or null to clear the default.
     */
    setDefaultDatabase(dbType: DatabaseType): void {
        if (dbType) {
            localStorage.setItem(this.STORAGE_KEY, dbType);
        } else {
            // If null is passed, clear the stored preference.
            localStorage.removeItem(this.STORAGE_KEY);
        }
        // Emit the new value to all subscribers.
        this._defaultDatabase$.next(dbType);
    }

    /**
     * A helper method to get the current value synchronously.
     * @returns The currently selected default database type.
     */
    getCurrentDefaultDatabase(): DatabaseType {
        return this._defaultDatabase$.getValue();
    }
}
