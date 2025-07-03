import { Component, Input } from '@angular/core';
import { EndpointMetadata } from '../../core/constants/endpoints-metadata';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-doc-section',
    imports: [NgIf],
    template: `
        <section *ngIf="metadata">
            <h2>Documentation</h2>
            <p>{{ metadata.docSection }}</p>
            <!--<img *ngFor="let img of metadata.sampleScreenshots" [src]="img" class="doc-screenshot" />-->
            <!-- Example inside your docs card or a dedicated place -->

        </section>
    `
})
export class DocSectionComponent {
    @Input() metadata!: EndpointMetadata;
}
