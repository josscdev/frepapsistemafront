import { Routes } from '@angular/router';
import { BiwinretComponent } from './biwinret/biwinret.component';

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
                path: 'BiWinret',
                component: BiwinretComponent
            }
        ]
    }
]