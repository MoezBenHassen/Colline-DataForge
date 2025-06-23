import { Component } from '@angular/core';

@Component({
    standalone: true,
    selector: 'app-footer',
    template: `<div class="layout-footer">
        DataForge by
        <a href="https://github.com/MoezBenHassen" target="_blank" rel="noopener noreferrer" class="text-primary font-bold hover:underline">Moez Ben Hassen</a>
    </div>`
})
export class AppFooter {}
