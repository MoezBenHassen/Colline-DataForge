import { Component, Input } from '@angular/core';
import { EndpointMetadata } from '../../core/constants/endpoints-metadata';
import { MarkdownComponent, MarkdownModule } from 'ngx-markdown';

@Component({
    selector: 'app-doc-section',
    template: `
        <div class="doc-section">
            <h2>Documentation</h2>
            <markdown [data]="metadata.docs"></markdown>
            <div *ngIf="metadata.sampleFiles?.length">
                <h3>Screenshots / Example Output</h3>
                <img *ngFor="let img of metadata.sampleFiles" [src]="img" class="sample-image" />
            </div>
            <div *ngIf="metadata.sqlQuery">
                <h3>SQL Query Used</h3>
                <pre>{{ metadata.sqlQuery }}</pre>
            </div>
        </div>
    `,
    imports: [MarkdownComponent],
    styles: [
        `
            .sample-image {
                max-width: 400px;
                display: block;
                margin-bottom: 1rem;
            }

            pre {
                background: #222;
                color: #fff;
                padding: 0.75rem;
                border-radius: 8px;
            }
        `
    ]
})
export class DocSectionComponent {
    @Input() metadata!: EndpointMetadata;
}
