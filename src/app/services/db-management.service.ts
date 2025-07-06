import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatabaseType } from './gloable-state.service';
@Injectable({
    providedIn: 'root'
})
export class DbManagementService {
    private readonly BASE_URL = environment.apiUrl + '/api/database-management';

    constructor(private http: HttpClient) {}


    /**
     * Fetches the list of database types that are configured in the backend.
     */
    getConfiguredDatabases(): Observable<DatabaseType[]> {
        return this.http.get<DatabaseType[]>(`${this.BASE_URL}/configured`);
    }

    /**
     * Pings all databases and returns their live status.
     */
    getPingStatus(): Observable<Record<string, boolean>> {
        return this.http.get<Record<string, boolean>>(`${this.BASE_URL}/ping`);
    }

    getQueryByKey(dbType: string, key: string): Observable<string | string[]> {
        return this.http.get<string | string[]>(`${this.BASE_URL}/queries/${dbType}/${key}`, {
            params: new HttpParams().set('dbType', dbType).set('key', key),
            responseType: 'text' as 'json' // Ensure the response is treated as text
        });
    }
    getDatabases(dbType: String): Observable<string[]> {
        return this.http.get<string[]>(`${this.BASE_URL}/queries/:dbType/:key`, {
            params: new HttpParams().set('dbType', 'mysql').set('key', 'databases')
        });
    }

    getTables(database: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.BASE_URL}/tables`, { params: { database } });
    }

    getColumns(database: string, table: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.BASE_URL}/columns`, { params: { database, table } });
    }
}
