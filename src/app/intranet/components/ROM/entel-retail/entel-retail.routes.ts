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
                path: 'GestionHorarios',
                loadChildren: () => import('./gestion-horarios/gestion-horarios.routes').then(m => m.routes)
            },
            {
                path: 'GestionVentas',
                loadChildren: () => import('./gestion-ventas/gestion-ventas.routes').then(m => m.routes)
            },
            {
                path: 'AllocationPlan',
                loadChildren: () => import('./allocation-plan/allocation-plan.routes').then(m => m.routes)
            },
            {
                path: 'ReportesGenerales',
                loadChildren: () => import('./reportes-generales/reportes-generales.routes').then(m => m.routes)
            },
            {
                path: '**', component: NotFoundComponent,
            },

        ]

    },
    // {
    //     path: 'Seguridad'
    // },
    // {
    //     path: 'ManageCloud'
    // }
]
