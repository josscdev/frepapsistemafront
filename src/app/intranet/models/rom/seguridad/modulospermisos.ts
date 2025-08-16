export class Item {
  iditemmodulo!: number;
  idcodmodsubmoditemmod?: number;
  nombreitemmodulo!: string | null;
  iconoitemmodulo!: string | null;
  rutaitemmodulo!: string | null;
  nivelitemmodulo!: number | null;
  ordenitemmodulo!: number | null;
  estadoitemmodulo!: string | null;
  estadoitemmodulopermiso!: string;
  idperfilitemmodulo!: number;
}

export class Submodule {
  idsubmodulo!: number;
  idcodmodsubmod?: number;
  nombresubmodulo!: string | null;
  iconosubmodulo!: string | null;
  rutasubmodulo!: string | null;
  nivelsubmodulo!: number | null;
  ordensubmodulo!: number | null;
  estadosubmodulo!: string | null;
  estadosubmodulopermiso!: string;
  idperfilsubmodulo!: number;
  items?: Item[];
}

export class Module {
  idmodulo!: number;
  idcodmod?: number;
  nombremodulo!: string;
  iconomodulo!: string | null;
  rutamodulo!: string | null;
  nivelmodulo!: number | null;
  ordenmodulo!: number | null;
  estadomodulo!: string | null;
  estadomodulopermiso!: string;
  idperfilmodulo!: number;
  submodules?: Submodule[];
}

export class PermisosModulosRequest {
  idcodmod?: number | null;
  idcodmodsubmod?: number | null;
  idcodmodsubmoditemmod?: number | null;
  usuario?: string;
  idempresa?: string;
  idpais?: string;
  idnegocio?: string;
  idcuenta?: string;
}