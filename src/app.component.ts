import { Component } from '@angular/core';
import {
    NavigationCancel,
    NavigationEnd,
    NavigationError,
    NavigationStart,
    Router,
    RouterModule
} from '@angular/router';
import { LoaderComponent } from './app/loader/loader.component';
import { Event as RouterEvent }from '@angular/router';
//import ngif
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, LoaderComponent, NgIf],
    template: `
        <app-loader *ngIf="loading"></app-loader>
        <router-outlet></router-outlet>
    `
})
export class AppComponent {
    loading = false;

    constructor(private router: Router) {
        this.router.events.subscribe((event: RouterEvent) => {
            if (event instanceof NavigationStart) {
                this.loading = true;
            } else if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
                this.loading = false;
            }
        });
    }
}
