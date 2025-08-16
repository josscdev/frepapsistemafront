export interface InsertarUsuario {
    docusuario: string;
    nombres: string;
    apellidopaterno: string;
    apellidomaterno: string;
    correopersonal: string;
    correocorp: string;
    celular: string;
    sexo: string;
    fechanacimiento: string;
    direccion: string;
    usuario: string;
    clave: string;
    idemppaisnegcue: number;
    estado: number;
    fechaingreso: string;
    usuariocreacion: string;
}

export interface RespuestaUsuario {
    estado: string;
    mensaje: string;
}

export interface RespuestaUsuarioXDocumento {
    idusuario: number;
    docusuario: string;
    nombres: string;
    apellidopaterno: string;
    apellidomaterno: string;
    correopersonal?: string;
    correocorp?: string;
    celular?: string;
    sexo?: string;
    fechanacimiento?: string;
    direccion?: string;
    usuario: string;
    idemppaisnegcue: number;
    estado: number;
    fechaingreso?: string;
}

interface BaseUsuarios {
    docusuario: string;
    nombres: string;
    apellidopaterno: string;
    apellidomaterno: string;
    correopersonal: string | null;
    correocorp: string | null;
    celular: string | null;
    sexo: string | null;
    fechanacimiento: Date | null;
    direccion: string | null;
    usuario: string;
    idemppaisnegcue: number;
    fechaingreso: Date | null;
}

export interface ListaValidarUsuarios extends BaseUsuarios {
    uuser: string;
    clave: string;
    // Additional properties specific to ValidarPromotoresHorarios can be added here if needed
}

export interface RespuestaValidarUsuarios {
    docusuario: string;
    estado: string;
    mensaje: string;
}

