import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { ModeloEquipo } from '../../../models/entel-retail/mantenimiento/modelo';

@Injectable({
  providedIn: 'root'
})
export class ModeloService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getModeloRomWeb(idemppaisnegcue: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Modelo/GetModeloRomWeb`, idemppaisnegcue);
  }

  postModeloRomweb(request: ModeloEquipo): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Modelo/PostModeloRomWeb`,request);
  }

  deleteModeloRomweb(request: ModeloEquipo): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Modelo/DeleteModeloRomWeb`,request);
  }

}
