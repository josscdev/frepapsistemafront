import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { InsertarInventario, InsertarSoloInventarioDetalle } from '../../../components/ROM/entel-retail/gestion-ventas/modulo-registro/inventario/models/inventario';

@Injectable({
  providedIn: 'root'
})
export class InventarioService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };


  constructor(
    private http: HttpClient
  ) { }

  obtenerInventario(filtros: any): Observable<any[]> {
    const url = `${this.apiUrl}Inventario/GetInventario`;
    return this.http.post<any[]>(url, filtros);
  }

  registrarInventario(registros: InsertarInventario): Observable<any> {
    console.log("registros", registros);
    const url = `${this.apiUrl}Inventario/PostInventario`;
    return this.http.post(url, registros);
  }

  deleteInventario(idinventario: Number, usuario: string): Observable<any> {
    // Construye los parámetros de consulta
    const params = new HttpParams()
      .set('idinventario', idinventario.toString())
      .set('usuario', usuario);
    console.log('params', params)
    // Realiza la solicitud POST
    return this.http.post<any>(`${this.apiUrl}Inventario/DeleteInventario`, {}, { params: params, ...this.httpOptions });
  }

  getInventarioDetalle(idinventario: number): Observable<any> {
    const url = `${this.apiUrl}Inventario/GetInventarioDetalle`;
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
    return this.http.post<any>(`${this.apiUrl}Inventario/DeleteInventarioDetalle`, {}, { params: params, ...this.httpOptions });
  }

  registrarInventarioDetalle(registros: InsertarSoloInventarioDetalle): Observable<any> {
    console.log("registros", registros);
    const url = `${this.apiUrl}Inventario/PostInventarioDetalle`;
    return this.http.post(url, registros);
  }
}
