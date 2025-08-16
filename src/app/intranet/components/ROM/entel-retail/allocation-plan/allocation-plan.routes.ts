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
                path: 'GestionRoles',
                loadChildren: () => import('./gestion-roles/gestion-roles.routes').then(m => m.routes)
            }
        ]
    }
]