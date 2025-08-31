import { Routes } from '@angular/router';
import { FormularioVentastpfComponent } from './formulario-ventastpf/formulario-ventastpf.component';
import { BundletpfComponent } from './bundletpf/bundletpf.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'FormularioVentastpf',
        component: FormularioVentastpfComponent
    },
    {
        path: 'Bundlestpf',
        component: BundletpfComponent
    }
]