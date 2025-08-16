import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AllUsersRequest, AllUsersResponse } from '../../../../models/limtek/seguridad/allusers';
import { PermissionRequest } from '../../../../models/Auth/permissionsRequest';
import { PermisosModulosRequest } from '../../../../models/limtek/seguridad/modulospermisos';

@Injectable({
  providedIn: 'root'
})
export class PermisosLimtekService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getCodigos(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}PermisosLimtek/GetCodigosLimtek`, request);
  }

  getAllUsers(request: AllUsersRequest): Observable<AllUsersResponse[]> {
    return this.http.post<AllUsersResponse[]>(`${this.apiUrl}PermisosLimtek/GetAllUsersLimtek`, request)
  }

  getModulosPermisos(request: PermissionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}PermisosLimtek/GetModulosPermisosLimtek`, request)
  }

  getPerfiles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}PermisosLimtek/GetPerfilesLimtek`)
  }

  validarEstructuraModulos(request: PermisosModulosRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}PermisosLimtek/ValidarEstructuraModulosLimtek`, request)
  }
}
