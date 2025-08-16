import { Injectable } from '@angular/core';
import { environment } from '../../../../../environments/environment';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { AllUsersRequest, AllUsersResponse } from '../../../../models/rom/seguridad/allusers';
import { PermissionRequest } from '../../../../models/Auth/permissionsRequest';
import { Module, PermisosModulosRequest } from '../../../../models/rom/seguridad/modulospermisos';
import { ListaValidarUsuarios, RespuestaUsuario, RespuestaUsuarioXDocumento, RespuestaValidarUsuarios } from '../../../../components/ROM/seguridad/administracion-permisos/models/usuario';

@Injectable({
  providedIn: 'root'
})
export class PermisosService {

  private readonly apiUrl = environment.endpointIntranet;

  constructor(
    private http: HttpClient
  ) { }

  getCodigos(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Permisos/GetCodigos`, request);
  }

  getAllUsers(request: AllUsersRequest): Observable<AllUsersResponse[]> {
    return this.http.post<AllUsersResponse[]>(`${this.apiUrl}Permisos/GetAllUsers`, request)
  }

  getModulosPermisos(request: PermissionRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Permisos/GetModulosPermisos`, request)
  }

  getPerfiles(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}Permisos/GetPerfiles`)
  }

  validarEstructuraModulos(request: PermisosModulosRequest): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Permisos/ValidarEstructuraModulos`, request)
  }

  insertarActualizarUsuario(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Permisos/InsertarOActualizarUsuario`, request)
  }

  getUsuarioPorDocumento(docusuario: string, nombresocio: string): Observable<RespuestaUsuarioXDocumento | RespuestaUsuario> {
    const params = new HttpParams()
      .set('docusuario', docusuario)
      .set('nombresocio', nombresocio.toString());
  
    return this.http.get<RespuestaUsuarioXDocumento | RespuestaUsuario>(`${this.apiUrl}Permisos/GetUsuarioPorDocumento`, { params });
  }

  ValidarUsuarios(usuarios: ListaValidarUsuarios[]): Observable<RespuestaValidarUsuarios[]> {
    return this.http.post<RespuestaValidarUsuarios[]>(`${this.apiUrl}Permisos/ValidarUsuariosAsync`, usuarios);
  }

  InsertarUsuariosMasivoAsync(usuarios: ListaValidarUsuarios[]): Observable<RespuestaValidarUsuarios[]> {
    return this.http.post<RespuestaValidarUsuarios[]>(`${this.apiUrl}Permisos/InsertarUsuariosMasivo`, usuarios);
  }
  
}
