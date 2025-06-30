import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { EndpointMetadata, ENDPOINTS_METADATA } from '../../core/constants/endpoints-metadata';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocSectionComponent } from './doc-section.component'// <--- fix import!
import { FaqSectionComponent } from './faq-section.component';
import { Button } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ExcelService } from '../../services/excel.sevice';
import { saveAs } from 'file-saver';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { Chip } from 'primeng/chip';
import { Checkbox } from 'primeng/checkbox';

@Component({
    selector: 'app-endpoint-page',
    standalone: true,
    templateUrl: './endpoint-page.component.html',
    imports: [FormsModule, CommonModule, DocSectionComponent, FaqSectionComponent, Button, InputText, DropdownModule, FileUpload, Chip, Checkbox],
    styleUrls: ['./endpoint-page.component.scss'],
    providers: [MessageService]
})
export class EndpointPageComponent implements OnInit {
    metadata!: EndpointMetadata;
    form: Record<string, any> = {};
    result: any = null;
    error: string | null = null;
    loading = false;
    uploadedFiles: any[] = [];

    constructor(
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        // Support both static (data) and dynamic (param) routes
        const endpointKey = this.route.snapshot.data['endpointKey'] || this.route.snapshot.paramMap.get('id');
        if (!endpointKey || !ENDPOINTS_METADATA[endpointKey]) {
            this.error = 'Unknown endpoint';
            return;
        }
        this.metadata = ENDPOINTS_METADATA[endpointKey];

        // Set default values for checkboxes
        for (let param of this.metadata.params) {
            if (param.type === 'checkbox') {
                this.form[param.name] = false;
            }
        }
    }

    onSubmit() {
        this.loading = true;
        this.error = null;
        this.result = null;

        // Validate required fields
        const { numRows, databaseType, file, clearWarnings } = this.form;
        if (!file || !numRows || !databaseType) {
            this.error = 'Please provide all required fields and upload a file.';
            this.loading = false;
            return;
        }

        this.excelService.interestRate(file, numRows, databaseType, clearWarnings).subscribe({
            next: (blob: Blob) => {
                // Save/download the file using file-saver
                saveAs(blob, 'filled_interest_rates.xlsx');
                this.result = 'File downloaded!';
                this.loading = false;
            },
            error: (err) => {
                this.error = 'Failed to generate file: ' + (err.error?.message || err.statusText || 'Unknown error');
                this.loading = false;
            }
        });
    }

    onReset() {
        this.form = {};
        this.result = null;
        this.error = null;
        // Reset checkboxes to false after reset
        for (let param of this.metadata.params) {
            if (param.type === 'checkbox') {
                this.form[param.name] = false;
            }
        }
    }

    onUpload(event: any) {
        for (const file of event.files) {
            this.uploadedFiles.push(file);
        }

        this.messageService.add({ severity: 'info', summary: 'Success', detail: 'File Uploaded' });
    }

    /**
     * Handles file selection from the p-fileUpload component (works for both basic and advanced modes).
     * This method is triggered by the (onSelect) event.
     * @param event The file select event containing the selected file(s).
     * @param paramName The name of the form parameter to update.
     */
    onFileSelect(event: FileSelectEvent, paramName: string): void {
        if (event.files.length > 0) {
            // Store the selected file in your form model
            this.form[paramName] = event.files[0];
            console.log(`File selected for ${paramName}:`, this.form[paramName].name);
        }
    }
    protected readonly navigator = navigator;

    onFileClear(name: string) {
        this.form[name] = null; // Clear the file input
        this.uploadedFiles = this.uploadedFiles.filter((file) => file.name !== name); // Remove from uploaded files
    }
}
