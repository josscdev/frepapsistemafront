import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ActualizarNombreVoucherRequest, UploadImageRequest, Ventas, VentasDetalle, VentasRequest } from '../../../models/entel-retail/ventas/ventas';
import { FiltroVentas } from '../../../models/entel-retail/ventas/filtrosventa';

@Injectable({
  providedIn: 'root'
})
export class VentasService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};


  constructor(
    private http: HttpClient
  ) { }

  getTipoDocumento(idemppaisnegcue: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoDocumento`, idemppaisnegcue)
  }

  getTipoBiometria(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoBiometria`, idemppaisnegcue)
  }

  getSubproducto(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetSubproducto`, idemppaisnegcue)
  }

  getOperador(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetOperador`, idemppaisnegcue)
  }

  getTipoEquipo(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoEquipo`, idemppaisnegcue)
  }

  getTipoSeguro(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoSeguro`, idemppaisnegcue)
  }


  getTipoEtiqueta(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoEtiqueta`, idemppaisnegcue)
  }

  getTipoPago(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoPago`, idemppaisnegcue)
  }

  getPlanes(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetPlanes`, idemppaisnegcue)
  }

  getModelo(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetModelo`, idemppaisnegcue)
  }

  getBundle(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetBundle`, idemppaisnegcue)
  }

  getTipoAccesorio(idemppaisnegcue: number): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetTipoAccesorio`, idemppaisnegcue)
  }

  getDataReaderCode(archivoBase64: string): Observable<any>{
    console.log('entro al servicio',archivoBase64)
    return this.http.post<any>(`${this.apiUrl}Ventas/GetDataReaderCode`,  `"${archivoBase64}"`, this.httpOptions)
  }

  postVentas(ventasRequest: Ventas): Observable<any>{
    console.log('ventasRequest service: ', ventasRequest)
    return this.http.post<any>(`${this.apiUrl}Ventas/PostVentas`, ventasRequest)
  }

  getVentasAdmin(filtros: FiltroVentas): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetVentasAdmin`,  filtros)
  }

  getVentasJefe(filtros: FiltroVentas): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetVentasJefe`, filtros)
  }
  getVentasSuper(filtros: FiltroVentas): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetVentasSuper`,filtros)
  }
  getVentasPromotor(filtros: FiltroVentas): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetVentasPromotor`, filtros)
  }

  uploadVoucherRetail(request: UploadImageRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/UploadVoucherRetail`, request)
  }

  
  getDeleteVentasDetalle(idventasdetalle: Number,usuarioanulacion: string): Observable<any>{
 // Construye los parámetros de consulta
    const params = new HttpParams()
    .set('idventasdetalle', idventasdetalle.toString())
    .set('usuarioanulacion', usuarioanulacion);
    console.log('params',params)
    // Realiza la solicitud POST
    return this.http.post<any>(`${this.apiUrl}Ventas/DeleteVentasDetalle`, {}, { params: params, ...this.httpOptions });
  }

  updateNameVoucherRetail(request: ActualizarNombreVoucherRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/UpdateNombreVoucherRetail`, request)
  }

  updateVentasDetalle(request: VentasDetalle): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/UpdateVentasDetalle`, request)
  }

  updateVoucherVentas(request : any): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/UpdateVoucherVentas`, request)
  }

  getUrlPrefirmada(request : ActualizarNombreVoucherRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}Ventas/GetUrlPrefirmada`, request)
  }
}
