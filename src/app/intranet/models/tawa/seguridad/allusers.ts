export class AllUsersRequest {
    idempresa?: number;
    idpais?: number;
    idnegocio?: number;
    idcuenta?: number;
    usuario?: string;
}

export class AllUsersResponse {
    idusuario?: number;
    docusuario?: string;
    nombrecompleto?: string;
    nombres?: string;
    apellidopaterno?: string;
    apellidomaterno?: string;
    correo?: string;
    usuario?: string | any;
    idempresa?: number;
    nombreempresa?: string;
    idpais?: number;
    nombrepais?: string;
    idnegocio?: number;
    nombrenegocio?: string;
    idcuenta?: number;
    nombredescripcion?: string;
    estado?: number;
  }
  