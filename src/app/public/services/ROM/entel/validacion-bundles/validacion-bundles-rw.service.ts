import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ValidacionBundleROMWEB } from '../../../../models/ROM/entel/validacion-bundles/validacionbundle';

@Injectable({
  providedIn: 'root'
})
export class ValidacionBundlesRWService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private http: HttpClient
  ) { }

  // getBundlesVentas(intIdVentasPrincipal: number): Observable<any>{
  //   return this.http.post<any>(`${this.apiUrl}ValidacionBundles/GetBundlesVentas`, `"${intIdVentasPrincipal}"`, this.httpOptions);
  // }


  getById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}ValidacionBundlesRW/GetBundlesVentasRW/${id}`); // Modifica la URL de acuerdo a tu API
  }

  ValidarCodigoAuthBundle(intventasromid: number, strcodigoauthbundle: string): Observable<any> {
    const params = new HttpParams()
      .set('intventasromid', intventasromid)
      .set('strcodigoauthbundle', strcodigoauthbundle);

    return this.http.get<any>(`${this.apiUrl}ValidacionBundlesRW/ValidarCodigoAuthBundleRW`, { params });
  }

  uploadPDF(formData: FormData): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}ValidacionBundlesRW/uploadRW`, formData)
  }

  postBundlesFirma(validacionBundle: ValidacionBundleROMWEB){
    return this.http.post<any>(`${this.apiUrl}ValidacionBundlesRW/PostBundlesFirmaRW`, validacionBundle)
  }

  validarSubidaS3(intventasromid: number){
    return this.http.post<any>(`${this.apiUrl}ValidacionBundlesRW/ValidarSubidaS3RW`, intventasromid)
  }
}
