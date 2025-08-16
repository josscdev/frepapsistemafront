import { Routes } from "@angular/router";

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
                path: 'GestionRolestpf',
                loadChildren: () => import('./gestion-rolestpf/gestion-rolestpf.routes').then(m => m.routes)
            }
        ]
    }
]