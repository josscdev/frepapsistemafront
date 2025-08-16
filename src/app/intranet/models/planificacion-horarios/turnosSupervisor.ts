export class TurnosSupervisor {
  idturnos: number = 0;
  usuario: string | null = null;
  horarioentrada: string | null = null;
  horariosalida: string | null = null;
  descripcion: string | null = null;
  idtipoturno: number | null = null;
  idemppaisnegcue: number | null = null;
  estado: number | null = null;
  fecha_creacion: Date | null = null;
  fecha_modificacion: Date | null = null;
  usuario_creacion: string | null = null;
  usuario_modificacion: string | null = null;

  editing?: boolean; // Agregamos un campo para controlar si se está editando este turno

}

export class TurnosAsignadosSupervisor {
  idpdvturno:  number = 0;
  idturnos: number = 0;
  usuario: string | null = null;
  horarioentrada: string | null = null;
  horariosalida: string | null = null;
  descripcion: string | null = null;
  idtipoturno: number | null = null;
  estado: number | null = null;
  fecha_creacion: Date | null = null;
  fecha_modificacion: Date | null = null;
  usuario_creacion: string | null = null;
  usuario_modificacion: string | null = null;
}