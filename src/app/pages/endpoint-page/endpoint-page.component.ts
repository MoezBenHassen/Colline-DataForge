import { Component, effect, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EndpointMetadata, ENDPOINTS_METADATA } from '../../core/constants/endpoints-metadata';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import {MessageService, PrimeTemplate} from 'primeng/api';
// --- NEW ---
import { ExecutionFormComponent } from './execution-form-section/execution-form.component';
import { DocSectionComponent } from './doc-section/doc-section.component';
import { ExcelService } from '../../services/excel.service';
import { DbManagementService } from '../../services/db-management.service';
import { DatabaseType, GlobalStateService } from '../../services/gloable-state.service';
import {Panel} from "primeng/panel";
import {HttpResponse} from "@angular/common/http";
import {Message} from "primeng/message";
import {TabPanel, TabView} from "primeng/tabview";
import {FaqSectionComponent} from "./doc-section/faq-section.component";


@Component({
    selector: 'app-endpoint-page',
    standalone: true,
    templateUrl: './endpoint-page.component.html',
    imports: [CommonModule, DocSectionComponent, ExecutionFormComponent, Panel, Message, TabPanel, TabView, FaqSectionComponent, PrimeTemplate], // Simplified imports
    styleUrls: ['./endpoint-page.component.scss'],
    providers: [MessageService]
})
export class EndpointPageComponent implements OnInit {
    executionResult: { successMessage?: string; warnings?: string; error?: string } | null = null;
    activeTabIndex = 0; // 0 for Execution tab, 1 for Result tab
    metadata!: EndpointMetadata;
    // --- State managed by this component ---
    result: any = null;
    error: string | null = null;
    loading = false;
    sqlQuery?: string | string[];
    sqlQueryLoading = false;

    constructor(
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private dbService: DbManagementService,
        private globalStateService: GlobalStateService
    ) {
        effect(() => {
            // It will run automatically whenever the global default DB changes.
            const currentDefaultDb = this.globalStateService.defaultDatabase();
            console.log('Endpoint page detected a global DB change, fetching new SQL query...');
            this.fetchSqlQuery(currentDefaultDb);
        });
    }

    ngOnInit() {
        const endpointKey = this.route.snapshot.data['endpointKey'] || this.route.snapshot.paramMap.get('id');
        if (!endpointKey || !ENDPOINTS_METADATA[endpointKey]) {
            this.error = 'Unknown endpoint';
            return;
        }
        this.metadata = ENDPOINTS_METADATA[endpointKey];
    }

    fetchSqlQuery(dbType: DatabaseType | null) {
        if (!this.metadata) return;

        const queryKey = this.metadata.sqlQueryKey;
        if (!dbType || !queryKey) {
            this.sqlQuery = undefined;
            return;
        }

        this.sqlQueryLoading = true;
        this.dbService.getQueryByKey(dbType, queryKey).subscribe({
            next: (responseText: string | string[]) => {
                // ✅ --- THIS IS THE NEW LOGIC ---
                // We expect a string, but handle both cases for safety.
                const queryText = Array.isArray(responseText) ? JSON.stringify(responseText) : responseText;

                // Check if the string looks like a JSON array.
                if (queryText.trim().startsWith('[') && queryText.trim().endsWith(']')) {
                    try {
                        // If it looks like an array, parse it into a real JavaScript array.
                        this.sqlQuery = JSON.parse(queryText);
                    } catch (e) {
                        // If parsing fails, fall back to treating it as a single string.
                        this.sqlQuery = queryText;
                    }
                } else {
                    // If it's just a plain string, assign it directly.
                    this.sqlQuery = queryText;
                }
                // ---------------------------------

                this.sqlQueryLoading = false;
            },
            error: (err) => {
                this.sqlQuery = `[Could not load SQL query for ${dbType}]`;
                this.sqlQueryLoading = false;
            }
        });
    }

    // --- Event handler for when the child component emits the execute event ---
    handleExecute(formData: any) {
        this.error = null;
        this.result = null;
        this.loading = true;
        this.executionResult = null;
        this.loading = true;
        const { file, numRows, databaseType, clearWarnings } = formData;

        this.excelService.generate(this.metadata.key, formData).subscribe({
            // ✅ THE 'next' HANDLER RECEIVES THE FULL HttpResponse
            next: (response: HttpResponse<Blob>) => {
                this.loading = false;

                // ✅ Use response.headers.get() to read the header
                const warnings = response.headers.get('X-Warnings') ;
                console.log(warnings)
                const body = response.body;

                if (body) {
                    saveAs(body, `${this.metadata.key}.xlsx`);
                }

                if (warnings) {
                    this.executionResult = {
                        // We can still include a success message for clarity if you want
                        successMessage: 'File downloaded, but with warnings.',
                        warnings: warnings
                    };
                } else if (body) {
                    // Only show a pure success message if there are NO warnings.
                    this.executionResult = {
                        successMessage: 'File downloaded successfully! No warnings detected.'
                    };
                } else {
                    this.executionResult = { error: 'Received an empty file from the server.' };
                }
                this.activeTabIndex = 1;
            },
            // ✅ THE 'error' HANDLER RECEIVES AN HttpErrorResponse
            error: (err) => {
                this.loading = false;

                // ✅ Use err.headers.get() to read the header from the error response
                const errorHeader = err.headers.get('X-Error');
                const warningHeader = err.headers.get('X-Warnings');

                this.executionResult = {
                    error: errorHeader || 'An error occurred, see warnings for details.',
                    warnings: warningHeader || undefined
                };
                this.activeTabIndex = 1;
            }
        });
    }

    // Event handler for when the child form is reset
    handleReset() {
        this.result = null;
        this.error = null;
        this.executionResult = null;
        this.activeTabIndex = 0;
    }

    private fetchSqlQueryOnLoad() {}
}
