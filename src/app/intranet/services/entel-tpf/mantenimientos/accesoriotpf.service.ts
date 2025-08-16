import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Accesoriotpf } from '../../../models/entel-tpf/mantenimiento/accesoriotpf';

@Injectable({
  providedIn: 'root'
})
export class AccesoriotpfService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getAccesorioRomWeb(idemppaisnegcue: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AccesorioTPF/GetAccesorioRomWebTPF`, idemppaisnegcue);
  }

  postAccesorioRomweb(request: Accesoriotpf): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AccesorioTPF/PostAccesesorioRomWebTPF`, request);
  }

  deleteAccesesorioRomWeb(request: Accesoriotpf) {
    return this.http.post<any>(`${this.apiUrl}AccesorioTPF/DeleteAccesesorioRomWebTPF`, request);
  }
}
