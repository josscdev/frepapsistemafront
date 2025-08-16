export class Allocation {
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

export class PuntoVenta {
  idpdv?: number;
  nombrepdv?: string;
}

export class EstadoPromotor {
  idtipoestado?: number;
  nombretipoestado?: string;
  estado?: number;
}

export class Funcionalidad {
  idtipofuncionalidad?: number;
  nombretipofuncionalidad?: string;
  estado?: number;
}

export class TipoLicencia {
  idtipolicencia?: number;
  nombretipolicencia?: string;
  estado?: number;
}

export class TipoTrabajo {
  idtipotrabajo?: number;
  nombretipotrabajo?: string;
  estado?: number;
}