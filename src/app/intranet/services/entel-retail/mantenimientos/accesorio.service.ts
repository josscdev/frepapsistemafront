import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Accesorio } from '../../../models/entel-retail/mantenimiento/accesorio';

@Injectable({
  providedIn: 'root'
})
export class AccesorioService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getAccesorioRomWeb(idemppaisnegcue: number): Observable <any>{
    return this.http.post<any>(`${this.apiUrl}Accesorio/GetAccesorioRomWeb`, idemppaisnegcue);
  }

  postAccesorioRomweb(request: Accesorio): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Accesorio/PostAccesesorioRomWeb`,request);
  }

  deleteAccesesorioRomWeb(request: Accesorio){
    return this.http.post<any>(`${this.apiUrl}Accesorio/DeleteAccesesorioRomWeb`,request);
  }
  
}
