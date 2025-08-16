import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AccesosRequest } from '../../../../models/rom/seguridad/acceso';

@Injectable({
  providedIn: 'root'
})
export class AccesosService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(
    private http: HttpClient
  ) { }

  getAccesos(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}Accesos/GetAccesos`);
  }

  postAccesos(accessRequest: AccesosRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Accesos/PostAccesos`,accessRequest);
  }

  deleteAccesos(accessRequest: AccesosRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Accesos/DeleteAccesos`,accessRequest);
  }

  getSegUsuario(dni: string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Accesos/GetSegUsuario`, `"${dni}"`, this.httpOptions);
  }

  getPerfiles(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}Accesos/GetPerfiles`);
  }
}
