export class HorarioPlanificadoRequest {
    idhorarioplanificado?: number;
    dnisupervisor?: string;
    dnipromotor?: string;
    idpdv?: number;
    puntoventa?: string;
    fecha?: string;
    horarioentrada?: string;
    horariosalida?: string;
    descripcion?: string;
    fecha_creacion?: Date;
    fecha_modificacion?: Date;
    usuario_creacion?: string;
    usuario_modificacion?: string;
    activarcbo?: number;
    estado?: number;
}

interface BasePromotoresHorarios {
    dnipromotor: string;
    dnisupervisor: string;
    puntoventa: string;
    fecha?: Date;
    horarioentrada: string;
    horariosalida: string;
    usuario_creacion: string;
    idemppaisnegcue: number;
}

export interface ListaPromotoresHorarios extends BasePromotoresHorarios {
    estado: string;
    mensaje: string;
    idpdv: number;
    descripcion: string;
    activarcbo: number;
}

export interface ValidarPromotoresHorarios extends BasePromotoresHorarios {
    // Additional properties specific to ValidarPromotoresHorarios can be added here if needed
}
