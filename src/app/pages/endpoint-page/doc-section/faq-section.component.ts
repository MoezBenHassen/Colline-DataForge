import { Component, Input, OnInit } from '@angular/core';
import { NgForOf } from '@angular/common';
import {PanelModule} from "primeng/panel";
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-faq-section',
    imports: [NgForOf, PanelModule, FormsModule],
    template: `
        <div class="mb-4">
            <span class="p-input-icon-left w-full">
                <i class="pi pi-search"></i>
                <input type="text" pInputText [(ngModel)]="searchTerm" (input)="filterFaq()" placeholder="Search FAQ..." class="w-full" />
            </span>
        </div>

        <div class="flex flex-col gap-2">
            <p-panel *ngFor="let item of filteredFaq" [toggleable]="true" [collapsed]="true">
                <ng-template pTemplate="header">
                    <span class="font-semibold">{{ item.q }}</span>
                </ng-template>
                <p class="m-0 leading-normal">{{ item.a }}</p>
            </p-panel>

            @if (filteredFaq.length === 0 && searchTerm) {
                <div class="text-center p-4 text-color-secondary">No results found for "{{ searchTerm }}"</div>
            }
        </div>
    `
})
export class FaqSectionComponent implements OnInit {
    // This will hold the original, complete list of FAQs
    private _fullFaq: { q: string; a: string }[] = [];

    // This property is now a setter to trigger filtering when data arrives
    @Input()
    set faq(value: { q: string; a: string }[]) {
        this._fullFaq = value || [];
        this.filterFaq(); // Filter once initially
    }

    // This will hold the filtered list that gets displayed
    public filteredFaq: { q: string; a: string }[] = [];

    // This is bound to the search input field
    public searchTerm: string = '';

    ngOnInit(): void {
        // The setter on the @Input handles initialization
    }

    /**
     * Filters the FAQ list based on the current searchTerm.
     * This is called whenever the user types in the search box.
     */
    filterFaq(): void {
        const term = this.searchTerm.toLowerCase().trim();
        if (!term) {
            this.filteredFaq = [...this._fullFaq]; // If search is empty, show all
        } else {
            this.filteredFaq = this._fullFaq.filter((item) => item.q.toLowerCase().includes(term) || item.a.toLowerCase().includes(term));
        }
    }
}
