import { Routes } from '@angular/router';
import { BienteltpfComponent } from './bienteltpf/bienteltpf.component';

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
                path: 'BiEnteltpf',
                component: BienteltpfComponent
            }
        ]
    }
]