import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class AiChatService {
    private readonly CHAT_URL = `${environment.apiUrl}/api/ai/chat`;

    constructor(private http: HttpClient) { }

    sendMessage(query: string): Observable<{ answer: string }> {
        return this.http.post<{ answer: string }>(this.CHAT_URL, { query });
    }
}
