import { Routes } from '@angular/router';
import { RevisionBundlesComponent } from './revision-bundles/revision-bundles.component';
import { OracleComponent } from './oracle/oracle.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path: 'RevisionBundles',
        component: RevisionBundlesComponent
    },
    {
        path: 'Oracle',
        component: OracleComponent
    }
]