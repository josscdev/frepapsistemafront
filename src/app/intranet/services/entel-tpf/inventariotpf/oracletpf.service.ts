import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FiltroInsertarConciliar, InsertarOracleLogistica } from '../../../components/ROM/entel-tpf/gestion-ventastpf/modulo-informaciontpf/oracletpf/models/oracletpf';

@Injectable({
  providedIn: 'root'
})
export class OracletpfService {
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
      `${this.apiUrl}OracleLogisticaTPF/PostOracleLogisticaMasivoTPF`,
      lista,
      { params: params }
    );
  }

  obtenerConciliacionesAsync(filtro: FiltroInsertarConciliar): Observable<any> {
    return this.http.post<any>(
      `${this.apiUrl}OracleLogisticaTPF/ObtenerConciliacionesAsyncTPF`,
      filtro
    );
  }
}
