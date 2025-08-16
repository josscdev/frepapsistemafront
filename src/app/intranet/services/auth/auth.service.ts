import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BusinessUserRequest } from '../../models/Auth/businessUserRequest';
import { BusinessAccountUserRequest } from '../../models/Auth/businessAccountUserRequest';
import { PermissionRequest } from '../../models/Auth/permissionsRequest';
import { LoginMainRequest } from '../../models/Auth/loginMainRequest';
import { CodigosRequest } from '../../models/rom/seguridad/codigo';
import { RETAIL_AsistenciaBE } from '../../models/rom/seguridad/RETAIL_AsistenciaBE';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // private readonly apiUrl = 'https://localhost:7169/api/'
  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = {headers: new HttpHeaders({'Content-Type': 'application/json'})};

  constructor(
    private http: HttpClient
  ) { }


  getCompany(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}Company`);
    
  }
  getCountry(): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}Country`);
  }

  getUserData(user: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetUserData`, {user} );
  }
  
  
  getBusiness(businessUserRequest: BusinessUserRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetBusinessUser`, businessUserRequest);
  }

  getBusinessAccount(businessAccountUserRequest: BusinessAccountUserRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetBusinessAccountUser`, businessAccountUserRequest);
  }

  getPermissions(permissionRequest: PermissionRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetPermissions`, permissionRequest);
  }

  getIdCodigo(codigosRequest: CodigosRequest): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetIdCodigo`, codigosRequest);
  }

  getMarcacion(usuario: string): Observable<any>{
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetMarcacion`, `"${usuario}"`, this.httpOptions);
  }


  getIdPdv(codigosRequest: CodigosRequest):Observable<any>{
    return this.http.post<any>(`${this.apiUrl}AuthLogin/GetIdpdv`, codigosRequest)
  }

  getRutaPrincipal(request: any): Observable<{ ruta: string }> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<{ ruta: string }>(`${this.apiUrl}AuthLogin/GetRutaPrincipal`, request, { headers });
  }  

}
