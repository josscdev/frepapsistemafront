export class ModeloEquipotpf{
    idmodelo?: number;
    nombremodelo?: string | null = '';
    nombremarca?: string | null = '';
    nombregamma?: string | null = '';
    idemppaisnegcue?: number;
    estado?: number;
    usuariocreacion?: string | null;
    fechacreacion?: string | null;
    usuariomodificacion?: string | null;
    fechamodificacion?: string | null;
    editing?: boolean; // Agregamos un campo para controlar si se está editando este turno
}