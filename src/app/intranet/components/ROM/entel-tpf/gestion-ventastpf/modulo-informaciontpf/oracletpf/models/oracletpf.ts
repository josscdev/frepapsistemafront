export interface InsertarOracleLogistica {
    pdvRom: string;
    supervisor: string;
    pareto: string;
    gestorRom: string;
    categoria: string;
    territorio: string;
    tipoArticulo: string;
    codigoOracle: string;
    descripcion: string;
    serieSim: string;
    serieFicticio: string;
    valorizado: string;
    fechaRecepcion: string;
    statusActual: string;
    tipoAlmacen: string;
    diasStock: string;
    largoSim: string;
    largoFicticio: string;
    modeloUnico: string;
    subInventario: string;
}

export interface FiltroInsertarConciliar {
    fechainicioinv: string;       // formato: 'yyyy-mm-dd'
    fechafininv: string;          // formato: 'yyyy-mm-dd'
    fechainiciolog: string;       // formato: 'yyyy-mm-dd'
    fechafinlog: string;          // formato: 'yyyy-mm-dd'
    idemppaisnegcue: number;
    usuario: string;
}

export interface MatchResumenDto {
    idconciloracleinv?: number;
    pdvrom?: string;
    idpdv?: number;
    nombrepdv?: string;
    docpromotorasesor?: string;
    imeiequipo?: string;
    imeiserieficticio?: string;
    fechacargaol?: Date;
    fecharegistroinv?: Date;
    imeiflagestado?: string;
    fechaconciliacion?: Date;
    idemppaisnegcue?: number;
    estado?: number;
    usuariocreacion?: string;
    fechacreacion?: Date;
    usuariomodificacion?: string;
    fechamodificacion?: Date;
    usuarioanulacion?: string;
    fechaanulacion?: Date;
}

export interface OracleDetalleE {
    docpromotorasesor: string;
    fecharegistroinv: Date;
    imeiserieficticio: string;
}

export interface OracleDetalleF {
    imeiserieficticio: string;
}

export interface OracleDetalleS {
    docpromotorasesor: string;
    imeiequipo: string;
    fecharegistroinv: Date;
}