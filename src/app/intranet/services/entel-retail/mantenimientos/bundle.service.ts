import { Injectable, Inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActualizarBundle, ResultadoBundle } from '../../../components/ROM/entel-retail/gestion-ventas/modulo-mantenimiento/bundle/models/bundle';

@Injectable({
  providedIn: 'root'
})
export class BundleService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getBundles(idemppaisnegcue:number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}Bundle/GetBundles?idemppaisnegcue=${idemppaisnegcue}`);
  }

  putBundles(bundle: ActualizarBundle): Observable<ResultadoBundle> {
    return this.http.post<ResultadoBundle>(`${this.apiUrl}Bundle/PutBundle`, bundle);
  }
}
