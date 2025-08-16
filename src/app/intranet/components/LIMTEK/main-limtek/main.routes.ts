import { Routes } from '@angular/router';
import { authGuard } from '../../../../core/guards/auth.guard';
import { routesGuard } from '../../../../core/guards/routes.guard';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MainStartComponent } from './main-layout/main-start/main-start.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'startLimtek',
            },
            {
                path: 'startLimtek',
                component: MainStartComponent,
            },
            {
                path: 'Seguridad',
                canActivate:[routesGuard],
                loadChildren: () =>
                    import('../seguridad/seguridad.routes').then((m) => m.routes),
            },
        ],
    },
];
