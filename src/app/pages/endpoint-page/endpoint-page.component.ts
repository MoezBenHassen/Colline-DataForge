import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { EndpointMetadata, EndpointParam, ENDPOINTS_METADATA } from '../../core/constants/endpoints-metadata';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms'; // <-- Import Reactive Forms
import { CommonModule } from '@angular/common';
import { DocSectionComponent } from './doc-section.component';
import { FaqSectionComponent } from './faq-section.component';
import { Button } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { ExcelService } from '../../services/excel.service';
import { saveAs } from 'file-saver';
import { FileSelectEvent, FileUpload } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';
import { Chip } from 'primeng/chip';
import { Checkbox } from 'primeng/checkbox';
import { Select } from "primeng/select";
import { InputNumber } from "primeng/inputnumber";
import { FloatLabel } from "primeng/floatlabel";
import { LayoutService } from '../../../app/layout/service/layout.service';
import { Tooltip } from "primeng/tooltip";
import {DbManagementService} from "../../services/db-management.service";

@Component({
    selector: 'app-endpoint-page',
    standalone: true,
    templateUrl: './endpoint-page.component.html',
    imports: [
        // REMOVED FormsModule, ADDED ReactiveFormsModule
        ReactiveFormsModule,
        CommonModule,
        DocSectionComponent,
        FaqSectionComponent,
        Button,
        DropdownModule,
        FileUpload,
        Chip,
        Checkbox,
        Select,
        InputNumber,
        FloatLabel,
        Tooltip
    ],
    styleUrls: ['./endpoint-page.component.scss'],
    providers: [MessageService]
})
export class EndpointPageComponent implements OnInit {
    metadata!: EndpointMetadata;
    form!: FormGroup; // <-- Changed to FormGroup
    result: any = null;
    error: string | null = null;
    loading = false;
    uploadedFiles: any[] = [];
    sqlQuery?: string | string[];
    // validationErrors is no longer needed
    sqlQueryLoading = false;
    constructor(
        private route: ActivatedRoute,
        private excelService: ExcelService,
        private messageService: MessageService,
        protected layoutService: LayoutService,
        private dbService: DbManagementService
    ) {}

    ngOnInit() {
        const endpointKey = this.route.snapshot.data['endpointKey'] || this.route.snapshot.paramMap.get('id');
        if (!endpointKey || !ENDPOINTS_METADATA[endpointKey]) {
            this.error = 'Unknown endpoint';
            return;
        }
        this.metadata = ENDPOINTS_METADATA[endpointKey];

        // --- Dynamically build the FormGroup ---
        const controls: { [key: string]: FormControl } = {};
        for (const param of this.metadata.params) {
            const defaultValue = param.type === 'checkbox' ? false : null;
            const validators = param.required ? [Validators.required] : [];
            controls[param.name] = new FormControl(defaultValue, validators);
        }
        // Example: fetch SQL query for 'interest-rate'
        // --- Determine database type to use (default or from user form)
        const defaultDbType = 'ORACLE'; // Or fetch from a selector or user input

        this.sqlQueryLoading = true;
        this.dbService.getQueryByKey(defaultDbType, 'interest_rate') // <-- key should match backend query key
            .subscribe({
                next: (query) => {
                    this.sqlQuery = query;
                    this.sqlQueryLoading = false;
                    console.log('SQL Query loaded:', this.sqlQuery);
                },
                error: (err) => {
                    console.log('SQL Q', this.sqlQuery, 'error:', err);
                    this.sqlQuery = '[Could not load SQL query]';
                    this.sqlQueryLoading = false;
                }
            });
        this.form = new FormGroup(controls);
    }

    onSubmit() {
        this.error = null;
        this.result = null;

        // Use FormGroup's built-in validation
        if (this.form.invalid) {
            this.form.markAllAsTouched(); // Mark fields to show validation errors
            return;
        }

        this.loading = true;

        // Access form values in a type-safe way
        const { file, numRows, databaseType, clearWarnings } = this.form.value;

        this.excelService.interestRate(file, numRows, databaseType, clearWarnings).subscribe({
            next: (blob: Blob) => {
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
        this.form.reset();
        this.result = null;
        this.error = null;

        // Re-apply default 'false' for checkboxes after reset
        for (let param of this.metadata.params) {
            if (param.type === 'checkbox') {
                this.form.get(param.name)?.setValue(false);
            }
        }
    }

    public getParam(name: string): EndpointParam | undefined {
        return this.metadata?.params.find((p) => p.name === name);
    }

    onFileSelect(event: FileSelectEvent, paramName: string): void {
        if (event.files.length > 0) {
            // Use setValue or patchValue to update the form control
            this.form.get(paramName)?.setValue(event.files[0]);
            console.log(`File selected for ${paramName}:`, this.form.get(paramName)?.value.name);
        }
    }

    onFileClear(name: string) {
        this.form.get(name)?.setValue(null); // Clear the form control's value
    }

    get inputParams() {
        return this.metadata?.params.filter((param) => param.type !== 'checkbox' && param.type !== 'file');
    }

    // The manual validateForm() method is no longer needed.
    protected readonly navigator = navigator;
}
