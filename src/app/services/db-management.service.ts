import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
@Injectable({
    providedIn: 'root'
})
export class DbManagementService {
    private readonly BASE_URL = environment.apiUrl + '/api/database-management';

    constructor(private http: HttpClient) {}

    getQueryByKey(dbType: string, key: string): Observable<string | string[]> {
        return this.http.get<string | string[]>(`${this.BASE_URL}/queries/${dbType}/${key}`, {
            params: new HttpParams().set('dbType', dbType).set('key', key)
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
