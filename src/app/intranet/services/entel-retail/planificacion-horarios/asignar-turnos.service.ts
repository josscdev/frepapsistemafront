import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UsuarioSupervisor } from '../../../models/planificacion-horarios/usuarioSupervisor';
import { TurnosSupervisor } from '../../../models/planificacion-horarios/turnosSupervisor';
import { TurnosSupervisorDelRequest } from '../../../models/planificacion-horarios/turnosSupervisorDelRequest';
import { TurnosDisponiblesPDVRequest } from '../../../models/planificacion-horarios/turnosDisponiblesPDVRequest';
import { TurnosAsignadosPDVpostRequest } from '../../../models/planificacion-horarios/turnosAsignadosPDVpostRequest';

@Injectable({
  providedIn: 'root'
})
export class AsignarTurnosService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(
    private http: HttpClient
  ) { }
  
  //CRUD TURNOS
  getTurnosSupervisor(usuarioSupervisor: UsuarioSupervisor): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetTurnosSupervisor`, usuarioSupervisor);
  }

  postTurnosSupervisor(turnosSupervisor: TurnosSupervisor): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/PostTurnosSupervisor`, turnosSupervisor);
  }

  putTurnosSupervisor(turnosSupervisor: TurnosSupervisor): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/PutTurnosSupervisor`, turnosSupervisor);
  }

  deleteTurnosSupervisor(turnosSupervisorDelRequest: TurnosSupervisorDelRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/DeleteTurnosSupervisor`, turnosSupervisorDelRequest);
  }

  //ASIGNACION DE TURNOS
  getSupervisorPDV(request: any): Observable<any>{
    //request => dnisuper, idemppaisnegcue
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetSupervisorPDV`, request);
  }

  getTurnosDisponiblePDV(turnosDisponiblesPDVRequest: TurnosDisponiblesPDVRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetTurnosDisponiblePDV`, turnosDisponiblesPDVRequest);
  }

  getTurnosAsignadosPDV(turnosDisponiblesPDVRequest: TurnosDisponiblesPDVRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetTurnosAsignadosPDV`, turnosDisponiblesPDVRequest);
  }

  postTurnosPDV(turnosAsignadosPDVpostRequest: TurnosAsignadosPDVpostRequest[]): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/PostTurnosPDV`, turnosAsignadosPDVpostRequest);
  }

  deleteTurnosPDV(pdvTurno: any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/DeleteTurnosPDV`, pdvTurno);
  }

  getSupervisores(request: any): Observable<any>{
    //request => dnijefe, idemppaisnegcue
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetSupervisores`, request);
  }

  getJefes(request: any): Observable<any>{
    //request => idemppaisnegcue
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetJefes`, request);
  }
}
