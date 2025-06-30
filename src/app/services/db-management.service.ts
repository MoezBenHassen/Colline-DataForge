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

    /*
    *    @GetMapping("/queries/{databaseType}/{key}")
    @Operation(
            summary = "Retrieve a Specific Query by Key",
            description = "Fetches the raw SQL for a single query using its unique key. The response can be a single SQL string or a list of strings if the key maps to multiple queries.",
            responses = {
                    @ApiResponse(responseCode = "200", description = "The SQL query string (or list of strings) for the given key."),
                    @ApiResponse(responseCode = "404", description = "No query was found for the specified key and database type.", content = @Content)
            }
    )
    public ResponseEntity<Object> getQueryByKey(
            @Parameter(description = "The database to query against.", required = true, example = "ORACLE")
            @PathVariable DatabaseType databaseType,
            @Parameter(description = "The unique key of the query to retrieve.", required = true, example = "fetch.interest.rates")
            @PathVariable String key
    ) {
        Object query = SQLQueryLoader.getQueryAny(key, databaseType);
        if (query == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(query);
    }*/
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
