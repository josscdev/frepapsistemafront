import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActualizarNombreVoucherRequesttpf, UploadImageRequesttpf, VentasDetalletpf, Ventastpf } from '../../../models/entel-tpf/ventastpf/ventastpf';
import { FiltroVentastpf } from '../../../models/entel-tpf/ventastpf/filtrosventastpf';

@Injectable({
  providedIn: 'root'
})
export class VentastpfService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  constructor(
    private http: HttpClient
  ) { }

  getTipoDocumento(idemppaisnegcue: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoDocumentoTPF`, idemppaisnegcue)
  }

  getTipoBiometria(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoBiometriaTPF`, idemppaisnegcue)
  }

  getSubproducto(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetSubproductoTPF`, idemppaisnegcue)
  }

  getOperador(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetOperadorTPF`, idemppaisnegcue)
  }

  getTipoEquipo(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoEquipoTPF`, idemppaisnegcue)
  }

  getTipoSeguro(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoSeguroTPF`, idemppaisnegcue)
  }


  getTipoEtiqueta(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoEtiquetaTPF`, idemppaisnegcue)
  }

  getTipoPago(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoPagoTPF`, idemppaisnegcue)
  }

  getPlanes(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetPlanesTPF`, idemppaisnegcue)
  }

  getModelo(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetModeloTPF`, idemppaisnegcue)
  }

  getBundle(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetBundleTPF`, idemppaisnegcue)
  }

  getTipoAccesorio(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetTipoAccesorioTPF`, idemppaisnegcue)
  }

  getDataReaderCode(archivoBase64: string): Observable<any>{
    console.log('entro al servicio',archivoBase64)
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetDataReaderCodeTPF`,  `"${archivoBase64}"`, this.httpOptions)
  }

  postVentas(ventasRequest: Ventastpf): Observable<any>{
    console.log('ventasRequest service: ', ventasRequest)
    return this.http.post<any>(`${this.apiUrl}VentasTPF/PostVentasTPF`, ventasRequest)
  }

  getVentasAdmin(filtros: FiltroVentastpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetVentasAdminTPF`,  filtros)
  }

  getVentasJefe(filtros: FiltroVentastpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetVentasJefeTPF`, filtros)
  }
  getVentasSuper(filtros: FiltroVentastpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetVentasSuperTPF`,filtros)
  }
  getVentasPromotor(filtros: FiltroVentastpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetVentasPromotorTPF`, filtros)
  }

  uploadVoucherRetail(request: UploadImageRequesttpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/UploadVoucherTPF`, request)
  }

  
  getDeleteVentasDetalle(idventasdetalle: Number,usuarioanulacion: string): Observable<any>{
 // Construye los parámetros de consulta
    const params = new HttpParams()
    .set('idventasdetalle', idventasdetalle.toString())
    .set('usuarioanulacion', usuarioanulacion);
    console.log('params',params)
    // Realiza la solicitud POST
    return this.http.post<any>(`${this.apiUrl}VentasTPF/DeleteVentasDetalleTPF`, {}, { params: params, ...this.httpOptions });
  }

  updateNameVoucherRetail(request: ActualizarNombreVoucherRequesttpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/UpdateNombreVoucherTPF`, request)
  }

  updateVentasDetalle(request: VentasDetalletpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/UpdateVentasDetalleTPF`, request)
  }

  updateVoucherVentas(request : any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/UpdateVoucherVentasTPF`, request)
  }

  getUrlPrefirmada(request : ActualizarNombreVoucherRequesttpf): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}VentasTPF/GetUrlPrefirmadaTPF`, request)
  }
}
