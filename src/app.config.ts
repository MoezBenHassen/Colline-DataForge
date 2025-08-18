import {
    HTTP_INTERCEPTORS,
    provideHttpClient,
    withFetch,
    withInterceptors,
    withInterceptorsFromDi
} from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import {jwtInterceptor} from './app/core/interceptors/JwtInterceptor';
import {HighlightModule, HIGHLIGHT_OPTIONS, provideHighlightOptions} from 'ngx-highlightjs';
import {MessageService} from "primeng/api";
import { provideMarkdown } from 'ngx-markdown';

export let appConfig: ApplicationConfig;
appConfig = {
    providers: [
        provideRouter(
            appRoutes,
            withInMemoryScrolling({
                anchorScrolling: 'enabled',
                scrollPositionRestoration: 'enabled'
            }),
            withEnabledBlockingInitialNavigation()
        ),
        provideHighlightOptions({
            coreLibraryLoader: () => import('highlight.js/lib/core'),
            languages: {
                sql: () => import('highlight.js/lib/languages/sql'),
                xml: () => import('highlight.js/lib/languages/xml')
            },
            themePath: 'assets/styles/github.css'
        }),
        provideHttpClient(
            withFetch(),
            withInterceptors([
                jwtInterceptor
            ])
        ),
        provideAnimationsAsync(),
        MessageService,
        provideMarkdown(),
        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } })
    ]
};
