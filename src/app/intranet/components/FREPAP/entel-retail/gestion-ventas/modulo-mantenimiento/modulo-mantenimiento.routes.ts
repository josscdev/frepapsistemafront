import { Routes } from '@angular/router';
import { FormularioVentasComponent } from './formulario-ventas/formulario-ventas.component';
import { Bundle } from '../../../../../models/entel-retail/ventas/listasVentas';
import { BundleComponent } from './bundle/bundle.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'FormularioVentas',
        component: FormularioVentasComponent
    },
    {
        path: 'Bundles',
        component: BundleComponent
    }
]