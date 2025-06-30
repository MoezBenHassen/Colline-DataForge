// src/app/services/excel.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExcelService {
    private readonly BASE_URL = '/api/excel';

    constructor(private http: HttpClient) {}

    interestRate(
        file: File,
        numRows: number,
        databaseType: string,
        clearWarnings?: boolean
    ): Observable<Blob> {
        const formData = new FormData();
        formData.append('file', file);

        // Query params
        let params = new HttpParams()
            .set('numRows', numRows)
            .set('databaseType', databaseType);
        if (clearWarnings !== undefined) {
            params = params.set('clearWarnings', String(clearWarnings));
        }

        return this.http.post(`${this.BASE_URL}/interest-rate`, formData, {
            params,
            responseType: 'blob' // Get the Excel file as a Blob
        });
    }
}
