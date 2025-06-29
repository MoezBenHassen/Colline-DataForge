import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-faq-section',
    template: `
      <div class="faq-section">
        <h2>FAQ</h2>
        <div *ngFor="let item of faq">
          <strong>Q: {{ item.q }}</strong>
          <div>A: {{ item.a }}</div>
        </div>
      </div>
    `
})
export class FaqSectionComponent {
    @Input() faq!: { q: string, a: string }[];
}
