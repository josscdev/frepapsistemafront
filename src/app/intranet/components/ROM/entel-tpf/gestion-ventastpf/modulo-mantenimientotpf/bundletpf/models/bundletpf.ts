export interface ActualizarBundle {
    idbundle: number;
    estadobundle: number;
    usuario: string;
}

export interface ResultadoBundle {
    estado: string;
    mensaje: string;
}

export interface ListarBundle {
    idbundle?: number;
    codigobundle?: string;
    nombrebundle?: string;
    flagauthmessage?: number;
    idcodigo?: number;
    estado?: number;
    idemppaisnegcue?: number;
}
