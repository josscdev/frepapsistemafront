import { Routes } from "@angular/router";
import { AsignacionTurnosPDVtpfComponent } from "./asignacion-turnos-pdvtpf/asignacion-turnos-pdvtpf.component";
import { AsignacionHorariosPDVtpfComponent } from "./asignacion-horarios-pdvtpf/asignacion-horarios-pdvtpf.component";

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path:'AsignacionTurnosPDVtpf',
        component: AsignacionTurnosPDVtpfComponent
    },
    {
        path:'AsignacionHorariosPDVtpf',
        component: AsignacionHorariosPDVtpfComponent
    }
]