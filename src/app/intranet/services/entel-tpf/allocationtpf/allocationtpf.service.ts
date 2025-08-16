import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AllocationtpfService {

  private readonly apiUrl = environment.endpointIntranet;
  httpOptions = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };

  constructor(
    private http: HttpClient
  ) { }

  getAllRolPromotor(usuario:string,idemppaisnegcue: number, tipoperiodo: string): Observable<any> {
    const params = {
      usuario: usuario,
      idemppaisnegcue: idemppaisnegcue.toString(),  // Convierte el entero a texto para el query param
      tipoperiodo: tipoperiodo
    };
  
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetAllRolPromotorTPF`, { params });
  }

  getRolUsuarioPDV(usuario:string,idemppaisnegcue: number, tipoperiodo: string): Observable<any> {
    const params = {
      usuario: usuario,
      idemppaisnegcue: idemppaisnegcue.toString(),  // Convierte el entero a texto para el query param
      tipoperiodo: tipoperiodo
    };
  
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolUsuarioPDVTPF`, { params });
  }

  getRolPromotorDocUsuario(usuario: string, idemppaisnegcue: number, tipoperiodo: string, usuarioperfil: string): Observable<any> {
    const params = {
      usuario: usuario,
      idemppaisnegcue: idemppaisnegcue.toString(),  // Convierte el entero a texto para el query param
      tipoperiodo: tipoperiodo,
      usuarioperfil: usuarioperfil
    };
    console.log('params getRolPromotorDocUsuario', params)
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolPromotorDocUsuarioTPF`, { params });
  }

  getTipoFuncionalidad(idemppaisnegcue: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolTipoFuncionalidadTPF?idemppaisnegcue=${idemppaisnegcue}`);
  }

  getTipoTrabajo(idemppaisnegcue: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolTipoTrabajoTPF?idemppaisnegcue=${idemppaisnegcue}`)
  }

  getTipoLicencia(idemppaisnegcue: number): Observable<any> { //combobox Motivo
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolTipoLicenciaTPF?idemppaisnegcue=${idemppaisnegcue}`)
  }

  getTipoEstado(idemppaisnegcue: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolTipoEstadoTPF?idemppaisnegcue=${idemppaisnegcue}`)
  }

  getPdv(idemppaisnegcue: number): Observable<any>{
    return this.http.get<any>(`${this.apiUrl}AllocationTPF/GetRolPdvTPF?idemppaisnegcue=${idemppaisnegcue}`)
  }

  postRoles(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AllocationTPF/PostRolesTPF`, request)
  }

  putRoles(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AllocationTPF/PutRolesTPF`, request)
  }

  deleteOneRol(request: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}AllocationTPF/AnularRolTPF`, request)
  }

  
    getUsuarioEntel(idemppaisnegcue: number): Observable<any> { //combobox Motivo
      return this.http.get<any>(`${this.apiUrl}Allocation/GetUsuariosEntel?idemppaisnegcue=${idemppaisnegcue}`)
    }
    postUsuarioEntel(request: any): Observable<any> {
      console.log('request entel', request)
      return this.http.post<any>(`${this.apiUrl}Allocation/PostUsuarioEntel`, request)
    }
  
  
    putUsuarioEntel(request: any): Observable<any> {
      console.log('request entel', request)
      return this.http.post<any>(`${this.apiUrl}Allocation/PutUsuarioEntel`, request)
    }
  
  
    deleteUsuarioEntel(idUsuarioEntel: number, usuarioEliminacion: string): Observable<any> {
      console.log('idUsuarioEntel', idUsuarioEntel);
      console.log('usuarioEliminacion', usuarioEliminacion);
  
      const params = new HttpParams()
          .set('idUsuarioEntel', idUsuarioEntel)
          .set('usuarioEliminacion', usuarioEliminacion);
  
      return this.http.post<any>(`${this.apiUrl}Allocation/DeleteUsuarioEntel`, null, { params });
  }

  getNombreExcel(idemppaisnegcue: number, vista: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}Allocation/GetNombreExcel?idemppaisnegcue=${idemppaisnegcue}&vista=${vista}` , {});
  }
}
