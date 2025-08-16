import { Routes } from '@angular/router';
import { MainStartComponent } from './main/main-layout/main-start/main-start.component';
import { NotFoundComponent } from '../../../intranet/shared/not-found/not-found.component';
import { NotFoundPublicComponent } from '../../../intranet/shared/not-found-public/not-found-public.component';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: 'main'
            },
            // {
            //     path: 'start',
            //     component: MainStartComponent
            // },
            {
                path:'main',
                loadChildren: () => import('./main/main.routes').then(m => m.routes)
            },
            {
                path: '**', component: NotFoundPublicComponent,
            }
        ]
    }
]