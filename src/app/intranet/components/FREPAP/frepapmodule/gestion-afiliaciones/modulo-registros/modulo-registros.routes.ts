import { Routes } from '@angular/router';
import { AfiliacionesComponent } from './afiliaciones/afiliaciones.component';


export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'Afiliaciones',
        component: AfiliacionesComponent
    }
];