import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValidacionBundle } from '../../../../models/ROM/entel/validacion-bundles/validacionbundle';

@Injectable({
  providedIn: 'root'
})
export class ValidacionBundlestpfService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private http: HttpClient
  ) { }

  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ValidacionBundlesTPF/GetBundlesVentasTPF/${id}`); // Modifica la URL de acuerdo a tu API
  }

  ValidarCodigoAuthBundle(idventasdetalle: number, codigoauthbundle: string): Observable<any> {
    const params = new HttpParams()
      .set('idventasdetalle', idventasdetalle)
      .set('codigoauthbundle', codigoauthbundle);

    return this.http.get<any>(`${this.apiUrl}ValidacionBundlesTPF/ValidarCodigoAuthBundleTPF`, { params });
  }

  uploadPDF(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ValidacionBundlesTPF/uploadTPF`, formData)
  }

  postBundlesFirma(validacionBundle: ValidacionBundle){
    return this.http.post<any>(`${this.apiUrl}ValidacionBundlesTPF/PostBundlesFirmaTPF`, validacionBundle)
  }

  validarSubidaS3(intventasromid: number){
    return this.http.post<any>(`${this.apiUrl}ValidacionBundlesTPF/ValidarSubidaS3TPF`, intventasromid)
  }
}
