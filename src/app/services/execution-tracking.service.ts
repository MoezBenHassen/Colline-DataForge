import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ExecutionRecord {
    name: string;
    timestamp: Date;
    status: 'success' | 'warn' | 'error';
    details: string;
}

@Injectable({
    providedIn: 'root'
})
export class ExecutionTrackingService {
    private readonly MAX_HISTORY = 10;

    private readonly executionHistorySubject = new BehaviorSubject<ExecutionRecord[]>([]);
    public executionHistory$ = this.executionHistorySubject.asObservable();

    constructor() { }

    addRecord(record: Omit<ExecutionRecord, 'timestamp'>): void {
        const newRecord: ExecutionRecord = {
            ...record,
            timestamp: new Date()
        };

        const currentHistory = this.executionHistorySubject.getValue();
        const updatedHistory = [newRecord, ...currentHistory].slice(0, this.MAX_HISTORY);

        this.executionHistorySubject.next(updatedHistory);
    }
}
