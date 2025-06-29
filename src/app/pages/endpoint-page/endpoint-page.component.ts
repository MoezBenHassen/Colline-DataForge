import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Data } from '@angular/router';
import { EndpointMetadata, ENDPOINTS_METADATA } from '../../core/constants/endpoints-metadata';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DocSectionComponent } from './doc-section.component'// <--- fix import!
import { FaqSectionComponent } from './faq-section.component';

@Component({
    selector: 'app-endpoint-page',
    standalone: true,
    templateUrl: './endpoint-page.component.html',
    imports: [FormsModule, CommonModule, DocSectionComponent, FaqSectionComponent],
    styleUrls: ['./endpoint-page.component.scss']
})
export class EndpointPageComponent implements OnInit {
    metadata!: EndpointMetadata;
    form: Record<string, any> = {};
    result: any = null;
    error: string | null = null;
    loading = false;

    constructor(private route: ActivatedRoute) {}

    ngOnInit() {
        // Support both static (data) and dynamic (param) routes
        const endpointKey =
            this.route.snapshot.data['endpointKey'] ||
            this.route.snapshot.paramMap.get('id');
        if (!endpointKey || !ENDPOINTS_METADATA[endpointKey]) {
            this.error = 'Unknown endpoint';
            return;
        }
        this.metadata = ENDPOINTS_METADATA[endpointKey];
    }

    onSubmit() {
        this.loading = true;
        this.error = null;
        this.result = null;

        // Replace with actual API call using a service
        setTimeout(() => {
            this.result = {
                fileUrl: '/assets/sample-output.xlsx',
                warnings: [],
                output: 'Success!'
            };
            this.loading = false;
        }, 1200);
    }

    onReset() {
        this.form = {};
        this.result = null;
        this.error = null;
    }

    protected readonly navigator = navigator;
}
