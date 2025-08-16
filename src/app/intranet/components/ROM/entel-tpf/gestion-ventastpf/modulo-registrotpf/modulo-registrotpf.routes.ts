import { Routes } from '@angular/router';
import { VentastpfComponent } from './ventastpf/ventastpf.component';
import { InventariotpfComponent } from './inventariotpf/inventariotpf.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'Ventastpf',
        component: VentastpfComponent
    },
    {
        path: 'Inventariotpf', // Nueva ruta para InventarioTPF
        component: InventariotpfComponent
    }
];