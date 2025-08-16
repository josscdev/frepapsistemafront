export class Acceso {
    idacceso?: number;
    idperfiles?: number;

    dni?: string;
    perfil?: string;
    nombrecompleto?: string;
    editing?: boolean; // Agregamos un campo para controlar si se está editando este turno

}

export class AccesosRequest {
    idacceso?: number;


    idperfiles?: number;
    dni?: string;
    usuario_creacion?: string;
    usuario_modificacion?: string;
}