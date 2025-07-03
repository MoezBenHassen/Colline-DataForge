import { Component, Input } from '@angular/core';
import { NgForOf } from '@angular/common';
import {Panel} from "primeng/panel";

@Component({
    selector: 'app-faq-section',
    imports: [NgForOf, Panel],
    template: `
        <div class="flex flex-col gap-2">
            <p-panel *ngFor="let item of faq" [toggleable]="true" [collapsed]="true">
                <ng-template pTemplate="header">
                    <span class="font-semibold">{{ item.q }}</span>
                </ng-template>
                <p class="m-0 leading-normal">{{ item.a }}</p>
            </p-panel>
        </div>
    `
})
export class FaqSectionComponent {
    @Input() faq!: { q: string; a: string }[];
}
