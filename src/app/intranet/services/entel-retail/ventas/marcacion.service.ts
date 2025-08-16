import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MarcacionService {
  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(
    private http: HttpClient
  ) { }

  getUsuarioMarcacion(docusuario: string): Observable<any> {
    const params = {
      docusuario: docusuario,
    };
    return this.http.get<any>(`${this.apiUrl}Marcacion/GetUsuarioMarcacion`, { params })
  }

  // const params = new HttpParams()
  //   .set('idventasdetalle', idventasdetalle.toString())
  //   .set('usuarioanulacion', usuarioanulacion);
  //   console.log('params',params)
  //   // Realiza la solicitud POST
  //   return this.http.post<any>(`${this.apiUrl}Ventas/DeleteVentasDetalle`, {}, { params: params, ...this.httpOptions });

  postMarcacion(docusuario: string, fechamarcacion: string): Observable<any> {
    const params = new HttpParams()
    .set('docusuario', docusuario)
    .set('fechamarcacion', fechamarcacion)
    return this.http.post<any>(`${this.apiUrl}Marcacion/PostEmpleadoAsistenciaMarcacion`, {}, { params: params, ...this.httpOptions })
  }
}
