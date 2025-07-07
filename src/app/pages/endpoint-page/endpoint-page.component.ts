import { Component, effect, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EndpointMetadata, ENDPOINTS_METADATA } from '../../core/constants/endpoints-metadata';
import { CommonModule } from '@angular/common';
import { saveAs } from 'file-saver';
import { MessageService } from 'primeng/api';
// --- NEW ---
import { ExecutionFormComponent } from './execution-form-section/execution-form.component';
import { DocSectionComponent } from './doc-section/doc-section.component';
import { ExcelService } from '../../services/excel.service';
import { DbManagementService } from '../../services/db-management.service';
import { DatabaseType, GlobalStateService } from '../../services/gloable-state.service';


@Component({
    selector: 'app-endpoint-page',
    standalone: true,
    templateUrl: './endpoint-page.component.html',
    imports: [ CommonModule, DocSectionComponent, ExecutionFormComponent ], // Simplified imports
    styleUrls: ['./endpoint-page.component.scss'],
    providers: [MessageService]
})
export class EndpointPageComponent implements OnInit {
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

        const { file, numRows, databaseType, clearWarnings } = formData;

        // ✅ Make the service call and filename dynamic
        this.excelService.generate(this.metadata.key, formData).subscribe({
            next: (blob: Blob) => {
                saveAs(blob, `${this.metadata.key}.xlsx`);
                this.result = 'File downloaded successfully!';
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to generate file: ' + (err.error?.message || err.statusText || 'Unknown error');
                this.loading = false;
            }
        });
    }

    // Event handler for when the child form is reset
    handleReset() {
        this.result = null;
        this.error = null;
    }

    private fetchSqlQueryOnLoad() {

    }
}
