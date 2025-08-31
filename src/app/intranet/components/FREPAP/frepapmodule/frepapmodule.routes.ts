import { Routes } from "@angular/router";
import { NotFoundComponent } from "../../../shared/not-found/not-found.component";

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
                path: 'GestionAfiliaciones',
                loadChildren: () => import('./gestion-afiliaciones/gestion-afiliaciones.routes').then(m => m.routes)
            }

        ]

    }
]
