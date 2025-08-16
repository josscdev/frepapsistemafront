import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReportestpfService {
    private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }


  // getRolUsuarioPDV(usuario:string,idemppaisnegcue: number, tipoperiodo: string): Observable<any> {
  //   const params = {
  //     usuario: usuario,
  //     idemppaisnegcue: idemppaisnegcue.toString(),  // Convierte el entero a texto para el query param
  //     tipoperiodo: tipoperiodo
  //   };
  
  //   return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolUsuarioPDVTPF`, { params });
  // }

  getReportesTPF(docusuario: string, idemppaisnegcue: number): Observable<any> {
    const payload = { docusuario:docusuario, idemppaisnegcue:idemppaisnegcue }; // Crear el cuerpo de la solicitud
    console.log('params getRolPromotorDocUsuario', payload)

    return this.http.get<any>(`${this.apiUrl}ReportsTPF/GetReportesTPF`, { params: payload });
}

}
