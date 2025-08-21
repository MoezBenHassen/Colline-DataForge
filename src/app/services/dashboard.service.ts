import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import { catchError, Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { DatabaseType } from './gloable-state.service';

export interface TimeDataPoint {
    timestamp: number;
    value: number;
}

export type DbStatus = {
    db: DatabaseType;
    online: boolean;
};
export interface DirectorySizeInfo {
    directorySizeBytes: number;
}

export interface UptimeInfo {
    uptimeSeconds: number;
    lastRestart: string;
    status?: 'ONLINE' | 'OFFLINE';
}
export interface EndpointMetric {
    path: string;
    hits: number;
}

export interface ResourceMetrics {
    cpuUsage: number;
    memoryUsedBytes: number;
    memoryMaxBytes: number;
    diskFreeBytes: number;
    diskTotalBytes: number;
    directorySizeBytes?: number;
}
export interface PrometheusMetric {
    [key: string]: string;
}
export interface PrometheusResult {
    metric: PrometheusMetric;
    value: [number, string]; // [timestamp, value]
}

export interface PrometheusResponse {
    status: string;
    data: {
        resultType: string;
        result: PrometheusResult[];
    };
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private readonly baseUrl = `${environment.apiUrl}/api/database-management`;

    constructor(private http: HttpClient) {}

    /**
     * Executes a PromQL query via the backend proxy.
     * @param promql The PromQL query string.
     */
    executePromQL(promql: string): Observable<PrometheusResponse> {
        const params = new HttpParams().set('query', promql);
        return this.http.get<PrometheusResponse>(`${environment.apiUrl}/api/prometheus-proxy/query`, { params });
    }

    /**
     * Executes a PromQL range query via the backend proxy.
     * @param promql The PromQL query string.
     * @param start The start time (ISO string or Unix timestamp).
     * @param end The end time.
     * @param step The query resolution step interval (e.g., '1h', '15m').
     */
    executePromQLRange(promql: string, start: string, end: string, step: string): Observable<PrometheusResponse> {
        const params = new HttpParams()
            .set('query', promql)
            .set('start', start)
            .set('end', end)
            .set('step', step);
        return this.http.get<PrometheusResponse>(`${environment.apiUrl}/api/prometheus-proxy/query_range`, { params });
    }
    /**
     * Fetches the most frequently used endpoints.
     */
    getTopEndpoints(): Observable<EndpointMetric[]> {
        return this.http.get<EndpointMetric[]>(`${environment.apiUrl}/api/system-metrics/top-endpoints`);
    }


    getResponseTimeHistory(): Observable<TimeDataPoint[]> {
        return this.http.get<TimeDataPoint[]>(`${environment.apiUrl}/response-time-history`)
            .pipe(
                // 5. Also make this call resilient
                catchError(error => {
                    console.error('getResponseTimeHistory failed:', error);
                    // On error, return an Observable of an empty array
                    return of([]);
                })
            );
    }

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

    /**
     * Fetches the backend service uptime and last restart time.
     */
    getUptimeInfo(): Observable<UptimeInfo> {
        return this.http.get<UptimeInfo>(`${environment.apiUrl}/api/system-metrics/uptime`)
            .pipe(
                catchError(error => {
                    console.error('getUptimeInfo failed:', error);
                    // On error, return an Observable of a fallback "OFFLINE" object
                    return of({
                        uptimeSeconds: 0,
                        lastRestart: new Date().toISOString(),
                        status: 'OFFLINE'
                    } as UptimeInfo); // ✅ Add 'as UptimeInfo' here
                })
            );
    }


    /**
     * Fetches system resource metrics (CPU, Memory, Disk).
     */
    getResourceMetrics(): Observable<ResourceMetrics> {
        return this.http.get<ResourceMetrics>(`${environment.apiUrl}/api/system-metrics/resources`);
    }

    getDirectorySize(): Observable<DirectorySizeInfo> {
        return this.http.get<DirectorySizeInfo>(`${environment.apiUrl}/api/system-metrics/directory-size`);
    }
}
