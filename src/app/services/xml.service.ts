import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class XmlService {
    private readonly apiUrl = `${environment.apiUrl}/api/xml`;

    constructor(private http: HttpClient) {}

    /**
     * Generic method to call any XML generation endpoint.
     * @param endpointKey The key from the metadata (e.g., 'generate-agreements').
     * @param formData The form data containing files and parameters.
     * @returns An Observable with the full HttpResponse containing the Blob.
     */
    generate(endpointKey: string, formData: any): Observable<HttpResponse<Blob>> {
        const data = new FormData();

        // Append all form fields to FormData
        for (const key in formData) {
            if (formData.hasOwnProperty(key)) {
                data.append(key, formData[key]);
            }
        }

        const path = this.getPathFromKey(endpointKey);

        return this.http.post(`${environment.apiUrl}${path}`, data, {
            observe: 'response',
            responseType: 'blob'
        });
    }

    /**
     * Helper to get the API path from the endpoint key.
     * This can be expanded to use the metadata file directly for more robustness.
     */
    private getPathFromKey(key: string): string {
        // In a real app, you would import ENDPOINTS_XML_METADATA here
        // and look up the path. For now, we'll construct it.
        return `/api/xml/${key}`;
    }
}
