import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { AfiliacionCreateDto, FiltroAfiliacion, FiltroAfiliacionDesactivar, ListarAfiliacion, ListarEstadoCivil, ListarOpcionUbigeo, ListarTipoDocumento, RespuestaAfiliacionDesactivar } from '../../../components/FREPAP/frepapmodule/gestion-afiliaciones/modulo-registros/afiliaciones/models/afiliacion';
import { catchError, firstValueFrom, Observable, throwError } from 'rxjs';

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

  async registrarAfiliacion(
    model: AfiliacionCreateDto,
    files: { foto?: File; fichaafiliacionfile?: File; hojadevida?: File; copiadocumento?: File }
  ): Promise<any> {
    const fd = new FormData();

    Object.entries(model).forEach(([k, v]) => v != null && fd.append(k, String(v)));
    if (files.foto) fd.append('foto', files.foto);
    if (files.fichaafiliacionfile) fd.append('fichaafiliacionfile', files.fichaafiliacionfile);
    if (files.hojadevida) fd.append('hojadevida', files.hojadevida);
    if (files.copiadocumento) fd.append('copiadocumento', files.copiadocumento);

    // Ajusta la ruta según tu controller: [Route("api/[controller]")]
    const url = `${this.apiUrl}Afiliaciones/registrarafiliacion`;

    return await firstValueFrom(this.http.post(url, fd));
  }

  listarEstadosCiviles(idemppaisnegcue: number): Observable<ListarEstadoCivil[]> {
    return this.http.get<ListarEstadoCivil[]>(
      `${this.apiUrl}Afiliaciones/GetListarEstadosCiviles?idemppaisnegcue=${idemppaisnegcue}`
    );
  }

  listarTipoDocumentos(idemppaisnegcue: number): Observable<ListarTipoDocumento[]> {
    return this.http.get<ListarTipoDocumento[]>(
      `${this.apiUrl}Afiliaciones/GetListarTiposDocumento?idemppaisnegcue=${idemppaisnegcue}`
    );
  }

  postDesactivarAfiliacion(request: FiltroAfiliacionDesactivar): Observable<RespuestaAfiliacionDesactivar> {
    return this.http.post<RespuestaAfiliacionDesactivar>(`${this.apiUrl}Afiliaciones/PostDesactivarAfiliacion`, request);
  }
}