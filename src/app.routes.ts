import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/core/helpers/auth.guard';
import { RoutePaths } from './app/core/constants/RoutePaths';
import { EndpointPageComponent } from './app/pages/endpoint-page/endpoint-page.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard },
            { path: `${RoutePaths.UIKIT}`, loadChildren: () => import('./app/pages/uikit/uikit.routes'), canActivate: [AuthGuard] },
            { path: `${RoutePaths.DOCUMENTATION}`, component: Documentation, canActivate: [AuthGuard] },
            { path: `${RoutePaths.PAGES}`, loadChildren: () => import('./app/pages/pages.routes'), canActivate: [AuthGuard] },
            { path: 'interest-rate', component: EndpointPageComponent, data: { endpointKey: 'interest-rate' } },
            { path: 'fx-rates', component: EndpointPageComponent, data: { endpointKey: 'fx-rates' } },
            { path: 'org-ratings', component: EndpointPageComponent, data: { endpointKey: 'org-ratings' } },
            { path: 'org-contacts', component: EndpointPageComponent, data: { endpointKey: 'org-contacts' } },

        ]
    },

    { path: `${RoutePaths.LANDING}`, component: Landing },
    { path: `${RoutePaths.NOTFOUND}`, component: Notfound },
    { path: `${RoutePaths.AUTH}`,
        loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
