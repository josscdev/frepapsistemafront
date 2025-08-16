import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RangoSemana } from '../../../models/planificacion-horarios/rangoSemana';
import { SupervisorPDV } from '../../../models/planificacion-horarios/supervisorPDV';
import { TurnosDisponiblesPDVRequest } from '../../../models/planificacion-horarios/turnosDisponiblesPDVRequest';
import { HorarioPlanificadoRequest, ListaPromotoresHorarios, ValidarPromotoresHorarios } from '../../../models/planificacion-horarios/horarioPlanificadoRequest';
import { HorarioPlanificadoPromotorRequest } from '../../../models/planificacion-horarios/horarioPlanificadoPromotorRequest';
import { UsuarioSupervisor } from '../../../models/planificacion-horarios/usuarioSupervisor';

@Injectable({
  providedIn: 'root'
})
export class AsignarHorariosService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(
    private http: HttpClient
  ) { }

  getRangoSemana(perfil: string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetRangoSemana`, `"${perfil}"`, this.httpOptions);
  }

  
  getDiasSemana(diasSemana: RangoSemana): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetDiasSemana`,diasSemana);
  }

  getPromotorSupervisorPDV(supervisorPDV: SupervisorPDV): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetPromotorSupervisorPDV`,supervisorPDV);
  }
  
  getTurnosSupervisorPDVHorarios(SuperPDV: TurnosDisponiblesPDVRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetTurnosSupervisorPDVHorarios`, SuperPDV);
  }

  //Guardar grilla de horario planificado
  postHorarioPlanificado(horarioPlanificadoRequest: any[]){
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/PostHorarioPlanificado`, horarioPlanificadoRequest);
  }

  //Validar horario planificado Excel
  ValidarHorarioPlanificado(listaPromotoresHorarios: ValidarPromotoresHorarios[]){
    return this.http.post<ListaPromotoresHorarios[]>(`${this.apiUrl}PlanificacionHorarios/ValidarHorarioPlanificado`, listaPromotoresHorarios);
  }

  getHorarioPlanificado(horarioPlanificadoPromotorRequest: HorarioPlanificadoPromotorRequest[]){
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/GetHorarioPlanificado`, horarioPlanificadoPromotorRequest);
  }

  //Exportar horarios
  ReportGetSemanaActual(usuario: UsuarioSupervisor): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/ReportGetSemanaActual`, usuario);
  }

  ReportGetSemanaAnterior(usuario: UsuarioSupervisor): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}PlanificacionHorarios/ReportGetSemanaAnterior`, usuario);
  }
}
