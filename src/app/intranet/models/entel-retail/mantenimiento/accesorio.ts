export class Accesorio {
    idtipoaccesorio?: number;
    nombretipoaccesorio?: string;
    subtipoaccesorio?: string;
    categoriaaccesorio?: string | null;
    idemppaisnegcue?: number;
    estado?: number;
    usuariocreacion?: string | null;
    fechacreacion?: string | null;
    usuariomodificacion?: string | null;
    fechamodificacion?: string | null;
    editing?: boolean; // Agregamos un campo para controlar si se está editando este turno
}