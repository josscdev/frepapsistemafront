import { Routes } from "@angular/router";
import { NotFoundComponent } from "../../../shared/not-found/not-found.component";
import { AdministracionPermisosComponent } from "./administracion-permisos/administracion-permisos.component";
import { UsuarioPermisosComponent } from "./administracion-permisos/usuario-permisos/usuario-permisos.component";

export const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/mainLimtek'
            },
         
            {
                path: 'AdministracionPermisosLimtek',
                component: AdministracionPermisosComponent,
            },
            {
                path: 'AdministracionPermisosLimtek/UsuarioPermisos',
                component: UsuarioPermisosComponent
            },
            {
                path: '**', component: NotFoundComponent,
            },
        ]

    }
];