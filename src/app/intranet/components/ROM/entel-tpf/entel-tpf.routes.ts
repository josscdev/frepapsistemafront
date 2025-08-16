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
                path: 'GestionHorariostpf',
                loadChildren: () => import('./gestion-horariostpf/gestion-horariostpf.routes').then(m => m.routes)
            },
            {
                path: 'GestionVentastpf',
                loadChildren: () => import('./gestion-ventastpf/gestion-ventastpf.routes').then(m => m.routes)
            },
            {
                path: 'AllocationPlantpf',
                loadChildren: () => import('./allocation-plantpf/allocation-plantpf.routes').then(m => m.routes)
            },
            {
                path: 'ReportesGeneralestpf',
                loadChildren: () => import('./reportes-generalestpf/reportes-generalestpf.routes').then(m => m.routes)
            },
            {
                path: '**', component: NotFoundComponent,
            },

        ]

    }
]
