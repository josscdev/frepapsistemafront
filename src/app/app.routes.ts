import { Routes } from '@angular/router';
import { NotFoundComponent } from './intranet/shared/not-found/not-found.component';
import { UnauthorizedComponent } from './intranet/shared/unauthorized/unauthorized.component';
import { NotFoundPublicComponent } from './intranet/shared/not-found-public/not-found-public.component';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: ''
    },
    {
        path: '', //VISTA INICIAL
        loadChildren: () => import('./intranet/components/start-main/start-main.routes').then(m => m.routes)
    },
    {
        path: 'auth',//LOGIN
        loadChildren: () => import('./intranet/components/authentication/authentication.routes').then(m => m.routes)
    },
    {
        path: 'main',//PRINCIPAL DE INTRANET ROM
        loadChildren: () => import('./intranet/components/ROM/main/main.routes').then(m => m.routes)
    },
    // {
    //     path: 'mainTawa',//PRINCIPAL DE INTRANET TAWA
    //     loadChildren: () => import('./intranet/components/TAWA/main-tawa/main.routes').then(m => m.routes)
    // },
    // {
    //     path: 'mainLimtek',//PRINCIPAL DE INTRANET LIMTEK
    //     loadChildren: () => import('./intranet/components/LIMTEK/main-limtek/main.routes').then(m => m.routes)
    // },
    // {
    //     path: 'public/Rom',//RUTA PUBLICA ROM
    //     loadChildren: () => import('./public/components/ROM/rom.routes').then(m => m.routes)
    // },
    // {
    //     path: 'public', component: NotFoundPublicComponent,
    // },
    {
        path: 'unauthorized', component: UnauthorizedComponent,
    },
    {
        path: '**', component: NotFoundComponent,
    },

];
