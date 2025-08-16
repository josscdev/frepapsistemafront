import { Component, OnInit, signal, ViewChild, WritableSignal } from '@angular/core';
import { PermisosService } from '../../../../services/rom/seguridad/permisos/permisos.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CodigosRequest, CodigosResponse, Cuenta, Negocio } from '../../../../models/rom/seguridad/codigo';
import { AllUsersRequest, AllUsersResponse } from '../../../../models/rom/seguridad/allusers';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { RouterLink } from '@angular/router';
import { DatasharingService } from '../../../../services/rom/seguridad/datasharing.service';

import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { CrearUsuarioComponent } from './crear-usuario/crear-usuario.component';
import * as XLSX from 'xlsx';
import { ListaValidarUsuarios, RespuestaValidarUsuarios } from './models/usuario';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-administracion-permisos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    RouterLink
  ],
  templateUrl: './administracion-permisos.component.html',
  styleUrl: './administracion-permisos.component.css'
})
export class AdministracionPermisosComponent implements OnInit {
  @ViewChild('paginator') paginator?: MatPaginator;

  idempresa?: number;
  idpais?: number;
  usuario: string = "";
  selectedNegocio: number = 0;
  selectedCuenta: number = 0;
  negocios: Negocio[] = [];
  cuentas: Cuenta[] = [];
  codigos: CodigosResponse[] = []; // Almacena los datos originales de la API

  allUsers: AllUsersResponse[] = [];
  allUsersRequest: AllUsersRequest = new AllUsersRequest();

  filteredUsersList: any[] = []; // Lista filtrada para mostrar
  searchTerm: string = ''; // Término de búsqueda vinculado al input

  pageSize = 10
  desde: number = 0;
  hasta: number = 10;

  menuString: any;
  perfil: string = "";

  nombreEmpresa: string = "";
  imgEmpresa: string = "";

  nombrePais: string = "";
  imgPais: string = "";

  nombreSocio: string = "";

  isLoadingSave: boolean = false;
  isDisabled: boolean = true;

  cuentasLista: CodigosResponse[] = [];
  cuentasListaSocios: CodigosResponse[] = [];

  cargaCuentaSeleccionada: number = 0;
  cargaCuentaSeleccionadaSocios: number = 0;

  lValidarUsuarios: WritableSignal<ListaValidarUsuarios[]> = signal([]);
  lUsuariosValidados: WritableSignal<ListaValidarUsuarios[]> = signal([]);

  constructor(
    private permisosservice: PermisosService,
    private paginatorIntl: MatPaginatorIntl,
    private dataSharingService: DatasharingService,
    private router: Router,
    private authService: AuthService,
    private _dialog: MatDialog
  ) {
    this.idempresa = Number(localStorage.getItem('idempresa'));
    this.idpais = Number(localStorage.getItem('idpais'));
    this.usuario = localStorage.getItem('user') || '';

    console.log('idemp, idpais', this.idempresa, ' ', this.idpais)

    this.paginatorIntl.itemsPerPageLabel = "Registros por página: ";

    localStorage.removeItem('usuarioPermisosDatos');

    //Obteniendo el nombre del socio desde localStorage
    const socio = localStorage.getItem('nombrecuenta') || '- sin nombre';
    if (socio.includes('-')) {
      const nombreSocio = socio.split('-')[1].trimStart();
      this.nombreSocio = nombreSocio;
    } else {
      this.nombreSocio = socio;
    }
    console.log('nombreSocio', this.nombreSocio);

    this.menuString = (localStorage.getItem('menu') || '');

    let menu;
    if (this.menuString) {
      menu = JSON.parse(this.menuString);

      // Obtener la URL completa
      const url = this.router.url;
      console.log(url); // Imprime la URL completa

      let partes = url.split("/");
      // Quitamos la primera parte que es vacía y la parte "main"
      let nuevaUrl = partes.slice(2).join("/");
      console.log('nuevaurl', nuevaUrl);

      this.perfil = this.checkUrl(menu, nuevaUrl);
      console.log('Perfil es?', this.perfil);

    } else {
      // Manejar el caso en el que no hay menú en el localStorage
      menu = '';
    }

  }

  ngOnInit(): void {
    this.loadCodigos();
    this.getAllUsers();
    this.getCompany();
    this.getCountry();
  }

  getCompany() {
    this.authService.getCompany().subscribe({
      next: (response) => {
        console.log('Respuesta del servicio:', response);

        // Verificar si la respuesta contiene el id de empresa 1
        const empresaEncontrada = response.find((empresa: any) => empresa.idempresa === this.idempresa);

        if (empresaEncontrada) {
          console.log('Empresa ROM encontrada:', empresaEncontrada.nombreempresa);
          this.nombreEmpresa = empresaEncontrada.nombreempresa;
          if (this.idempresa === 1) {
            this.imgEmpresa = 'assets/img/Rom/logo_rom.svg';
          }
        } else {
          console.log('Empresa ROM no encontrada en la respuesta.');
          // Manejar el caso en el que el id de empresa '08' no se encuentra en la respuesta
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      },
    }); // Desactivar el spinner;
  }

  getCountry() {
    this.authService.getCountry().subscribe({
      next: (response) => {
        //console.log('Respuesta Pais:', response);

        // Verificar si la respuesta contiene el id de empresa '08'
        const paisEncontrado = response.find((pais: any) => pais.idpais === this.idpais);

        if (paisEncontrado) {
          console.log('Pais encontrado:', paisEncontrado.nombrepais);
          this.nombrePais = paisEncontrado.nombrepais;
          if (this.idpais === 1) {
            this.imgPais = 'assets/img/bandera_peru.svg';
          }
        } else {
          console.log('Pais no encontrado en la respuesta.');
          // Manejar el caso en el que el id de empresa '08' no se encuentra en la respuesta
        }
      }
    })
  }

  checkUrl(menu: any, requestedPath: string): string {
    //console.log('DEBE ENTRAR checkAuthorization');
    //console.log('menu', menu);
    console.log('requestedPath', requestedPath);

    if (!menu || !Array.isArray(menu)) {
      return 'No hay menu'; // No hay menú o no es un array válido
    }

    // Recorrer los módulos en el menú
    for (const modulo of menu) {
      // Verificar si la ruta del módulo coincide
      if (modulo.rutamodulo && modulo.rutamodulo === requestedPath) {
        //console.log('nombreperfilmodulo', modulo.nombreperfilmodulo);
        //console.log('modulo.rutamodulo', modulo.rutamodulo);

        return modulo.nombreperfilmodulo; // La ruta solicitada está presente en el menú
      }


      //console.log('modulo.submodules', modulo.submodules);
      // Si hay submódulos, recorrerlos
      if (modulo.submodules && Array.isArray(modulo.submodules)) {
        for (const submodulo of modulo.submodules) {
          // Verificar si la ruta del submódulo coincide
          if (submodulo.rutasubmodulo && submodulo.rutasubmodulo === requestedPath) {
            //console.log('nombreperfilsubmodulo', submodulo.nombreperfilsubmodulo);
            //console.log('submodulo.rutasubmodulo', submodulo.rutasubmodulo);

            return submodulo.nombreperfilsubmodulo; // La ruta solicitada está presente en el menú
          }

          // Si hay ítems, recorrerlos
          if (submodulo.items && Array.isArray(submodulo.items)) {
            for (const item of submodulo.items) {
              // Verificar si la ruta del ítem coincide
              if (item.rutaitemmodulo && item.rutaitemmodulo === requestedPath) {
                //console.log('nombreperfilitemmodulo', item.nombreperfilitemmodulo);
                //console.log('item.rutaitemmodulo', item.rutaitemmodulo);

                return item.nombreperfilitemmodulo; // La ruta solicitada está presente en el menú
              }
            }
          }
        }
      }
    }

    return 'No esta en el menú'; // La ruta solicitada no está en el menú
  }

  onRowClick(item: any) {
    this.dataSharingService.setSelectedItem(item);
    //this.router.navigate(['main/Seguridad/AdministracionPermisos/UsuarioPermisos']);
  }

  loadCodigos() {
    const request: CodigosRequest = {
      idempresa: 1,
      idpais: 1,
      idnegocio: undefined as number | undefined,
      idcuenta: undefined as number | undefined
    };
    this.permisosservice.getCodigos(request).subscribe((data: any[]) => {
      this.codigos = data;
      console.log('loadCodigos', this.codigos)
      this.filterNegocios();

      this.cuentasListaSocios = this.codigos.filter((cuenta: CodigosResponse) => cuenta.nombrecuenta);
      console.log('cuentasListaSocios', this.cuentasListaSocios);

      this.cuentasLista = this.codigos.filter((cuenta: CodigosResponse) => cuenta.nombrecuenta?.toLowerCase().includes(this.nombreSocio.toLowerCase()));
      console.log('cuentasLista', this.cuentasLista);
    });
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

  onNegocioChange() {
    this.selectedNegocio = Number(this.selectedNegocio)
    this.selectedCuenta = 0;
    if (this.selectedNegocio === 0) {
      //console.log('this.selectedNegocio ', this.selectedNegocio);
      //console.log('this.selectedCuenta ', this.selectedCuenta);
      this.cuentas = []
      //console.log('this.cuentas1: ', this.cuentas)
    } else {
      //console.log('this.selectedNegocio: ', this.selectedNegocio);
      //console.log('this.selectedCuenta ', this.selectedCuenta);
      if (this.perfil !== 'ADMIN') {
        this.cuentas = this.codigos
          .filter(item => item.idnegocio === this.selectedNegocio && item.nombrecuenta?.includes(this.nombreSocio))
          .map(item => ({
            idcuenta: item.idcuenta ?? 0,
            nombrecuenta: item.nombrecuenta ?? ''
          }));
      } else {
        this.cuentas = this.codigos
          .filter(item => item.idnegocio === this.selectedNegocio)
          .map(item => ({
            idcuenta: item.idcuenta ?? 0,
            nombrecuenta: item.nombrecuenta ?? ''
          }));
      }
      //console.log('this.codigos: ', this.codigos)
      //console.log('this.cuentas2: ', this.cuentas)
    }
  }


  getAllUsers() {
    this.selectedNegocio = Number(this.selectedNegocio);
    this.selectedCuenta = Number(this.selectedCuenta);

    console.log('this.selectedNegocio ', this.selectedNegocio);
    console.log('this.selectedCuenta ', this.selectedCuenta);

    // Resetear el paginador a la primera página
    this.paginator?.firstPage();

    // Actualizar los valores de `desde` y `hasta`
    this.desde = 0;
    this.hasta = this.pageSize;

    this.searchTerm = '';

    Swal.fire({
      title: 'Cargando Datos...',
      text: 'Por favor, espere mientras se cargan los datos.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    if (this.selectedNegocio === 0 && this.selectedCuenta === 0) {
      this.allUsersRequest = {
        idempresa: 1,
        idpais: 1,  //155
        idnegocio: undefined as number | undefined,  //003
        idcuenta: undefined as number | undefined,  //002
        usuario: undefined as string | undefined //72548754
      };
      console.log('this.allUsersRequest 1: ', this.allUsersRequest);
    } else if (this.selectedNegocio !== 0 && this.selectedCuenta === 0) {
      this.allUsersRequest = {
        idempresa: 1,
        idpais: 1,  //155
        idnegocio: this.selectedNegocio === 0 ? undefined : Number(this.selectedNegocio),  //003
        idcuenta: undefined as number | undefined,  //002
        usuario: undefined as string | undefined //72548754
      };
      console.log('this.allUsersRequest 2: ', this.allUsersRequest);
    } else if (this.selectedNegocio !== 0 && this.selectedCuenta !== 0) {
      this.allUsersRequest = {
        idempresa: 1,
        idpais: 1,  //155
        idnegocio: this.selectedNegocio === 0 ? undefined : Number(this.selectedNegocio),  //003
        idcuenta: this.selectedCuenta === 0 ? undefined : Number(this.selectedCuenta),  //002
        usuario: undefined as string | undefined //72548754
      };
      console.log('this.allUsersRequest 3: ', this.allUsersRequest);
    }

    this.permisosservice.getAllUsers(this.allUsersRequest).subscribe(data => {

      if (this.perfil !== 'ADMIN') {
        data = data.filter(item => item.nombrecuenta?.includes(this.nombreSocio));
      }

      this.allUsers = [];
      this.filteredUsersList = [];
      console.log('DATA:', data);

      if (data !== null || data !== '') {
        this.allUsers = data;
        this.filteredUsersList = data;
        //console.log(this.allUsers);
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
    });
  }

  cambiarpagina(e: PageEvent) {
    this.desde = e.pageIndex * e.pageSize;
    this.hasta = this.desde + e.pageSize;
  }

  search() {
    if (!this.searchTerm.trim()) {
      // Si el término de búsqueda está vacío, no filtre.
      this.filteredUsersList = this.allUsers;
    } else {
      this.filteredUsersList = this.allUsers.filter((item: any) =>
        item.docusuario.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.nombrecompleto.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.nombreempresa.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.nombrenegocio.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        item.nombrecuenta.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    }

    // Resetear el paginador a la primera página
    this.paginator?.firstPage();

    // Actualizar los valores de `desde` y `hasta`
    this.desde = 0;
    this.hasta = this.pageSize;
  }

  descargarExcel() {
    const link = document.createElement('a');
    link.href = 'assets/documents/excel/formatoUsuariosMasivo.xlsx';
    link.download = 'formatoUsuariosMasivo.xlsx';
    link.click();
  }

  onCuentaChange() {
    this.isDisabled = false;

    if (Number(this.cargaCuentaSeleccionada) === 0) {
      this.isDisabled = true;
    }
  }

  // Helper method to read file as binary string
  private readFileAsync(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsBinaryString(file);
    });
  }

  parseDate(dateStr: string | null): Date | null {
    if (!dateStr) {
      console.log('Invalid date string:', dateStr);
      return null;
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  async leerExcel(event: any): Promise<void> {
    try {
      this.isLoadingSave = true;
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length !== 1) {
        throw new Error('No se puede usar múltiples archivos');
      }

      const file = input.files[0];
      const fileContent = await this.readFileAsync(file);

      const wb: XLSX.WorkBook = XLSX.read(fileContent, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (data.length === 0) {
        throw new Error('La hoja está vacía');
      }

      const headers: string[] = data[0] as string[];
      const parsedData = data.slice(1)
        .map((row: any) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index] !== undefined ? row[index].toString() : null;
          });
          return obj;
        })
        .filter(row => Object.values(row).some(value => value !== null));

      const listaObjetos = parsedData.map(item => {
        const docusuario = item['DOCUMENTO']?.trim().toUpperCase().replace(/\s+/g, '') || null;
        const nombres = item['NOMBRES']?.trim().toUpperCase() || null;
        const apellidopaterno = item['APELLIDO_PATERNO']?.trim().toUpperCase() || null;
        const apellidomaterno = item['APELLIDO_MATERNO']?.trim().toUpperCase() || null;
        const sexo = item['SEXO']?.trim().toUpperCase().charAt(0) || null;
        const direccion = item['DIRECCION']?.trim().toUpperCase() || null;
        const celular = item['CELULAR']?.trim().replace(/\D/g, '') || null;
        const correopersonal = item['CORREO_PERSONAL']?.trim() || null;
        const correocorp = item['CORREO_CORPORATIVO']?.trim() || null;
        const fechaingreso = this.parseDate(item['FECHA_INGRESO']) || null;
        const fechanacimiento = this.parseDate(item['FECHA_NACIMIENTO']) || null;
        const usuario = this.usuario.trim() || null;
        const idemppaisnegcue = Number(this.cargaCuentaSeleccionada) || 0;
        const uuser = item['DOCUMENTO']?.trim().toUpperCase().replace(/\s+/g, '') || null;
        const clave = item['DOCUMENTO']?.trim().toUpperCase().replace(/\s+/g, '') || null;

        // Validar que no haya atributos vacíos
        if (!docusuario || !nombres || !apellidopaterno || !apellidomaterno || !usuario || !idemppaisnegcue || !uuser || !clave) {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: 'Hay datos obligatorios vacíos en el archivo. Revise los datos ingresados.',
          });
          throw new Error;
        }

        return { docusuario, nombres, apellidopaterno, apellidomaterno, sexo, direccion, celular, correopersonal, correocorp, fechaingreso, fechanacimiento, usuario, idemppaisnegcue, uuser, clave };
      });

      console.log('listaObjetos', listaObjetos);

      this.lValidarUsuarios.set(listaObjetos);

      console.log('LISTA USUARIOS sin campos vacios', this.lValidarUsuarios());

      // Ejecutar validación automática al terminar de leer
      await this.validarUsuariosAsync();

    } catch (error) {
      console.error('Error processing Excel file:', error);
      this.isLoadingSave = false;
      throw error;
    } finally {
      // Restablecer el estado independientemente de si hay error o no
      const input = event.target as HTMLInputElement;
      input.value = '';
      this.isLoadingSave = false;
    }
  }

  async validarUsuariosAsync(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.permisosservice.ValidarUsuarios(this.lValidarUsuarios())
      );

      const errorMessages = response
        .filter((item: RespuestaValidarUsuarios) => item.estado === 'error')
        .map((item: RespuestaValidarUsuarios) => item.mensaje);

      if (errorMessages.length > 0) {
        this.displayErrors(errorMessages); // Método propio que puedes implementar
      } else {
        // Si no hay errores, actualiza la lista validada
        const validItems = this.lValidarUsuarios().map(usuario => ({ ...usuario }));
        this.lUsuariosValidados.set(validItems);

        console.log('LISTA USUARIOS Validada:', this.lUsuariosValidados());

        Swal.fire({
          icon: 'success',
          title: 'Los usuarios han sido validados correctamente. Ahora guárdalos.',
          showConfirmButton: false,
          timer: 2000,
        });
      }

    } catch (error: any) {
      console.error('Error al validar usuarios:', error);
    
      if (error.status === 400 && error.error && error.error.errors) {
        const erroresBackend = error.error.errors as Record<string, string[]>;
    
        const mensajes = Object.entries(erroresBackend).map(
          ([campo, errores]) => `${campo}: ${errores.join(', ')}`
        );
    
        this.displayErrors(mensajes);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error inesperado',
          text: 'Hubo un problema al validar los usuarios. Revisa la consola.',
        });
      }
    
      throw error;
    } finally {
      console.log('validarUsuariosAsync() → finalizado');
    }
  }

  displayErrors(errors: string[]): void {
    Swal.fire({
      icon: 'warning',
      title: 'Errores detectados',
      html: `<ul style="text-align: left;">${errors.map(e => `<li>${e}</li>`).join('')}</ul>`,
      width: 600,
      confirmButtonText: 'Aceptar'
    });
  }

  async guardarUsuariosExcel(): Promise<void> {
    try {

      if(this.lUsuariosValidados().length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No hay usuarios validados',
          text: 'No hay usuarios validados para guardar, cargue un archivo.',
        });
        return;
      }
      
      Swal.fire({
        title: 'Guardando...',
        text: 'Por favor, espere mientras se registran los usuarios.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });
  
      const usuariosValidados = this.lUsuariosValidados(); // lista validada previamente

      console.log('usuariosValidados', usuariosValidados);

      const normalizados = this.normalizarUsuariosValidados(this.lUsuariosValidados());

      console.log('normalizados', normalizados);
  
      const response = await firstValueFrom(
        this.permisosservice.InsertarUsuariosMasivoAsync(normalizados)
      );
  
      console.log('Respuesta guardar usuarios:', response);
  
      const errores = response.filter(u => u.estado === 'Error');
      if (errores.length > 0) {
        Swal.fire({
          icon: 'warning',
          title: 'Error en el servidor'
        });
        console.log('errores', errores)
      } else {
        this.getAllUsers();
        Swal.fire({
          icon: 'success',
          title: 'Usuarios registrados',
          text: 'Todos los usuarios fueron guardados correctamente.',
        });
      }
  
    } catch (error) {
      console.error('🚨 Error al guardar usuarios:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error del servidor',
        text: 'No se pudo guardar la lista de usuarios. Intente más tarde.',
      });
    }
  }

  normalizarUsuariosValidados(lista: ListaValidarUsuarios[]): ListaValidarUsuarios[] {
    return lista.map((u) => ({
      docusuario: u.docusuario || '',
      nombres: u.nombres || '',
      apellidopaterno: u.apellidopaterno || '',
      apellidomaterno: u.apellidomaterno || '',
      correopersonal: u.correopersonal ?? null,
      correocorp: u.correocorp ?? null,
      celular: u.celular ?? null,
      sexo: u.sexo ?? null,
      fechanacimiento: u.fechanacimiento ? new Date(u.fechanacimiento) : null,
      direccion: u.direccion ?? null,
      uuser: u.uuser || '',
      clave: u.clave || '',
      usuario: u.usuario || '',
      fechaingreso: u.fechaingreso ? new Date(u.fechaingreso) : null,
      idemppaisnegcue: u.idemppaisnegcue || 0
    }));
  }

  agregarUsuario() {

    const cuentasListaSocios = this.codigos.filter((cuenta: CodigosResponse) => cuenta.nombrecuenta);
    //console.log('cuentasListaSocios', cuentasListaSocios);

    const cuentasLista = this.codigos.filter((cuenta: CodigosResponse) => cuenta.nombrecuenta?.toLowerCase().includes(this.nombreSocio.toLowerCase()));
    //console.log('cuentasLista', cuentasLista);

    const config: MatDialogConfig = {
      width: '95vw',
      maxHeight: '90vh',
      panelClass: 'custom-dialog-responsive',
      disableClose: true,
      data: {
        cuentasListaSocios,
        cuentasLista,
        perfil: this.perfil,
        nombreSocio: this.nombreSocio
      }
    }

    const dialogRef = this._dialog.open(CrearUsuarioComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.getAllUsers();
      }
    });
  }

}
