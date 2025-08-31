import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/main'
            },
            {
                path: 'ModuloRegistro',
                loadChildren: () => import('./modulo-registros/modulo-registros.routes').then(m => m.routes)
            }
        ]
    }
]