import { Directive, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import hljs from 'highlight.js';

@Directive({
    selector: '[appHighlight]',
    standalone: true,
})
export class HighlightDirective implements OnChanges {
    // The directive will be used like: <code [appHighlight]="yourCodeString"></code>
    @Input('appHighlight') code: string | string[] = '';
    @Input() language: string = 'sql'; // Default to SQL, but can be changed

    constructor(private el: ElementRef<HTMLElement>) {}

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['code'] && this.code) {
            this.highlight();
        }
    }

    private highlight(): void {
        const codeToHighlight = Array.isArray(this.code) ? this.code.join('\n---\n') : this.code;

        // 1. Set the text content of the element to the raw code
        this.el.nativeElement.textContent = codeToHighlight;

        // 2. Run highlight.js on the element
        hljs.highlightElement(this.el.nativeElement);
    }
}
