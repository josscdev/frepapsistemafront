import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';
import { MainStartComponent } from './main-layout/main-start/main-start.component';
import { authGuard } from '../../../../core/guards/auth.guard';
import { routesGuard } from '../../../../core/guards/routes.guard';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        canActivate: [authGuard],
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'start',
            },
            {
                path: 'start',
                component: MainStartComponent,
            }, 
         
            {
                path: 'Frepap',
                canActivate:[routesGuard],
                loadChildren: () =>
                    import('./../frepapmodule/frepapmodule.routes').then((m) => m.routes),
            },
            // {
            //     path: 'EntelTpf',
            //     canActivate:[routesGuard],
            //     loadChildren: () =>
            //         import('./../entel-tpf/entel-tpf.routes').then((m) => m.routes),
            // },
            // {
            //     path: 'WinRetail',
            //     canActivate:[routesGuard],
            //     loadChildren: () =>
            //         import('./../win-retail/win-retail.routes').then((m) => m.routes),
            // },
            {
                path: 'Seguridad',
                canActivate:[routesGuard],
                loadChildren: () =>
                    import('./../seguridad/seguridad.routes').then((m) => m.routes),
            },
        ],
    },
];
