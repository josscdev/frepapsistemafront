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
                path: 'ModuloRegistrotpf',
                loadChildren: () => import('./modulo-registrotpf/modulo-registrotpf.routes').then(m => m.routes)
            },
            {
                path: 'ModuloInformaciontpf',
                loadChildren: () => import('./modulo-informaciontpf/modulo-informaciontpf.routes').then(m => m.routes)
            },
            {
                path: 'ModuloMantenimientotpf',
                loadChildren: () => import('./modulo-mantenimientotpf/modulo-mantenimientotpf.routes').then(m => m.routes)
            }
        ]
    }
]