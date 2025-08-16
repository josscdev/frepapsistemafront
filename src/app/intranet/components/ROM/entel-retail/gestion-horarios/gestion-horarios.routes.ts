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
                path: 'PlanificacionHorarios',
                loadChildren: () => import('./planificacion-horarios/planificacion-horarios.routes').then(m => m.routes)
            }
        ]
    }
]