import { Component, OnInit, OnDestroy, Input, Output, EventEmitter, effect, Signal } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { startWith, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { FileUploadModule, FileSelectEvent } from 'primeng/fileupload';
import { ChipModule } from 'primeng/chip';
import { CheckboxModule } from 'primeng/checkbox';

// App Services & Models
import { EndpointMetadata, EndpointParam } from '../../../core/constants/endpoints-metadata';
import { DatabaseOption, DatabaseType, GlobalStateService } from '../../../services/gloable-state.service';


@Component({
    selector: 'app-execution-form',
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        ButtonModule,
        SelectModule,
        InputNumberModule,
        FileUploadModule,
        ChipModule,
        CheckboxModule
    ],
    templateUrl: './execution-form.component.html'
})
export class ExecutionFormComponent implements OnInit, OnDestroy {
    // === Inputs & Outputs ===
    @Input() metadata!: EndpointMetadata;
    @Input() loading: boolean = false;
    @Output() execute = new EventEmitter<any>();
    @Output() formReset = new EventEmitter<void>();
    @Output() dbTypeChange = new EventEmitter<DatabaseType>();

    form!: FormGroup;
    private formSub?: Subscription;
    public readonly dbOptions: Signal<DatabaseOption[]>;

    constructor(private globalStateService: GlobalStateService) {
        // Effect to receive updates FROM the global state
        this.dbOptions = this.globalStateService.databaseOptionsWithStatus;
        effect(() => {
            const globalDb = this.globalStateService.defaultDatabase();
            if (this.form && this.form.get('databaseType')?.value !== globalDb) {
                this.form.patchValue({ databaseType: globalDb }, { emitEvent: false });
            }
        });
    }

    ngOnInit() {
        // --- Build the FormGroup based on the metadata passed from the parent ---
        const controls: { [key: string]: FormControl } = {};
        for (const param of this.metadata.params) {
            const defaultValue = param.type === 'checkbox' ? false : null;
            // ✅ Start with an empty array for validators
            const validators = [];
            if (param.required) {
                validators.push(Validators.required);
            }

            // ✅ Add a specific validator for the 'numRows' field
            if (param.name === 'numRows') {
                validators.push(Validators.min(1));
            }
            controls[param.name] = new FormControl(defaultValue, validators);
        }
        this.form = new FormGroup(controls);

        // Set initial value from global state
        const initialDbType = this.globalStateService.defaultDatabase();
        if (initialDbType) {
            this.form.patchValue({ databaseType: initialDbType });
        }

        // Subscription sends updates FROM this form TO the global state
        const databaseTypeControl = this.form.get('databaseType');
        if (databaseTypeControl) {
            this.formSub = databaseTypeControl.valueChanges.pipe(
                debounceTime(100),
                distinctUntilChanged()
            ).subscribe((localDbType: DatabaseType) => {
                this.globalStateService.setDefaultDatabase(localDbType);
                this.dbTypeChange.emit(localDbType);
            });
        }
    }

    ngOnDestroy(): void {
        if (this.formSub) {
            this.formSub.unsubscribe();
        }
    }

    // --- Event Handlers ---
    onSubmit() {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }
        // Emit the form's value up to the parent component
        this.execute.emit(this.form.value);
    }

    onReset() {
        this.form.reset();
        for (let param of this.metadata.params) {
            if (param.type === 'checkbox') {
                this.form.get(param.name)?.setValue(false);
            }
        }
        this.formReset.emit();
    }

    // --- Helper Methods (moved from parent) ---
    public getParam(name: string): EndpointParam | undefined {
        return this.metadata?.params.find((p) => p.name === name);
    }

    get inputParams() {
        return this.metadata?.params.filter((param) => param.type !== 'checkbox' && param.type !== 'file');
    }

    onFileSelect(event: FileSelectEvent, paramName: string): void {
        if (event.files.length > 0) {
            this.form.get(paramName)?.setValue(event.files[0]);
        }
    }

    onFileClear(name: string) {
        this.form.get(name)?.setValue(null);
    }
}
