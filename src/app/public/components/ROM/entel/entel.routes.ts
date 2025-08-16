import { Routes } from '@angular/router';
import { FirmaBundleComponent } from './firma-bundle/firma-bundle.component';
import { ConfirmacionBundleComponent } from './confirmacion-bundle/confirmacion-bundle.component';
import { ConfirmacionBundletpfComponent } from './confirmacion-bundletpf/confirmacion-bundletpf.component';

export const routes: Routes = [
    {
        path:'',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/public/Rom/main/Entel/FirmaBundle'
            },
            {
                path: 'FirmaBundle/:id',
                component: FirmaBundleComponent
            },
            {
                path: 'ConfirmacionBundle/:id',
                component: ConfirmacionBundleComponent
            },
            {
                path: 'ConfirmacionBundletpf/:id',
                component: ConfirmacionBundletpfComponent
            }
            
        ]
    }
]