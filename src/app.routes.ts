import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/helpers/auth.guard';
import { RoutePaths } from './app/constants/RoutePaths';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        canActivate: [AuthGuard],
        children: [
            { path: '', component: Dashboard },
            { path: `${RoutePaths.UIKIT}`, loadChildren: () => import('./app/pages/uikit/uikit.routes'), canActivate: [AuthGuard] },
            { path: `${RoutePaths.DOCUMENTATION}`, component: Documentation, canActivate: [AuthGuard] },
            { path: `${RoutePaths.PAGES}`, loadChildren: () => import('./app/pages/pages.routes'), canActivate: [AuthGuard] }
        ]
    },
    { path: `${RoutePaths.LANDING}`, component: Landing },
    { path: `${RoutePaths.NOTFOUND}`, component: Notfound },
    { path: `${RoutePaths.AUTH}`,
        loadChildren: () => import('./app/pages/auth/auth.routes') },
    { path: '**', redirectTo: '/notfound' }
];
