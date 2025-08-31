import { Routes } from '@angular/router';
import { VentasComponent } from './ventas/ventas.component';
import { MarcacionComponent } from './marcacion/marcacion.component';
import { InventarioComponent } from './inventario/inventario.component'; // Importa el nuevo componente

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'Ventas',
        component: VentasComponent
    },
    {
        path: 'Marcacion',
        component: MarcacionComponent
    },
    {
        path: 'Inventario', // Nueva ruta para Inventario
        component: InventarioComponent
    }
];