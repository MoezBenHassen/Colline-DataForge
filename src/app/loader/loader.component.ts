// src/app/shared/components/loader/loader.component.ts
import { Component } from '@angular/core';
import { ProgressSpinner } from 'primeng/progressspinner';

@Component({
    selector: 'app-loader',
    standalone: true,
    template: `
        <div class="loader-backdrop">
            <p-progress-spinner></p-progress-spinner>
        </div>
    `,
    imports: [
        ProgressSpinner
    ],
    styles: [`
        .loader-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(255, 255, 255, 0.4);
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: center;
        }
    `]
})
export class LoaderComponent {}
