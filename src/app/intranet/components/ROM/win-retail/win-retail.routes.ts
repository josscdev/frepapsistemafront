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
                path: 'ReportesGeneraleswinret',
                loadChildren: () => import('./reportes-generaleswinret/reportes-generaleswinret.routes').then(m => m.routes)
            },
            {
                path: '**', component: NotFoundComponent,
            },

        ]

    }
]