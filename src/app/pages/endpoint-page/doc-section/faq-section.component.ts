import { Component, Input, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import {PanelModule} from "primeng/panel";
import { FormsModule } from '@angular/forms';
import { HighlightPipe } from '../../../core/pipes/highlight.pipe';

@Component({
    selector: 'app-faq-section',
    imports: [NgForOf, PanelModule, FormsModule],
    template: `
        <div class="flex flex-col gap-2">
            <p-panel *ngFor="let item of faq" [toggleable]="true" [collapsed]="true">
                <ng-template pTemplate="header">
                    <span class="font-semibold" [innerHTML]="item.q"></span>
                </ng-template>
                <p class="m-0 leading-normal" [innerHTML]="item.a"></p>
            </p-panel>
        </div>
    `
})
export class FaqSectionComponent {
    @Input() faq!: { q: any; a: any }[];
}
