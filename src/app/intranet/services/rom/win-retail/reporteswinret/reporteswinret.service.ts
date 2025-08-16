import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReporteswinretService {
  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getReportesWINRET(docusuario: string, idemppaisnegcue: number): Observable<any> {
    const payload = { docusuario: docusuario, idemppaisnegcue: idemppaisnegcue }; // Crear el cuerpo de la solicitud
    console.log('params getRolPromotorDocUsuario', payload)

    return this.http.get<any>(`${this.apiUrl}ReportsWINRET/GetReportesWINRET`, { params: payload });
  }
}
