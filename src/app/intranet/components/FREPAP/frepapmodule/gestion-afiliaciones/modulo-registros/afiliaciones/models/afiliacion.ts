// models/afiliaciones.models.ts
export interface FiltroAfiliacion {
    region?: string | null;
    provincia?: string | null;
    distrito?: string | null;
    perfil?: 'ADMIN' | 'USUARIO' | string | null;
    usuario?: string | null;
}

export interface ListarAfiliacion {
    idafiliacion: number;
    numficha: string;
    idtipodocumento: number;
    nombretipodocumento: string;
    abreviatura: string;
    docafiliado: string;
    nombres: string;
    apellidopaterno: string;
    apellidomaterno: string;
    fechanacimiento: string | Date | null;
    idestadocivil: number;
    nombreestadocivil: string;
    sexo: string;
    lugarnacimiento: string;
    codubicacion: string;
    region: string;
    subregion: string;
    localidad: string;
    avenida: string;
    numero: string;
    urbanizacion: string;
    celular: string;
    correo: string;
    observacionficha: string;
    fotoimg: string;              // ruta o nombre de archivo
    fechaafiliacion: string | null;
    firmaimg: string;
    huellaimg: string;
    fichaafiliacionpdf: string;
    estado: number;
    estado_text: string;
    usuariocreacion: string;
    fechacreacion: string | null;
    usuariomodificacion: string;
    fechamodificacion: string | null;
    edadafiliado: number;
    hojadevidapdf: string;
    usuarioanulacion: string;
    fechaanulacion: string | null;
}

export interface ListarOpcionUbigeo {
    codubicacion: string;
    rr: string;
    pp: string;
    dd: string;
    region: string;
    subregion: string;
    localidad: string;
}

export interface OpcionSelect {
    codigo: string;   // RR | PP | DD (2 dígitos)
    nombre: string;   // texto a mostrar (Región/Subregión/Localidad)
}

export type RegionOption = OpcionSelect;
export type ProvinciaOption = OpcionSelect;
export type DistritoOption = OpcionSelect;


export interface AfiliacionCreateDto {
  numficha: string | null;
  fechaafiliacion: string | null;        // YYYY-MM-DD
  nombres: string;
  apellidopaterno: string;
  apellidomaterno: string | null;

  idtipodocumento: string;               // DNI/CE/PAS (o el id real)
  docafiliado: string | null;

  fechanacimiento: string | null;        // YYYY-MM-DD
  edadafiliado: number;
  sexo: string;
  idestadocivil: number;
  lugarnacimiento: string;

  rr: string | null;                     // "RR"
  pp: string | null;                     // "RRPP"
  dd: string | null;                     // "RRPPDD"
  ubigeo: string | null;                 // prioriza dd > pp > rr

  avenida: string | null;
  numero: string | null;
  urbanizacion: string | null;

  telefono: string | null;
  correo: string;

  estado_text: 'ACTIVO' | 'INACTIVO';
  estado: number;                        // 1 activo, 0 inactivo
  observacion: string | null;

  archivosMeta: {
    foto?: { name: string; size: number; type: string };
    fichaafiliacionfile?: { name: string; size: number; type: string };
    hojadevida?: { name: string; size: number; type: string };
    copiadocumento?: { name: string; size: number; type: string };
  };
}

export interface ListarEstadoCivil {
  idestadocivil: number;
  nombreestadocivil: string;
  idemppaisnegcue: number;
  estado: number;
}

export interface ListarTipoDocumento {
  idtipodocumento: number;
  nombretipodocumento: string;
  abreviatura: string;
  idemppaisnegcue: number;
  estado: number;
}

export interface FiltroAfiliacionDesactivar {
  idafiliacion: number;
  usuarioanulacion: string;
}

export interface RespuestaAfiliacionDesactivar {
  success: boolean;
  message: string;
}


