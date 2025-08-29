import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginatorModule } from '@angular/material/paginator';
import { RouterLink } from '@angular/router';
import { CodigosRequest, CodigosResponse, Cuenta, Negocio } from '../../../../../models/tawa/seguridad/codigo';
import { Item, Module, Submodule } from '../../../../../models/tawa/seguridad/modulospermisos';
import { AllUsersResponse } from '../../../../../models/tawa/seguridad/allusers';
import { PermisosTawaService } from '../../../../../services/tawa/seguridad/permisos/permisos-tawa.service';
import { AuthService } from '../../../../../services/auth/auth.service';
import { DatasharingTawaService } from '../../../../../services/tawa/seguridad/datasharing-tawa.service';
import Swal from 'sweetalert2';
import { PermissionRequest } from '../../../../../models/Auth/permissionsRequest';

@Component({
  selector: 'app-usuario-permisos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    RouterLink
  ],
  templateUrl: './usuario-permisos.component.html',
  styleUrl: './usuario-permisos.component.css'
})
export class UsuarioPermisosComponent {
  idempresa: number = 0;
  idpais: number = 0;
  selectedNegocio: number = 0;
  selectedCuenta: number = 0;
  negocios: Negocio[] = [];
  cuentas: Cuenta[] = [];
  codigos: CodigosResponse[] = []; // Almacena los datos originales de la API

  modulos: Module[] = [];
  usuario: string;
  usuarioNombres: string = '';

  selectedItem: AllUsersResponse = new AllUsersResponse();

  listPerfiles: any[] = [];

  listaRespuestas: any[] = [];

  isShowList: boolean = true;

  nombreEmpresa: string = "";
  imgEmpresa: string = "";

  nombrePais: string = "";
  imgPais: string = "";

  constructor(
    private permisosservice: PermisosTawaService,
    private authService: AuthService,
    private dataSharingService: DatasharingTawaService
  ) {
    const userData = localStorage.getItem('usuarioPermisosDatos');
    if (userData) {
      try {
        this.selectedItem = JSON.parse(userData) as AllUsersResponse;
      } catch (error) {
        console.error('Error parsing user data from localStorage', error);
      }
    }
    this.idempresa = Number(localStorage.getItem('idempresa'));
    this.idpais = Number(localStorage.getItem('idpais'));
    this.usuario = (localStorage.getItem('user') || '');
  }

  ngOnInit(): void {
    this.loadCodigos();
    this.getPerfiles();
    this.getCompany();
    this.getCountry();
  }

  getCompany() {
    this.authService.getCompany().subscribe({
      next: (response) => {
        console.log('Respuesta Company:', response);

        // Verificar si la respuesta contiene el id de empresa 1
        const empresaEncontrada = response.find((empresa: any) => empresa.idempresa === this.idempresa);

        if (empresaEncontrada) {
          console.log('Empresa encontrada:', empresaEncontrada.nombreempresa);
          this.nombreEmpresa = empresaEncontrada.nombreempresa;
          if (this.idempresa === 1) {
            this.imgEmpresa = 'assets/img/frepap/frep.jpg';
          } else if(this.idempresa === 2){
            this.imgEmpresa = 'assets/img/Tawa/logo_tawa1.svg';
          }
        } else {
          console.log('Empresa no encontrada en la respuesta.');
          // Manejar el caso en el que el id de empresa 1 no se encuentra en la respuesta
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
      },
    }); // Desactivar el spinner;
  }

  getCountry() {
    this.authService.getCountry().subscribe({
      next: (response) => {
        console.log('Respuesta Pais:', response);

        // Verificar si la respuesta contiene el id de pais 1
        const paisEncontrado = response.find((pais: any) => pais.idpais === this.idpais);

        if (paisEncontrado) {
          console.log('Pais encontrado:', paisEncontrado.nombrepais);
          this.nombrePais = paisEncontrado.nombrepais;
          if (this.idpais === 1) {
            this.imgPais = 'assets/img/bandera_peru.svg';
          }
        } else {
          console.log('Pais no encontrado en la respuesta.');
          // Manejar el caso en el que el id de pais 1 no se encuentra en la respuesta
        }
      }
    })
  }

  loadCodigos() {
    const request: CodigosRequest = {
      idempresa: this.idempresa,
      idpais: this.idpais,
      idnegocio: undefined as number | undefined,
      idcuenta: undefined as number | undefined
    };
    this.permisosservice.getCodigos(request).subscribe((data: any[]) => {
      this.codigos = data;
      this.filterNegocios();
    });
  }
  toggleEstadoModulo(event: Event, modulo: Module): void {
    const checked = (event.target as HTMLInputElement).checked;
    console.log('toggleEstadoModulo', checked);
    modulo.estadomodulopermiso = modulo.estadomodulopermiso === 'A' ? 'NA' : 'A';
    console.log('modulo.estadomodulopermiso', modulo.estadomodulopermiso);
  }

  toggleEstadoSubModulo(event: Event, subModulo: Submodule): void {
    const checked = (event.target as HTMLInputElement).checked;
    console.log('toggleEstadoModulo', checked);
    subModulo.estadosubmodulopermiso = subModulo.estadosubmodulopermiso === 'A' ? 'NA' : 'A';
    console.log('subModulo.estadosubmodulopermiso', subModulo.estadosubmodulopermiso);
  }

  toggleEstadoItemModulo(event: Event, item: Item): void {
    const checked = (event.target as HTMLInputElement).checked;
    console.log('toggleEstadoModulo', checked);
    item.estadoitemmodulopermiso = item.estadoitemmodulopermiso === 'A' ? 'NA' : 'A';
    console.log('item.estadoitemmodulopermiso', item.estadoitemmodulopermiso);
  }

  filtrarAsignados(): Module[] {
    return this.modulos
      .filter(modulo => modulo.estadomodulopermiso === 'A' || modulo.estadomodulopermiso === 'NA')
      .map(modulo => ({
        ...modulo,
        submodules: modulo.submodules!
          .filter(subModulo => subModulo.estadosubmodulopermiso === 'A' || subModulo.estadosubmodulopermiso === 'NA')
          .map(subModulo => ({
            ...subModulo,
            items: subModulo.items!.filter(item => item.estadoitemmodulopermiso === 'A' || item.estadoitemmodulopermiso === 'NA')
          }))
      }));
  }

  generarJsonSimplificado(asignados: Module[]): any {
    const result: any[] = [];

    for (const modulo of asignados) {
      const mod: any = {
        idcodmod: modulo.idcodmod,
        idperfilmodulo: modulo.idperfilmodulo,
        submodules: []
      };

      for (const subModulo of modulo.submodules!) {
        const subMod: any = {
          idcodmodsubmod: subModulo.idcodmodsubmod,
          idperfilsubmodulo: subModulo.idperfilsubmodulo,
          items: []
        };

        for (const item of subModulo.items!) {

          const finalItem: any = {
            idcodmod: modulo.idcodmod,
            idcodmodsubmod: subModulo.idcodmodsubmod,
            idcodmodsubmoditemmod: item.idcodmodsubmoditemmod,
            idperfiles: item.estadoitemmodulopermiso === 'A' ? item.idperfilitemmodulo : 0,
            usuario: this.selectedItem.usuario,
            idempresa: this.selectedItem.idempresa,
            idpais: this.selectedItem.idpais,
            idnegocio: Number(this.selectedNegocio),
            idcuenta: Number(this.selectedCuenta),
            checks: item.estadoitemmodulopermiso === 'A' ? 1 : 0,
            usuario_creacion: this.usuario
          };

          result.push(finalItem);

        }

        // En caso de que no haya items, igual se agrega el submódulo con idcodmodsubmoditemmod como null
        if (subModulo.items!.length === 0) {
          const finalSubMod: any = {
            idcodmod: modulo.idcodmod,
            idcodmodsubmod: subModulo.idcodmodsubmod,
            idcodmodsubmoditemmod: null,
            idperfiles: subModulo.estadosubmodulopermiso === 'A' ? subModulo.idperfilsubmodulo : 0,
            usuario: this.selectedItem.usuario,
            idempresa: this.selectedItem.idempresa,
            idpais: this.selectedItem.idpais,
            idnegocio: Number(this.selectedNegocio),
            idcuenta: Number(this.selectedCuenta),
            checks: subModulo.estadosubmodulopermiso === 'A' ? 1 : 0,
            usuario_creacion: this.usuario
          };

          result.push(finalSubMod);

        }
      }

      // En caso de que no haya submódulos, igual se agrega el módulo con idcodmodsubmod e idcodmodsubmoditemmod como null
      if (modulo.submodules!.length === 0) {
        const finalMod: any = {
          idcodmod: modulo.idcodmod,
          idcodmodsubmod: null,
          idcodmodsubmoditemmod: null,
          idperfiles: modulo.estadomodulopermiso === 'A' ? modulo.idperfilmodulo : 0,
          usuario: this.selectedItem.usuario,
          idempresa: this.selectedItem.idempresa,
          idpais: this.selectedItem.idpais,
          idnegocio: Number(this.selectedNegocio),
          idcuenta: Number(this.selectedCuenta),
          checks: modulo.estadomodulopermiso === 'A' ? 1 : 0,
          usuario_creacion: this.usuario
        };

        result.push(finalMod);
      }
    }

    return result;
  }

  guardar(): void {

    if (this.selectedNegocio === 0 || this.selectedCuenta === 0) {
      this.isShowList = true;
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "warning",
        title: "Debe seleccionar Negocio y Cuenta"
      });
      return;
    }

    const asignados = this.filtrarAsignados();
    const jsonSimplificado = this.generarJsonSimplificado(asignados);

    console.log('Guardando permisos asignados:', asignados);
    console.log('Guardando permisos simplificados:', jsonSimplificado);

    // Aquí puedes realizar la lógica adicional para guardar los datos en el servidor si es necesario

    Swal.fire({
      title: 'Cargando Datos...',
      text: 'Por favor, espere mientras se cargan los datos.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.listaRespuestas = [];

    this.permisosservice.validarEstructuraModulos(jsonSimplificado).subscribe(
      res => {
        if (res !== null || res !== '') {
          console.log('RESPUESTAS: ', res);
          this.listaRespuestas = res;
          Swal.close();
        } else {
          Swal.close();
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3500,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "error",
            title: "Error con el servidor. No se pudo guardar los datos"
          });
        }

      }
    )
  }

  onNegocioChange() {
    if (this.selectedNegocio === 0) {
      this.isShowList = true;
      this.modulos = [];
      this.cuentas = this.codigos.map(item => ({
        idcuenta: item.idcuenta ?? 0, // Provee un valor predeterminado en caso de undefined
        nombrecuenta: item.nombrecuenta ?? '' // Provee un valor predeterminado en caso de undefined
      }));
    } else {
      console.log('this.selectedNegocio: ', this.selectedNegocio)
      this.cuentas = this.codigos
        .filter(item => item.idnegocio === Number(this.selectedNegocio))//this.selectedNegocio llega como string, debe convertirse a Number
        .map(item => ({
          idcuenta: item.idcuenta ?? 0, // Provee un valor predeterminado en caso de undefined
          nombrecuenta: item.nombrecuenta ?? '' // Provee un valor predeterminado en caso de undefined
        }));
      console.log('this.codigos: ', this.codigos)
      console.log('this.cuentas: ', this.cuentas)
    }
  }

  filterNegocios() {
    const uniqueNegocios: { idnegocio: number; nombrenegocio: string }[] = [];

    this.codigos.forEach(item => {
      if (item.idnegocio !== undefined && item.nombrenegocio !== undefined) {
        if (!uniqueNegocios.find(negocio => negocio.idnegocio === item.idnegocio)) {
          uniqueNegocios.push({ idnegocio: item.idnegocio, nombrenegocio: item.nombrenegocio });
        }
      }
    });

    this.negocios = uniqueNegocios.map(item => ({
      idnegocio: item.idnegocio ?? 0, // Provee un valor predeterminado en caso de undefined
      nombrenegocio: item.nombrenegocio ?? '' // Provee un valor predeterminado en caso de undefined
    }));

    //this.onNegocioChange();//esto es por si desde el inicio se quiere listar todo enves de filtrar por negocio
  }

  getModulosPermisos() {
    console.log('this.selectedNegocio ', this.selectedNegocio)
    console.log('this.selectedCuenta ', this.selectedCuenta)
    if (this.selectedNegocio === 0 || this.selectedCuenta === 0) {
      this.isShowList = true;
      const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3500,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        }
      });
      Toast.fire({
        icon: "warning",
        title: "Debe seleccionar Negocio y Cuenta"
      });
      return;
    }

    const request: PermissionRequest = {
      idempresa: this.idempresa,
      idpais: this.idpais,
      idnegocio: this.selectedNegocio,
      idcuenta: this.selectedCuenta,
      user: this.selectedItem.usuario
    }
    console.log('Sera?', request)

    Swal.fire({
      title: 'Cargando Datos...',
      text: 'Por favor, espere mientras se cargan los datos.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.permisosservice.getModulosPermisos(request).subscribe(res => {
      if (res !== null || res !== '') {
        this.isShowList = false;
        this.modulos = res.map((modulo: any) => {
          // Filtrar los submódulos
          const submodulesFiltrados = modulo.submodules.filter((submodulo: any) => submodulo.idsubmodulo !== 0).map((submodulo: any) => {
            // Filtrar los ítems del submódulo
            submodulo.items = submodulo.items.filter((item: any) => item.iditemmodulo !== 0);
            return submodulo;
          });
          // Asignar los submódulos filtrados al módulo
          modulo.submodules = submodulesFiltrados;
          return modulo;
        });
        console.log('this.modulos', this.modulos);
        Swal.close();
      } else {
        Swal.close();
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3500,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: "No se pudo cargar los datos"
        });
      }
    })
  }

  getPerfiles() {
    this.permisosservice.getPerfiles().subscribe(res => {
      this.listPerfiles = res;
      console.log('this.listPerfiles', this.listPerfiles)
    })
  }
}
