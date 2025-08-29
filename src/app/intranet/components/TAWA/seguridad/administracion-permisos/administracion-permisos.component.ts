import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { CodigosRequest, CodigosResponse, Cuenta, Negocio } from '../../../../models/tawa/seguridad/codigo';
import { AllUsersRequest, AllUsersResponse } from '../../../../models/tawa/seguridad/allusers';
import { PermisosTawaService } from '../../../../services/tawa/seguridad/permisos/permisos-tawa.service';
import { AuthService } from '../../../../services/auth/auth.service';
import { DatasharingTawaService } from '../../../../services/tawa/seguridad/datasharing-tawa.service';
import Swal from 'sweetalert2';

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

  constructor(
    private permisostawaservice: PermisosTawaService,
    private paginatorIntl: MatPaginatorIntl,
    private dataSharingTawaService: DatasharingTawaService,
    private router: Router,
    private authService: AuthService,
  ) {
    this.idempresa = Number(localStorage.getItem('idempresa'));
    this.idpais = Number(localStorage.getItem('idpais'));
    console.log('idemp, idpais', this.idempresa, ' ', this.idpais)
    this.paginatorIntl.itemsPerPageLabel = "Registros por página: ";
    localStorage.removeItem('usuarioPermisosDatos');

    this.menuString = (localStorage.getItem('menu') || '');
    //console.log('this.menuString',this.menuString);
    let menu;
    if (this.menuString) {
      menu = JSON.parse(this.menuString);
      //console.log('menuu',menu);
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
            this.imgEmpresa = 'assets/img/frepap/frep.jpg';
          } else if(this.idempresa === 2){
            this.imgEmpresa = 'assets/img/Tawa/logo_tawa1.svg';
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
        console.log('Respuesta Pais:', response);

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
        console.log('nombreperfilmodulo', modulo.nombreperfilmodulo);
        console.log('modulo.rutamodulo', modulo.rutamodulo);

        return modulo.nombreperfilmodulo; // La ruta solicitada está presente en el menú
      }


      //console.log('modulo.submodules', modulo.submodules);
      // Si hay submódulos, recorrerlos
      if (modulo.submodules && Array.isArray(modulo.submodules)) {
        for (const submodulo of modulo.submodules) {
          // Verificar si la ruta del submódulo coincide
          if (submodulo.rutasubmodulo && submodulo.rutasubmodulo === requestedPath) {
            console.log('nombreperfilsubmodulo', submodulo.nombreperfilsubmodulo);
            console.log('submodulo.rutasubmodulo', submodulo.rutasubmodulo);

            return submodulo.nombreperfilsubmodulo; // La ruta solicitada está presente en el menú
          }

          // Si hay ítems, recorrerlos
          if (submodulo.items && Array.isArray(submodulo.items)) {
            for (const item of submodulo.items) {
              // Verificar si la ruta del ítem coincide
              if (item.rutaitemmodulo && item.rutaitemmodulo === requestedPath) {
                console.log('nombreperfilitemmodulo', item.nombreperfilitemmodulo);
                console.log('item.rutaitemmodulo', item.rutaitemmodulo);

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
    this.dataSharingTawaService.setSelectedItem(item);
    //this.router.navigate(['main/Seguridad/AdministracionPermisos/UsuarioPermisos']);
  }

  loadCodigos() {
    const request: CodigosRequest = {
      idempresa: this.idempresa,
      idpais: this.idpais,
      idnegocio: undefined as number | undefined,
      idcuenta: undefined as number | undefined
    };
    this.permisostawaservice.getCodigos(request).subscribe((data: any[]) => {
      this.codigos = data;
      console.log('loadCodigos', this.codigos)
      this.filterNegocios();
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
      console.log('this.selectedNegocio ', this.selectedNegocio);
      console.log('this.selectedCuenta ', this.selectedCuenta);
      this.cuentas = []
      console.log('this.cuentas1: ', this.cuentas)
    } else {
      console.log('this.selectedNegocio: ', this.selectedNegocio);
      console.log('this.selectedCuenta ', this.selectedCuenta);
      this.cuentas = this.codigos
        .filter(item => item.idnegocio === this.selectedNegocio)//this.selectedNegocio llega como string, debe convertirse a Number
        .map(item => ({
          idcuenta: item.idcuenta ?? 0, // Provee un valor predeterminado en caso de undefined
          nombrecuenta: item.nombrecuenta ?? '' // Provee un valor predeterminado en caso de undefined
        }));
      console.log('this.codigos: ', this.codigos)
      console.log('this.cuentas2: ', this.cuentas)
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
        idempresa: this.idempresa,
        idpais: this.idpais,
        idnegocio: undefined as number | undefined,  //003
        idcuenta: undefined as number | undefined,  //002
        usuario: undefined as string | undefined //72548754
      };
      console.log('this.allUsersRequest 1: ', this.allUsersRequest);
    } else if (this.selectedNegocio !== 0 && this.selectedCuenta === 0) {
      this.allUsersRequest = {
        idempresa: this.idempresa,
        idpais: this.idpais,
        idnegocio: this.selectedNegocio === 0 ? undefined : Number(this.selectedNegocio),  //003
        idcuenta: undefined as number | undefined,  //002
        usuario: undefined as string | undefined //72548754
      };
      console.log('this.allUsersRequest 2: ', this.allUsersRequest);
    } else if (this.selectedNegocio !== 0 && this.selectedCuenta !== 0) {
      this.allUsersRequest = {
        idempresa: this.idempresa,
        idpais: this.idpais,
        idnegocio: this.selectedNegocio === 0 ? undefined : Number(this.selectedNegocio),  //003
        idcuenta: this.selectedCuenta === 0 ? undefined : Number(this.selectedCuenta),  //002
        usuario: undefined as string | undefined //72548754
      };
      console.log('this.allUsersRequest 3: ', this.allUsersRequest);
    }

    this.permisostawaservice.getAllUsers(this.allUsersRequest).subscribe(data => {
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
    console.log(e, 'first');
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
}
