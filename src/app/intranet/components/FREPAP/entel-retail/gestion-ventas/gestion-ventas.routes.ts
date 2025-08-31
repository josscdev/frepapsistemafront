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
                path: 'ModuloInformacion',
                loadChildren: () => import('./modulo-informacion/modulo-informacion.routes').then(m => m.routes)
            },
            {
                path: 'ModuloMantenimiento',
                loadChildren: () => import('./modulo-mantenimiento/modulo-mantenimiento.routes').then(m => m.routes)
            },
            {
                path: 'ModuloRegistro',
                loadChildren: () => import('./modulo-registro/modulo-registro.routes').then(m => m.routes)
            }
        ]
    }
]