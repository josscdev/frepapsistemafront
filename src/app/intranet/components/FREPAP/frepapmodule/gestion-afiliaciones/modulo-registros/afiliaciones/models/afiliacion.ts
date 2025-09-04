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
    numficha: string | null;
    docafiliado: string | null;
    nombres: string | null;
    apellidopaterno: string | null;
    apellidomaterno: string | null;
    fechaafiliacion: string | null;       // ISO string desde el API
    edadafiliado: number;
    estado: number;
    estado_text: string | null;
    codubicacion: string | null;
    region: string | null;
    provincia: string | null;
    distrito: string | null;
    usuariocreacion: string | null;
    fechacreacion: string | null;         // ISO string
    usuariomodificacion: string | null;
    fechamodificacion: string | null;     // ISO string
    usuarioanulacion: string | null;
    fechaanulacion: string | null;        // ISO string
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
  
  export type RegionOption   = OpcionSelect;
  export type ProvinciaOption = OpcionSelect;
  export type DistritoOption  = OpcionSelect;