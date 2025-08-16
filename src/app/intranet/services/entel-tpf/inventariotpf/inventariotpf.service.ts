import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { InsertarInventario, InsertarSoloInventarioDetalle } from '../../../components/ROM/entel-tpf/gestion-ventastpf/modulo-registrotpf/inventariotpf/models/inventariotpf';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InventariotpfService {
  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private http: HttpClient
  ) { }

  obtenerInventario(filtros: any): Observable<any[]> {
    const url = `${this.apiUrl}InventarioTPF/GetInventarioTPF`;
    return this.http.post<any[]>(url, filtros);
  }

  registrarInventario(registros: InsertarInventario): Observable<any> {
    console.log("registros", registros);
    const url = `${this.apiUrl}InventarioTPF/PostInventarioTPF`;
    return this.http.post(url, registros);
  }

  deleteInventario(idinventario: Number, usuario: string): Observable<any> {
    // Construye los parámetros de consulta
    const params = new HttpParams()
      .set('idinventario', idinventario.toString())
      .set('usuario', usuario);
    console.log('params', params)
    // Realiza la solicitud POST
    return this.http.post<any>(`${this.apiUrl}InventarioTPF/DeleteInventarioTPF`, {}, { params: params, ...this.httpOptions });
  }

  getInventarioDetalle(idinventario: number): Observable<any> {
    const url = `${this.apiUrl}InventarioTPF/GetInventarioDetalleTPF`;
    const params = new HttpParams().set('idinventario', idinventario != null ? idinventario.toString() : '');
    return this.http.get<any>(url, { params });
  }

  deleteInventarioDetalle(idinventariodetalle: Number, usuario: string): Observable<any> {
    // Construye los parámetros de consulta
    const params = new HttpParams()
      .set('idinventariodetalle', idinventariodetalle.toString())
      .set('usuario', usuario);
    console.log('params', params)
    // Realiza la solicitud POST
    return this.http.post<any>(`${this.apiUrl}InventarioTPF/DeleteInventarioDetalleTPF`, {}, { params: params, ...this.httpOptions });
  }

  registrarInventarioDetalle(registros: InsertarSoloInventarioDetalle): Observable<any> {
    console.log("registros", registros);
    const url = `${this.apiUrl}InventarioTPF/PostInventarioDetalleTPF`;
    return this.http.post(url, registros);
  }
}
