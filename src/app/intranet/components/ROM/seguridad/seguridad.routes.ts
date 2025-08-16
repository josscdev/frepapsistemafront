import { Routes } from "@angular/router";
import { authGuard } from "../../../../core/guards/auth.guard";
import { routesGuard } from "../../../../core/guards/routes.guard";
import { NotFoundComponent } from "../../../shared/not-found/not-found.component";
import { AdministracionPermisosComponent } from "./administracion-permisos/administracion-permisos.component";
import { UsuarioPermisosComponent } from "./administracion-permisos/usuario-permisos/usuario-permisos.component";

export const routes: Routes = [
    // {       
    //     path: 'CreacionPermisos',
    //     component: SeguridadComponent,
    //     canActivate: [authGuard,routesGuard]
    // },
    {
        path: '',
        children: [
            {
                path: '',
                pathMatch: 'full',
                redirectTo: '/main'
            },
         
            {
                path: 'AdministracionPermisos',
                component: AdministracionPermisosComponent,
            },
            {
                path: 'AdministracionPermisos/UsuarioPermisos',
                component: UsuarioPermisosComponent
            },
            {
                path: '**', component: NotFoundComponent,
            },
        ]

    }
];