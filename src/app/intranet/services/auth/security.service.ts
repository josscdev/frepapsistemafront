import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
//import { CookieService } from 'ngx-cookie-service';
import { Observable } from 'rxjs';
import { PermissionRequest } from '../../models/Auth/permissionsRequest';
import { environment } from '../../../environments/environment';
import { LoginMainRequest } from '../../models/Auth/loginMainRequest';

interface TokenResponse {
  token: string;
  expirationDate: Date;
  // Puedes agregar más propiedades según sea necesario
}

@Injectable({
  providedIn: 'root'
})
export class SecurityService {

  constructor(
    private http: HttpClient
    
    ) { }
    private readonly apiUrl = environment.endpointIntranet;

  // getToken(): string{
  //   return 'TOKEN'
  // }

  // getToken(): Observable<string> {
  //   // En este ejemplo, estoy usando un valor estático como token, 
  //   // pero podrías modificarlo para obtener el token de la cookie o de alguna otra fuente asincrónica.
  //   const token = 'TOKEN';
  //   return new Observable<string>(observer => {
  //     observer.next(token);
  //     observer.complete();
  //   });
  // }
  // getPermissions(permissionRequest: PermissionRequest): Observable<any>{
  //   return this.http.post<any>(`${this.apiUrl}AuthLogin/GetPermissions`, permissionRequest);
  // }
  // authentication(permissionRequest: PermissionRequest): Observable<TokenResponse> {
  //   // En este ejemplo, estoy usando un valor estático como token y una fecha de expiración, 
  //   // pero podrías modificarlo para obtener el token de la cookie o de alguna otra fuente asincrónica.
  //   const token = 'TOKEN';
  //   const expirationDate = new Date(); // Puedes establecer la fecha de expiración real
  
  //   const tokenResponse: TokenResponse = {
  //     token,
  //     expirationDate,
  //     // Agrega más propiedades según sea necesario
  //   };
  
  //   return new Observable<TokenResponse>(observer => {
  //     observer.next(tokenResponse);
  //     observer.complete();
  //   });
  // }

  authenticate(permissionRequest: LoginMainRequest): Observable<any> {
    return this.http.post<TokenResponse>(`${this.apiUrl}AuthLogin/LoginMain`, permissionRequest);
  }


  getToken(){
    const token = localStorage.getItem('token');
    return token;
  }

  logout(): void {
    localStorage.removeItem('token'); // o el nombre exacto de tu clave
    // También puedes limpiar cualquier info adicional del usuario
  }
  // logIn(): string{
  //   let token = 'TOKEN';

  //   return token;
  // }
}
