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
                path: 'PlanificacionHorariostpf',
                loadChildren: () => import('./planificacion-horariostpf/planificacion-horariostpf.routes').then(m => m.routes)
            }
        ]
    }
]