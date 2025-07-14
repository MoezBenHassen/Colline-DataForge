import { Component, Input, OnInit } from '@angular/core';
import { EndpointMetadata } from '../../../core/constants/endpoints-metadata';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../layout/service/layout.service';
import { FaqSectionComponent } from './faq-section.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {Panel} from "primeng/panel";
import {Highlight} from "ngx-highlightjs";
import {HighlightLineNumbers} from "ngx-highlightjs/line-numbers";
import { environment } from '../../../../environments/environment';
import {MarkdownComponent} from "ngx-markdown";
import {Fieldset} from "primeng/fieldset";

@Component({
    selector: 'app-doc-section',
    standalone: true,
    imports: [CommonModule, FaqSectionComponent, ButtonModule, TooltipModule, Panel, Highlight, MarkdownComponent, Fieldset],
    templateUrl: './doc-section.component.html',
    styleUrls: ['./doc-section.component.scss']
})
export class DocSectionComponent implements OnInit {
    @Input() metadata!: EndpointMetadata;
    @Input() sqlQuery?: string | string[];
    @Input() sqlQueryLoading: boolean = false;

    // This property will hold the generated URL for the template
    public swaggerUrl: string = '';
    // Make navigator available to the template for the copy button
    protected readonly navigator = navigator;

    // Inject LayoutService as it's used in the template for dark mode check
    constructor(protected layoutService: LayoutService) {}

    ngOnInit(): void {
        this.buildSwaggerUrl();
    }

    private buildSwaggerUrl(): void {
        if (this.metadata && this.metadata.swaggerTag && this.metadata.operationId) {
            const baseUrl = environment.apiUrl;
            // Swagger UI URL-encodes tags with spaces (e.g., "Excel Generation" becomes "Excel%20Generation")
            const encodedTag = encodeURIComponent(this.metadata.swaggerTag);
            const operationId = this.metadata.operationId;

            this.swaggerUrl = `${baseUrl}/swagger-ui/index.html#/${encodedTag}/${operationId}`;
        }
    }

    // Helper methods to check the type of the sqlQuery for correct display
    isString(value: any): value is string {
        return typeof value === 'string';
    }

    copySql(event: Event): void {
        // Prevents the panel from toggling when the button is clicked
        event.stopPropagation();

        // Perform the copy action
        if (this.sqlQuery) {
            navigator.clipboard.writeText(this.sqlQuery.toString());
            // Optionally, add a success message with PrimeNG's MessageService
        }
    }
    isArray(value: any): value is any[] {
        return Array.isArray(value);
    }
}
