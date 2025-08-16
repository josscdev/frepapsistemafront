import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ModeloEquipotpf } from '../../../models/entel-tpf/mantenimiento/modelotpf';

@Injectable({
  providedIn: 'root'
})
export class ModelotpfService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getModeloRomWeb(idemppaisnegcue: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ModeloTPF/GetModeloRomWebTPF`, idemppaisnegcue);
  }

  postModeloRomweb(request: ModeloEquipotpf): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ModeloTPF/PostModeloRomWebTPF`, request);
  }

  deleteModeloRomweb(request: ModeloEquipotpf): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ModeloTPF/DeleteModeloRomWebTPF`, request);
  }
}
