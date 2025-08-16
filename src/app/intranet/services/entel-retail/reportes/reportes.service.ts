import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getReportes(docusuario: string, idemppaisnegcue: number): Observable<any> {
    const payload = { docusuario: docusuario, idemppaisnegcue: idemppaisnegcue }; // Crear el cuerpo de la solicitud
    console.log('params getRolPromotorDocUsuario', payload)

    return this.http.get<any>(`${this.apiUrl}Reports/GetReportes`, { params: payload });
  }

  descargarReporte(fechaInicio: string, fechaFin: string, nombreCuenta: string): Observable<Blob> {
    const url = `${this.apiUrl}Reports/descargar-reporte-rol-diario?fechaInicio=${fechaInicio}&fechaFin=${fechaFin}&nombreCuenta=${nombreCuenta}`;
    return this.http.get(url, { responseType: 'blob' });
  }
}
