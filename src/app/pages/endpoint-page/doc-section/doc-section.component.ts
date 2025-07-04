import { Component, Input } from '@angular/core';
import { EndpointMetadata } from '../../../core/constants/endpoints-metadata';
import { CommonModule } from '@angular/common';
import { LayoutService } from '../../../layout/service/layout.service';
import { FaqSectionComponent } from '../faq-section.component';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import {Panel} from "primeng/panel";
import {Highlight} from "ngx-highlightjs";
import {HighlightLineNumbers} from "ngx-highlightjs/line-numbers";

@Component({
    selector: 'app-doc-section',
    standalone: true,
    imports: [CommonModule, FaqSectionComponent, ButtonModule, TooltipModule, Panel, Highlight, HighlightLineNumbers],
    templateUrl: './doc-section.component.html',
    styleUrls: ['./doc-section.component.scss']
})
export class DocSectionComponent {
    @Input() metadata!: EndpointMetadata;
    @Input() sqlQuery?: string | string[];
    @Input() sqlQueryLoading: boolean = false;

    // Inject LayoutService as it's used in the template for dark mode check
    constructor(protected layoutService: LayoutService) {}

    // Make navigator available to the template for the copy button
    protected readonly navigator = navigator;

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
