import { Routes } from '@angular/router';
import { BientelComponent } from './bientel/bientel.component';

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
                path: 'BiEntel',
                component: BientelComponent
            },
            // {
            //     path: 'ReportesRRHH',
            //     component: ReportesRRHHComponent
            // }
        ]
    }
]