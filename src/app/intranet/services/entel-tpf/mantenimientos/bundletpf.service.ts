import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActualizarBundle, ResultadoBundle } from '../../../components/ROM/entel-tpf/gestion-ventastpf/modulo-mantenimientotpf/bundletpf/models/bundletpf';

@Injectable({
  providedIn: 'root'
})
export class BundletpfService {

  private readonly apiUrl = environment.endpointIntranet;
  
    constructor(
      private http: HttpClient
    ) { }
  
    getBundles(idemppaisnegcue:number): Observable<any> {
      return this.http.get<any>(`${this.apiUrl}BundleTPF/GetBundlesTPF?idemppaisnegcue=${idemppaisnegcue}`);
    }
  
    putBundles(bundle: ActualizarBundle): Observable<ResultadoBundle> {
      return this.http.post<ResultadoBundle>(`${this.apiUrl}BundleTPF/PutBundleTPF`, bundle);
    }
}
