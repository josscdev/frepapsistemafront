
export class CodigosRequest {
    idempresa?: number;
    idpais?: number;
    idnegocio?: number;
    idcuenta?: number;
    idemppaisnegcue?: number;
    usuario?: string;
}

export class CodigosResponse {
    idemppaisnegcue?: number;
    idempresa?: number;
    nombreempresa?: string;
    idpais?: number;
    paisdescripcion?: string;
    idnegocio?: number;
    nombrenegocio?: string;
    idcuenta?: number;
    nombrecuenta?: string;
    estado?: number;
}

export class Negocio {
    idempresa?: number;
    idpais?: number;
    idnegocio?: number;
    nombrenegocio?: string;
}

export class Cuenta {
    idempresa?: number;
    idpais?: number;
    idcuenta?: number;
    nombrecuenta?: string;
}