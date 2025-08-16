import { Routes } from '@angular/router';
import { OracletpfComponent } from './oracletpf/oracletpf.component';


export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'Oracletpf',
        component: OracletpfComponent
    }
]