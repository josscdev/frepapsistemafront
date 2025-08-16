import { Routes } from "@angular/router";
import { AllocationComponent } from "./allocation/allocation.component";
import { UsuariosEntelComponent } from "./usuarios-entel/usuarios-entel.component";

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path:'Allocation',
        component: AllocationComponent
    },
    {
        path:'UsuariosEntel',
        component: UsuariosEntelComponent
    }
]