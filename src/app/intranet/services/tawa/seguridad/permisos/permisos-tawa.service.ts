import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AllUsersRequest, AllUsersResponse } from '../../../../models/tawa/seguridad/allusers';
import { PermissionRequest } from '../../../../models/Auth/permissionsRequest';
import { PermisosModulosRequest } from '../../../../models/tawa/seguridad/modulospermisos';

@Injectable({
  providedIn: 'root'
})
export class PermisosTawaService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getCodigos(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}PermisosTawa/GetCodigosTawa`, request);
  }

  getAllUsers(request: AllUsersRequest): Observable<AllUsersResponse[]> {
    return this.http.post<AllUsersResponse[]>(`${this.apiUrl}PermisosTawa/GetAllUsersTawa`, request)
  }

  getModulosPermisos(request: PermissionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}PermisosTawa/GetModulosPermisosTawa`, request)
  }

  getPerfiles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}PermisosTawa/GetPerfilesTawa`)
  }

  validarEstructuraModulos(request: PermisosModulosRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}PermisosTawa/ValidarEstructuraModulosTawa`, request)
  }
}
