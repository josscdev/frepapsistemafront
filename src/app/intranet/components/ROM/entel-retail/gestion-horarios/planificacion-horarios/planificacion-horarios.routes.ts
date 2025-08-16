import { Routes } from "@angular/router";
import { AsignacionTurnosPDVComponent } from "./asignacion-turnos-pdv/asignacion-turnos-pdv.component";
import { AsignacionHorariosPDVComponent } from "./asignacion-horarios-pdv/asignacion-horarios-pdv.component";

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: '/main'
    },
    {
        path:'AsignacionTurnosPDV',
        component: AsignacionTurnosPDVComponent
    },
    {
        path:'AsignacionHorariosPDV',
        component: AsignacionHorariosPDVComponent
    }
]