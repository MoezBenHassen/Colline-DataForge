// src/app/services/excel.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ExcelService {
    private readonly BASE_URL = environment.apiUrl+'/api/excel';

    private readonly interestRateEndpoint = `${this.BASE_URL}/interest-rate`;
    constructor(private http: HttpClient) {}

    /**
     * A generic method to call any Excel generation endpoint.
     * @param endpointKey The key for the endpoint (e.g., 'interest-rate', 'fx-rates').
     * @param formData The complete form data from the component.
     */
    generate(endpointKey: string, formData: any): Observable<Blob> {
        const url = `${this.BASE_URL}/${endpointKey}`;

        const data = new FormData();

        // Dynamically append all properties from the form data
        for (const key in formData) {
            if (formData.hasOwnProperty(key) && formData[key] !== null) {
                data.append(key, formData[key]);
            }
        }

        return this.http.post(url, data, {
            responseType: 'blob'
        });
    }
}
