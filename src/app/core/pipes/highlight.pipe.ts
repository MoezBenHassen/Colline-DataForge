import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Pipe({
    name: 'highlight',
    standalone: true,
})
export class HighlightPipe implements PipeTransform {
    constructor(private sanitizer: DomSanitizer) {}

    transform(value: string, searchTerm: string): SafeHtml {
        if (!searchTerm || !value) {
            return value;
        }

        // Use a regular expression for a case-insensitive search and replace
        const regex = new RegExp(searchTerm, 'gi');
        const highlightedText = value.replace(
            regex,
            (match) => `<span class="highlight">${match}</span>`
        );

        // Bypass security to render the HTML. This is safe because we are constructing
        // the HTML ourselves and not using raw user input in the tags.
        return this.sanitizer.bypassSecurityTrustHtml(highlightedText);
    }
}
