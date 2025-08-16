import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../../environments/environment';
import { ValidacionBundle } from '../../../../models/ROM/entel/validacion-bundles/validacionbundle';

@Injectable({
  providedIn: 'root'
})
export class ValidacionBundlesService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private http: HttpClient
  ) { }

  // getBundlesVentas(intIdVentasPrincipal: number): Observable<any>{
  //   return this.http.post<any>(`${this.apiUrl}ValidacionBundles/GetBundlesVentas`, `"${intIdVentasPrincipal}"`, this.httpOptions);
  // }


  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ValidacionBundles/GetBundlesVentas/${id}`); // Modifica la URL de acuerdo a tu API
  }

  ValidarCodigoAuthBundle(idventasdetalle: number, codigoauthbundle: string): Observable<any> {
    const params = new HttpParams()
      .set('idventasdetalle', idventasdetalle)
      .set('codigoauthbundle', codigoauthbundle);

    return this.http.get<any>(`${this.apiUrl}ValidacionBundles/ValidarCodigoAuthBundle`, { params });
  }

  uploadPDF(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ValidacionBundles/upload`, formData)
  }

  postBundlesFirma(validacionBundle: ValidacionBundle){
    return this.http.post<any>(`${this.apiUrl}ValidacionBundles/PostBundlesFirma`, validacionBundle)
  }

  validarSubidaS3(intventasromid: number){
    return this.http.post<any>(`${this.apiUrl}ValidacionBundles/ValidarSubidaS3`, intventasromid)
  }
}
