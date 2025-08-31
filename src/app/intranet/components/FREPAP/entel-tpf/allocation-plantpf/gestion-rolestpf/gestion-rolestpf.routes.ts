import { Routes } from "@angular/router";
import { AllocationtpfComponent } from "./allocationtpf/allocationtpf.component";
import { UsuariosEnteltpfComponent } from "./usuarios-enteltpf/usuarios-enteltpf.component";

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path:'Allocationtpf',
        component: AllocationtpfComponent
    },
    {
        path:'UsuariosEnteltpf',
        component: UsuariosEnteltpfComponent
    }
]