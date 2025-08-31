export interface InsertarInventario {
    docpromotorasesor: string
    idpdv: number
    idemppaisnegcue: number
    usuario: string;
    detalles: InsertarInventarioDetalle[];
}

export interface InsertarInventarioDetalle {
    idinventario: number
    imeiequipo: string
    idemppaisnegcue: number
    usuario: string
}

export interface ListarInventario {
    idinventario: number
    docpromotorasesor: string
    idpdv: number
    nombrepdv: string
    fecharegistro: Date
    nombres: string,
    apellidopaterno: string,
    apellidomaterno: string,
    nombrecompleto: string,
    departamento: string
    zona: string
    idemppaisnegcue: number
    usuariocreacion: string
    fechacreacion: Date
    usuariomodificacion: string
    fechamodificacion: Date
    usuarioanulacion: string
    fechanulacion: Date
    estado: number
}

export interface ListarInventarioDetalle {
    idinventariodetalle: number
    idinventario: number
    fecharegistro: string
    imeiequipo: string
    idemppaisnegcue: number
    usuariocreacion: string
    fechacreacion: Date
    usuariomodificacion: string
    fechamodificacion: Date
    usuarioanulacion: string
    fechanulacion: Date
    estado: number
}

export interface InsertarSoloInventarioDetalle {
    idinventario: number
    usuario: string;
    detalles: InsertarInventarioDetalle[];
}