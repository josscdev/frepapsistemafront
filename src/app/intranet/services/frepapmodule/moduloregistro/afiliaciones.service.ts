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

  getById(id: number) {
    console.log('AfiliacionesService getById', id);
    // Tu Swagger muestra POST /api/Afiliaciones/getById con body application/json
    // Si tu endpoint fuera /getById/{id}, cambia a this.http.post(url, null)
    return this.http.post<any>(`${this.apiUrl}Afiliaciones/getById`,
      id,                        // body = 123
      { headers: { 'Content-Type': 'application/json' } }
    );
  }

  getDocumentacionById(id: number) {
    console.log('AfiliacionesService getById', id);
    // Tu Swagger muestra POST /api/Afiliaciones/getById con body application/json
    // Si tu endpoint fuera /getById/{id}, cambia a this.http.post(url, null)
    return this.http.post<any>(`${this.apiUrl}Afiliaciones/GetDocumentacionById`,
      id,                        // body = 123
      { headers: { 'Content-Type': 'application/json' } }
    );
  }


  update(id: number, fd: FormData) {
    // NO pongas Content-Type: el navegador setea el boundary del multipart+

    return this.http.post<any>(
      `${this.apiUrl}Afiliaciones/update/${id}`,
      fd
    );
  }

  buildUpdateFormData(model: any, files?: { foto?: File | null; ficha?: File | null; hv?: File | null; copia?: File | null }) {
    const fd = new FormData();

    // campos (solo si tienen valor; el back usa COALESCE y los que no envíes no cambian)
    const add = (k: string, v: any) => { if (v !== undefined && v !== null && v !== '') fd.append(k, String(v)); };

    add('numficha', model.numficha);
    add('fechaafiliacion', toYmd(model.fechaafiliacion));
    add('nombres', model.nombres);
    add('apellidopaterno', model.apellidopaterno);
    add('apellidomaterno', model.apellidomaterno);
    add('idtipodocumento', model.idtipodocumento);
    add('docafiliado', model.docafiliado);
    add('fechanacimiento', toYmd(model.fechanacimiento));
    add('edadafiliado', model.edadafiliado);
    add('sexo', model.sexo);
    add('idestadocivil', model.idestadocivil);
    add('lugarnacimiento', model.lugarnacimiento);

    // RR/PP/DD (tu back arma codubicacion = dd || pp || rr)
    add('rr', model.rr);
    add('pp', model.pp);
    add('dd', model.dd);

    add('avenida', model.avenida);
    add('numero', model.numero);
    add('urbanizacion', model.urbanizacion);
    add('telefono', model.telefono);
    add('correo', model.correo);
    add('observacion', model.observacion);
    // estado_text -> estado (1/0)
    const estado = model.estado_text === 'ACTIVO' ? 1 : (model.estado === 1 ? 1 : 0);
    add('estado', estado);
    add('usuariomodificacion', model.usuariomodificacion); // 👈 nombre exacto que espera el back

    console.log('usuariomodificacion build', model.usuariomodificacion);
    // archivos (solo si el usuario seleccionó nuevos)
    if (files?.foto) fd.append('foto', files.foto);
    if (files?.ficha) fd.append('fichaafiliacionfile', files.ficha);
    if (files?.hv) fd.append('hojadevida', files.hv);
    if (files?.copia) fd.append('copiadocumento', files.copia);

    console.log('buildUpdateFormData', fd);
    console.log('model', model);

    return fd;

    function toYmd(d: any) {
      if (!d) return '';
      const dt = (d instanceof Date) ? d : new Date(d);
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      return `${dt.getFullYear()}-${mm}-${dd}`;
    }
  }

}