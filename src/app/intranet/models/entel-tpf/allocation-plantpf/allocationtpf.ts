export class Allocationtpf {
    idrol?: number;
    docusuario?: string;
    nombres?: string;
    idpdv?: number;
    nombrepdv?: string;
    fechainicio?: string;
    fechafin?: string;
    usuarioredtde?: string;
    usuarioportal?: string;
    idtipolicencia?: number;
    nombretipolicencia?: string;
    observacionlicencia?: string;
    idtipoestado?: number;
    nombretipoestado?: string;
    idtipotrabajo?: number;
    nombretipotrabajo?: string;
    idtipofuncionalidad?: number;
    nombretipofuncionalidad?: string;
    referente?: string;
    gestante?: string;
    fechacarnetsanidad?: string;
    idemppaisnegcue?: number;
    fechacese?: string;
    estado?: number;
    usuariocreacion?: string;
    fechacreacion?: string;
    usuariomodificacion?: string;
    fechamodificacion?: string;
  }
  
  export class PuntoVentatpf {
    idpdv?: number;
    nombrepdv?: string;
  }
  
  export class EstadoPromotortpf {
    idtipoestado?: number;
    nombretipoestado?: string;
    estado?: number;
  }
  
  export class Funcionalidadtpf {
    idtipofuncionalidad?: number;
    nombretipofuncionalidad?: string;
    estado?: number;
  }
  
  export class TipoLicenciatpf {
    idtipolicencia?: number;
    nombretipolicencia?: string;
    estado?: number;
  }
  
  export class TipoTrabajotpf {
    idtipotrabajo?: number;
    nombretipotrabajo?: string;
    estado?: number;
  }