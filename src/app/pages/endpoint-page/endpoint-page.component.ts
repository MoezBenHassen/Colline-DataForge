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
import {TabView} from "primeng/tabview";
import {FaqSectionComponent} from "./doc-section/faq-section.component";
import { Tab, TabList, TabPanel, TabPanels, Tabs } from 'primeng/tabs';
import { Badge } from 'primeng/badge';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { HighlightPipe } from '../../core/pipes/highlight.pipe';
import * as XLSX from 'xlsx';
import { TableModule } from 'primeng/table';
import {ExecutionTrackingService} from "../../services/execution-tracking.service";
import { ENDPOINTS_XML_METADATA } from '../../core/constants/endpoints-xml-metadata'; //
import { XmlService } from '../../services/xml.service';

type ExecutionResult = {
    severity: 'success' | 'warn' | 'error';
    summary: string;
    detail: string;
    filePreview?: string[][]
}
type FaqItem = { q: string; a: string }; // Helper type


@Component({
    selector: 'app-endpoint-page',
    standalone: true,
    templateUrl: './endpoint-page.component.html',
    imports: [CommonModule, DocSectionComponent, ExecutionFormComponent, Panel, Message, TabPanel,
        FaqSectionComponent, PrimeTemplate, Tabs, Tab,
        TabList, TabPanel, TabPanels, Badge, FormsModule, InputText, IconField, InputIcon, TableModule],
    styleUrls: ['./endpoint-page.component.scss'],
    providers: [MessageService, HighlightPipe]
})
export class EndpointPageComponent implements OnInit {
    executionResult: ExecutionResult | null = null;
    activeTabValue: string = '0'; // '0' for Execution, '1' for Result
    metadata!: EndpointMetadata;
    // --- State managed by this component ---
    result: any = null;
    error: string | null = null;
    loading = false;
    sqlQuery?: string | string[];
    sqlQueryLoading = false;
    faqSearchTerm: string = '';
    filteredFaq: { q: any; a: any }[] = [];

    public searchTerm: string = '';

    isXmlEndpoint: boolean = false; // Add this flag

    constructor(
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private dbService: DbManagementService,
        private globalStateService: GlobalStateService,
        private highlightPipe: HighlightPipe,
        private messageService: MessageService,
        private trackingService: ExecutionTrackingService,
        private xmlService: XmlService,
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
        if (!endpointKey) {
            this.error = 'Unknown endpoint';
            return;
        }

        // Check if the key exists in XML metadata first, then Excel
        if (ENDPOINTS_XML_METADATA[endpointKey]) {
            this.metadata = ENDPOINTS_XML_METADATA[endpointKey];
            this.isXmlEndpoint = true;
        } else if (ENDPOINTS_METADATA[endpointKey]) {
            this.metadata = ENDPOINTS_METADATA[endpointKey];
            this.isXmlEndpoint = false;
        } else {
            this.error = 'Unknown endpoint configuration';
            return;
        }

        this.filterFaq();
    }

    /**
     * Filters the metadata's FAQ list based on the faqSearchTerm.
     */
    filterFaq(): void {
        const term = this.faqSearchTerm.toLowerCase().trim();
        const sourceFaq = this.metadata?.faq || [];

        if (!term) {
            // If no search term, just use the original text
            this.filteredFaq = [...sourceFaq];
        } else {
            // If there is a search term, transform the text into highlighted SafeHtml
            this.filteredFaq = sourceFaq
                .filter((item) => item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term))
                .map((item) => ({
                    q: this.highlightPipe.transform(item.q, this.faqSearchTerm),
                    a: this.highlightPipe.transform(item.a, this.faqSearchTerm)
                }));
        }
    }

    /**
     * Clears the FAQ search term and re-runs the filter to show all items.
     */
    clearFaqSearch(): void {
        this.faqSearchTerm = '';
        this.filterFaq();
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


        const { file, numRows, databaseType, clearWarnings } = formData;
        let previewData: string[][] | undefined;

        const serviceCall$ = this.isXmlEndpoint
            ? this.xmlService.generate(this.metadata.key, formData)
            : this.excelService.generate(this.metadata.key, formData);

        serviceCall$.subscribe({
            next: async (response: HttpResponse<Blob>) => {
                const warnings = response.headers.get('X-Warnings');
                const body = response.body;
                const fileExtension = this.isXmlEndpoint ? 'xml' : 'xlsx';
                const fileName = `${this.metadata.key}.${fileExtension}`;

                let previewData: string[][] | undefined;
                if (body && !this.isXmlEndpoint) { // Only preview Excel files for now
                    previewData = await this.processFilePreview(body);
                }

                if (body) {
                    saveAs(body, fileName);
                }

                if (warnings) {
                    this.executionResult = {
                        severity: 'warn',
                        summary: 'File Downloaded with Warnings',
                        detail: warnings,
                        filePreview: previewData
                    };
                    this.messageService.add({
                        severity: 'warning',
                        summary: 'File Downloaded with Warnings',
                        detail: '🔮 File Downloaded with Warnings',
                        life: 2000
                    });
                    this.trackingService.addRecord({ name: this.metadata.title, status: 'warn', details: warnings });
                } else if (body) {
                    this.executionResult = {
                        severity: 'success',
                        summary: 'Success',
                        detail: 'File downloaded successfully!',
                        filePreview: previewData
                    };
                    this.trackingService.addRecord({ name: this.metadata.title, status: 'success', details: 'File downloaded successfully!' });
                } else {
                    this.executionResult = { severity: 'error', summary: 'Error', detail: 'Received an empty file from the server.' };
                    this.trackingService.addRecord({ name: this.metadata.title, status: 'error', details: 'Empty file received.' });
                }

                this.loading = false;
                this.activeTabValue = '1';
            },
            // ✅ THE 'error' HANDLER RECEIVES AN HttpErrorResponse
            error: (err) => {
                this.loading = false;
                const errorHeader = err.headers.get('X-Error');
                const warningHeader = err.headers.get('X-Warnings');

                // Construct the object with the correct properties: severity, summary, and detail.
                this.executionResult = {
                    severity: 'error',
                    summary: 'Execution Failed',
                    detail: errorHeader || warningHeader || 'An unknown error occurred.'
                };
                this.trackingService.addRecord({ name: this.metadata.title, status: 'error', details: ''});
                this.activeTabValue = '1';
            }
        });
    }

    /**
     * ✅ ADD THIS NEW HELPER METHOD
     * Uses SheetJS to read a Blob and extract the top 5 data rows.
     * @param blob The file blob received from the API.
     */
    private async processFilePreview(blob: Blob): Promise<string[][]> {
        try {
            const buffer = await blob.arrayBuffer();
            const workbook = XLSX.read(buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];

            // Convert sheet to an array of arrays, taking the header + 5 data rows
            const data = XLSX.utils.sheet_to_json<string[]>(worksheet, {
                header: 1,
                defval: '', // Default value for empty cells
                range: `A1:Z6` // Limit parsing to the first 6 rows (A1 to Z6)
            });

            return data;
        } catch (e) {
            console.error('Error parsing Excel preview:', e);
            return [];
        }
    }
    // Event handler for when the child form is reset
    handleReset() {
        this.result = null;
        this.error = null;
        this.executionResult = null;
        this.activeTabValue = '0';
    }

    private fetchSqlQueryOnLoad() {}
}
