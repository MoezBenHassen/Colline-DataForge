import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AppFloatingConfigurator } from '../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-notfound',
    standalone: true,
    imports: [RouterModule, AppFloatingConfigurator, ButtonModule],
    template: ` <app-floating-configurator />
        <div class="flex items-center justify-center min-h-screen overflow-hidden">
            <div class="flex flex-col items-center justify-center">
                <svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg"
                     viewBox="0 0 346 342"
                     class="mb-8 w-16 shrink-0 mx-auto">
                    <defs>
                        <style>.cls-1{fill:var(--primary-color);}</style>
                    </defs>
                    <!--
                      By setting the viewBox to the icon's original dimensions and removing the transform,
                      the browser will correctly scale the entire icon to fit the w-16 class without cropping.
                    -->
                    <path class="cls-1"
                          d="M183.64,136.9c-2.23,0-7.86-4.87-10.9-7.78-3.78-3.62-7.56-7.22-11.33-10.84-3-2.91-3.07-4.81-.13-7.85,1.48-1.53,3.1-2.93,4.57-4.47s1.5-2.73-.07-4.28q-5.13-5.07-10.39-10c-1.76-1.66-3.06-1.58-5,.32-3.86,3.82-7.65,7.72-11.49,11.56L99.48,142.87c-2.37,2.35-2.39,3.35,0,5.6q4.6,4.44,9.26,8.82c2,1.91,3.27,1.92,5.31,0,2.24-2.14,4.41-4.34,6.6-6.53s3.74-2.23,5.78,0c3.21,3.48,6.69,6.8,9.42,10.63a24.18,24.18,0,0,1-2,30.64c-6.57,7.29-13.81,14-20.67,21-2.55,2.61-4.84,5.45-7.29,8.24-4.76-4.28-8.79-7.91-12.84-11.53-16.66-14.89-34.91-27.34-55.58-36.06A139.11,139.11,0,0,0,.94,164a8,8,0,0,1-.81-.19v-4.71C5.65,158.06,11,157.2,16.27,156c20.59-4.73,39.43-13.54,57-25.14,23.89-15.8,45.29-34.43,63.13-56.94,10.32-13,19.45-26.79,25.41-42.44A94.74,94.74,0,0,0,168.19.38h5.11c.55,4.57.9,9.09,1.67,13.53,2.32,13.5,7.72,25.84,14.6,37.59,7.75,13.25,17.47,25,27.92,36.15,2.63,2.8,5.28,5.6,8.1,8.59-1.73,1.69-3.5,3.38-5.23,5.1Q208,113.66,195.71,126c-.58.58-1.19,1.14-1.79,1.7" />
                    <path class="cls-1"
                          d="M209.07,157.59c0,2.24,5,7.76,8,10.75l11.07,11.1c3,3,4.87,3,7.85,0,1.5-1.51,2.87-3.16,4.38-4.66s2.69-1.55,4.27,0q5.18,5,10.24,10.19c1.69,1.72,1.64,3-.23,5-3.74,3.94-7.55,7.81-11.31,11.73q-19.28,20.1-38.53,40.22c-2.3,2.41-3.3,2.45-5.6.16q-4.53-4.52-9-9.08c-1.95-2-2-3.23-.07-5.31,2.09-2.28,4.25-4.49,6.39-6.72s2.16-3.79-.09-5.78c-3.54-3.15-6.93-6.56-10.83-9.21A24.18,24.18,0,0,0,155,208.51c-7.16,6.72-13.7,14.1-20.6,21.1-2.56,2.59-5.36,4.95-8.09,7.45,4.37,4.68,8.09,8.63,11.78,12.6,15.23,16.36,28,34.35,37.18,54.84a138.69,138.69,0,0,1,10.38,36.31,8.23,8.23,0,0,0,.21.81l2.38-.05,2.32-.05c.95-5.55,1.7-10.91,2.8-16.2,4.31-20.69,12.74-39.7,24-57.47,15.31-24.21,33.5-46,55.65-64.28,12.8-10.58,26.39-20,41.92-26.26a94.75,94.75,0,0,1,30.94-7l-.1-5.11c-4.58-.46-9.1-.72-13.56-1.39-13.54-2.05-26-7.2-37.88-13.84-13.4-7.48-25.33-17-36.7-27.18-2.86-2.57-5.71-5.16-8.76-7.92-1.65,1.76-3.3,3.56-5,5.32q-12.07,12.58-24.14,25.16c-.58.59-1.12,1.21-1.67,1.82" />
                </svg>
                <div style="border-radius: 56px; padding: 0.3rem; background: linear-gradient(180deg, color-mix(in srgb, var(--primary-color), transparent 60%) 10%, var(--surface-ground) 30%)">
                    <div class="w-full bg-surface-0 dark:bg-surface-900 py-20 px-8 sm:px-20 flex flex-col items-center" style="border-radius: 53px">
                        <span class="text-primary font-bold text-3xl">404</span>
                        <h1 class="text-surface-900 dark:text-surface-0 font-bold text-3xl lg:text-5xl mb-2">Not Found</h1>
                        <div class="text-surface-600 dark:text-surface-200 mb-8">Requested resource is not available.</div>
                        <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-table !text-2xl"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0 block">Broken component ?</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Very unlikely.</span>
                            </span>
                        </a>
                        <a routerLink="/" class="w-full flex items-center py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-question-circle !text-2xl"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Wrong path ?</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Double check the URL.</span>
                            </span>
                        </a>
                        <a routerLink="/" class="w-full flex items-center mb-8 py-8 border-surface-300 dark:border-surface-500 border-b">
                            <span class="flex justify-center items-center border-2 border-primary text-primary rounded-border" style="height: 3.5rem; width: 3.5rem">
                                <i class="pi pi-fw pi-unlock !text-2xl"></i>
                            </span>
                            <span class="ml-6 flex flex-col">
                                <span class="text-surface-900 dark:text-surface-0 lg:text-xl font-medium mb-0">Permission</span>
                                <span class="text-surface-600 dark:text-surface-200 lg:text-xl">Check available permissions</span>
                            </span>
                        </a>
                        <p-button label="Go to Dashboard" routerLink="/" />
                    </div>
                </div>
            </div>
        </div>`
})
export class Notfound {}
