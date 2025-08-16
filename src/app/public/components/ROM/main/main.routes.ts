import { Routes } from '@angular/router';
import { MainLayoutComponent } from './main-layout/main-layout.component';

export const routes: Routes = [
    {
        path: '',
        component: MainLayoutComponent,
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/public/Rom/main/Entel/FirmaBundle'
            },
            {
                path:'Entel',
                loadChildren: () => import('../entel/entel.routes').then(m => m.routes)
            }
        ]
    }
]