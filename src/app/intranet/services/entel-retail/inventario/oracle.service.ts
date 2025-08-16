import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { FiltroInsertarConciliar, InsertarOracleLogistica } from '../../../components/ROM/entel-retail/gestion-ventas/modulo-informacion/oracle/models/oracle';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OracleService {
  //inyecciones
  private readonly http = inject(HttpClient);

  private readonly apiUrl = environment.endpointIntranet;

  constructor() { }

  insertarOracle(lista: InsertarOracleLogistica[], usuario: string): Observable<any> {
    // Construye los parámetros de consulta
    const params = new HttpParams()
      .set('usuario', usuario);
    // Realiza la solicitud POST enviando la lista como body
    return this.http.post<any>(
      `${this.apiUrl}OracleLogistica/PostOracleLogisticaMasivo`,
      lista,
      { params: params }
    );
  }

  obtenerConciliacionesAsync(filtro: FiltroInsertarConciliar): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}OracleLogistica/ObtenerConciliacionesAsync`,
      filtro
    );
  }
}
