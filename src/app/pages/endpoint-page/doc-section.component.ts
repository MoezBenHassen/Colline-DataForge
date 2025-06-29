import { Component, Input } from '@angular/core';
import { EndpointMetadata } from '../../core/constants/endpoints-metadata';

@Component({
    selector: 'app-doc-section',
    template: `
      <section *ngIf="metadata">
        <h2>Documentation</h2>
        <p>{{ metadata.docSection }}</p>
        <!--<img *ngFor="let img of metadata.sampleScreenshots" [src]="img" class="doc-screenshot" />-->
        <h3>SQL Query</h3>
        <pre>{{ metadata.sqlQuery }}</pre>
      </section>
    `
})
export class DocSectionComponent {
    @Input() metadata!: EndpointMetadata;
}
