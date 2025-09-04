import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { FiltroAfiliacion, ListarAfiliacion, ListarOpcionUbigeo } from '../../../components/FREPAP/frepapmodule/gestion-afiliaciones/modulo-registros/afiliaciones/models/afiliacion';
import { catchError, Observable, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AfiliacionesService {


  private readonly apiUrl = environment.endpointIntranet;
  
  constructor(private http: HttpClient) { }

  listarAfiliaciones(filtro: FiltroAfiliacion): Observable<ListarAfiliacion[]> {
    const url = `${this.apiUrl}Afiliaciones/GetListarAfiliaciones`;
    const body = this.sanitizeFiltro(filtro);
    return this.http.post<ListarAfiliacion[]>(url, body).pipe(
      catchError(this.handleError)
    );
  }

  // Envía null cuando vengan strings vacíos y normaliza el perfil a MAYÚSCULA
  private sanitizeFiltro(f: FiltroAfiliacion): FiltroAfiliacion {
    const toNull = (v?: string | null) => (v && v.trim() !== '' ? v.trim() : null);
    return {
      region: toNull(f.region),
      provincia: toNull(f.provincia),
      distrito: toNull(f.distrito),
      perfil: toNull(f.perfil)?.toUpperCase() ?? null,
      usuario: toNull(f.usuario)
    };
  }

  private handleError(error: HttpErrorResponse) {
    const msg = error.error?.message ?? error.message ?? 'Error de comunicación con el servidor';
    return throwError(() => new Error(msg));
  }

  listarUbigeo(idemppaisnegcue: number | null, pais: number | null): Observable<ListarOpcionUbigeo[]> {
    return this.http.post<ListarOpcionUbigeo[]>(`${this.apiUrl}Afiliaciones/GetListarUbigeos`, { idemppaisnegcue, pais });
  }
}
