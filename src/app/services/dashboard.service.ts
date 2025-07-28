import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatabaseType } from './gloable-state.service';

export type DbStatus = {
    db: DatabaseType;
    online: boolean;
};

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiUrl}/api/database-management`;

    constructor(private http: HttpClient) {}

    /**
     * Fetches the list of all configured database types.
     */
    getConfiguredDatabases(): Observable<DatabaseType[]> {
        return this.http.get<DatabaseType[]>(`${this.baseUrl}/configured`);
    }

    /**
     * Pings all configured databases and returns their status.
     */
    pingAllDatabases(): Observable<Map<DatabaseType, boolean>> {
        return this.http.get<Map<DatabaseType, boolean>>(`${this.baseUrl}/ping`);
    }

    /**
     * Fetches all available query keys for a given database type.
     * @param databaseType The database to get query keys for.
     */
    getAllQueryKeys(databaseType: DatabaseType): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/query-keys/${databaseType}`);
    }
}
