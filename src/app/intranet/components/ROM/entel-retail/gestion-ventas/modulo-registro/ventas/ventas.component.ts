import { ChangeDetectionStrategy, Component, inject, model, OnInit, signal, ViewChild } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { provideNativeDateAdapter } from '@angular/material/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE } from '@angular/material/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import * as XLSX from 'xlsx';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { CrearVentaComponent } from './crear-venta/crear-venta.component';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { map, Observable, of, startWith, switchMap } from 'rxjs';
import { Router } from '@angular/router';
import { VentasService } from '../../../../../../services/entel-retail/ventas/ventas.service';
import { Subproducto } from '../../../../../../models/entel-retail/ventas/listasVentas';
import { AsignarTurnosService } from '../../../../../../services/entel-retail/planificacion-horarios/asignar-turnos.service';
import { Jefe } from '../../../../../../models/planificacion-horarios/jefe';
import { MatSelectModule } from '@angular/material/select';
import { Supervisor } from '../../../../../../models/planificacion-horarios/supervisor';
import { UsuarioSupervisor } from '../../../../../../models/planificacion-horarios/usuarioSupervisor';
import { SupervisorPDV } from '../../../../../../models/planificacion-horarios/supervisorPDV';
import Swal from 'sweetalert2';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { EditarVentaComponent } from './editar-venta/editar-venta.component';
import { EditarVoucherComponent } from './editar-voucher/editar-voucher.component';
import { AuthService } from '../../../../../../services/auth/auth.service';
import { SpinnerComponent } from '../../../../../../shared/spinner/spinner.component';

const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD/MM/YYYY',
  },
  display: {
    dateInput: 'DD/MM/YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'DD/MM/YYYY',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

export interface DialogData {
  animal: string;
  name: string;
}

export class Option {
  id!: number;
  name!: string;
}

@Component({
  selector: 'app-ventas',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatAutocompleteModule,
    MatSelectModule,
    AsyncPipe,
    MatPaginatorModule,
    SpinnerComponent
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ventas.component.html',
  styleUrl: './ventas.component.css'
})
export class VentasComponent implements OnInit {
  @ViewChild('paginator') paginator?: MatPaginator;

  filtroForm!: FormGroup;

  pageSize = 10

  desde: number = 0;
  hasta: number = 10;
  filteredVentasdetallelist: any[] = [];

  totalVentas: number = 0;
  ventasdetallelista$?: Observable<any[]>;
  ventasdetallelist?: any[] = [];
  botonExcelHabilitado: boolean = false;
  searchTerm: string = ''; // Término de búsqueda vinculado al input


  readonly animal = signal('');
  readonly titulo = model('');
  readonly dialog = inject(MatDialog);
  idemppaisnegcue: number;
  // ventasdetallelista:any = []; // Propiedad para almacenar los datos de ventas

  isLoading: boolean = false;

  openEdit(venta: any): void {

    const dialogRefedit = this.dialog.open(EditarVentaComponent, {
      data: { titulo: 'Visualizar Venta', ventaData: venta, perfil: this.perfil },
      height: '95%',
      width: '80%'

    });
    dialogRefedit.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      this.buscar();
    });

  }

  openEditVoucher(venta: any): void {
    const dialogRefeditvoucher = this.dialog.open(EditarVoucherComponent, {
      data: { titulo: 'Visualizar Voucher', ventaData: venta, perfil: this.perfil },
      height: '95%',
      width: '80%'

    });
    console.log('ssssss')
    dialogRefeditvoucher.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      // Mostrar el spinner
      this.isLoading = true;

      // Esperar 3 segundos antes de ejecutar this.buscar()
      setTimeout(() => {
        this.isLoading = false; // Ocultar el spinner

        this.buscar();

      }, 1000); // 3000 milisegundos = 3 segundos
      //this.buscar();
    });
  }

  openDialog(): void {

    // Verificar si el perfil es "HC"
    if (this.perfil === 'HC' 
      // && Number(localStorage.getItem('flagAsistencia')) !== 0
  ) {
      const dialogRef = this.dialog.open(CrearVentaComponent, {
        data: { titulo: 'Registrar Venta', perfil: this.perfil },
        height: '95%',
        width: '90%'
      });

      dialogRef.afterClosed().subscribe(result => {
        // console.log('The dialog was closed', result);

        // Mostrar el spinner
        this.isLoading = true;

        // Esperar 3 segundos antes de ejecutar this.buscar()
        setTimeout(() => {
          this.isLoading = false; // Ocultar el spinner

          this.buscar();

        }, 1500); // 3000 milisegundos = 3 segundos
        //this.buscar();
      });
    }
    // Verificar si el perfil es "ADMIN", "JV", o "SG" y si flagAsistencia no existe o es 0
    else if ((this.perfil === 'ADMIN' || this.perfil === 'JV' || this.perfil === 'SG')
      && (!localStorage.getItem('flagAsistencia') || Number(localStorage.getItem('flagAsistencia')) === 0)
    ) {

      const dialogRef = this.dialog.open(CrearVentaComponent, {
        data: { titulo: 'Registrar Venta', perfil: this.perfil },
        height: '95%',
        width: '90%'
      });

      dialogRef.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        // Mostrar el spinner
        this.isLoading = true;

        // Esperar 3 segundos antes de ejecutar this.buscar()
        setTimeout(() => {
          this.isLoading = false; // Ocultar el spinner

          this.buscar();

        }, 1500); // 3000 milisegundos = 3 segundos
        //this.buscar();
        // if (result) { // Solo ejecuta buscar si el resultado es exitoso
        //   this.buscar();
        // }
      });
    }

    else {
      Swal.fire({
        icon: 'error',
        title: 'No puedes registrar ventas',
        text: 'No puedes registrar ventas porque no hiciste marcación',
        confirmButtonText: 'OK'
      });
    }

  }

  optionsTipoRegistro: Option[] = [
    { id: 0, name: 'EVA' },
    { id: 1, name: 'VENT' },
    { id: 2, name: 'FOR' }
  ];

  filteredOptionsTipoRegistro!: Observable<Option[]>;

  tipoSubproductoList: Option[] = [];
  filteredOptionstipoSubproducto!: Observable<Option[]>;

  jefesList: Jefe[] = [];
  supervisorList: Supervisor[] = [];
  pdvList: SupervisorPDV[] = [];

  menuString: any;
  perfil: string = "";
  usuario: string;

  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
    private ventasService: VentasService,
    private asignarturnosService: AsignarTurnosService,
    private authService: AuthService
  ) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.menuString = (localStorage.getItem('menu') || '');
    this.usuario = (localStorage.getItem('user') || '');
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
      // localStorage.setItem('PerfilVentas', this.perfil);
      console.log('Perfil es?', this.perfil);

    } else {
      // Manejar el caso en el que no hay menú en el localStorage
      menu = '';
    }

    if (this.perfil === 'ADMIN') {

      const requestPdv = {
        idemppaisnegcue: 0,
        usuario: (localStorage.getItem('user') || '')
      }
      console.log('requestPdv', requestPdv);

      this.authService.getIdPdv(requestPdv).subscribe(resPdv => {
        console.log('GETIDPDV', resPdv);
        localStorage.setItem('idpdv', resPdv.idpdv)
      })

    }


    //this.getSubproducto();
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

  getSubproducto() {
    this.ventasService.getSubproducto(17).subscribe((res: Subproducto[]) => {
      console.log('lista tip getSubproducto', res);
      if (res !== null) {

        this.tipoSubproductoList = res.map(subproducto => ({
          id: subproducto.idsubproducto,
          name: subproducto.nombresubproducto
        }) as Option);
        this.tipoSubproductoList.push({ id: 0, name: 'TODOS' });
        // Trigger the first filtering to initialize the list
        this.idSubproductoControl.setValue('');

        // console.log('tipoSubproductoList', this.tipoSubproductoList);

      }
    });
  }

  cambiarpagina(e: PageEvent) {
    console.log(e, 'first');
    this.desde = e.pageIndex * e.pageSize;
    this.hasta = this.desde + e.pageSize;
  }
  getJefes() {
    const request = {
      idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue'))
    }
    this.asignarturnosService.getJefes(request).subscribe(res => {
      console.log('jefes', res)
      if (res != null) {
        this.jefesList = res;
        this.jefesList.push({ dnijefe: '0', nombrejefe: 'TODOS' });
      }
    })
  }

  changeJefe(event: any): void {
    console.log('Change Jefe');
    const dnijefe = event.value;
    localStorage.setItem('dnijefe', dnijefe);
    this.getSupervisores();
  }

  getSupervisores() {
    let dnijefe: string = "";

    if (this.perfil === 'ADMIN') {
      dnijefe = (localStorage.getItem('dnijefe') || '');
    } else if (this.perfil === 'JV') {
      dnijefe = this.usuario!;
    }

    const request = {
      idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')),
      dnijefe: dnijefe
    }

    this.asignarturnosService.getSupervisores(request).subscribe(res => {
      console.log('supervisores', res)
      if (res != null) {
        this.supervisorList = res;
        this.supervisorList.push({ dnisupervisor: '0', nombresupervisor: 'TODOS' });
      }
    })
  }

  changeSupervisor(event: any) {
    const dnisupervisor = event.value;
    localStorage.setItem('dnisupervisor', dnisupervisor);
    this.getPDV();
  }

  getPDV() {
    const supervisor: UsuarioSupervisor = new UsuarioSupervisor();;
    if (this.perfil === 'ADMIN' || this.perfil === 'JV') {
      const dnisupervisor = localStorage.getItem('dnisupervisor');
      supervisor.usuario = dnisupervisor || ''
    } else if (this.perfil === 'SG') {
      supervisor.usuario = this.usuario!
    }

    // this.listSupervisorPDV = [];
    const request = {
      dnisupervisor: supervisor.usuario,
      idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')),
    };
    this.asignarturnosService.getSupervisorPDV(request).subscribe(res => {
      console.log(res);
      this.pdvList = res;
      this.pdvList.push({ idpuntoventarol: 0, puntoventa: 'TODOS' });
    })
  }

  ngOnInit() {

    this.filtroForm = this.createForm()

    // Inicializa cada control y su respectivo filtro
    this.initializeSubproductoAutocomplete();
    // this.initializeTipoRegistroAutocomplete();

    // switch (this.perfil) {
    //   case 'ADMIN':
    //     this.getJefes();
    //     break;
    //   case 'JV':
    //     this.getSupervisores();
    //     break;
    //   case 'SG':
    //     this.getPDV();
    //     break;
    //   default:
    //     break;
    // }
  }

  createForm(): UntypedFormGroup {
    const today = new Date();
    return this.fb.group({
      startDate: new FormControl(today, Validators.required),
      endDate: new FormControl(today, Validators.required),
      idsubproducto: new FormControl(null),
      // idtiporegistro: new FormControl(null, Validators.required),
      dnijefe: new FormControl(null),
      dnisupervisor: new FormControl(null),
      idpdv: new FormControl(null)
    }, { validators: this.dateRangeValidator });
  }

  // private initializeTipoRegistroAutocomplete(): void {
  //   this.filteredOptionsTipoRegistro = this.idTipoRegistroControl.valueChanges.pipe(
  //     startWith(''),
  //     map(value => typeof value === 'string' ? value : this.displayFnTipoRegistro(value)),
  //     map(name => this._filter(name, this.optionsTipoRegistro))
  //   );
  // }

  get idSubproductoControl(): FormControl {
    return this.filtroForm.get('idsubproducto')! as FormControl;
  }

  private _filterSubproducto(name: string, options: Option[]): Option[] {
    const filterValue = name.toLowerCase();
    // console.log('return _filter: ', options.filter(option => option.name.toLowerCase().includes(filterValue)));
    return options.filter(option => option.name.toLowerCase().includes(filterValue));
  }

  displayFnSubproducto = (id: number): string => {
    const option = this.tipoSubproductoList.find(opt => opt.id === id);
    return option ? option.name : '';
  }

  private initializeSubproductoAutocomplete(): void {
    this.filteredOptionstipoSubproducto = this.idSubproductoControl.valueChanges.pipe(
      startWith(''),
      map(value => typeof value === 'string' ? value : this.displayFnSubproducto(value)),
      map(name => this._filterSubproducto(name, this.tipoSubproductoList))
    );
  }

  // get idTipoRegistroControl(): FormControl {
  //   return this.filtroForm.get('idtiporegistro')! as FormControl;
  // }

  // private _filter(name: string, options: Option[]): Option[] {
  //   const filterValue = name.toLowerCase();
  //   return options.filter(option => option.name && option.name.toLowerCase().includes(filterValue));
  // }

  // displayFnTipoRegistro = (id: number): string => {
  //   const option = this.optionsTipoRegistro.find(opt => opt.id === id);
  //   return option ? option.name : '';
  // }

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && end < start ? { 'dateRangeInvalid': true } : null;
  }

  buscar() {
    console.log('FORMULARIO RESPONSE: ', this.filtroForm.value);
    if (this.filtroForm.invalid) {
      console.log('Formulario inválido');

      Swal.fire({

        icon: 'error',
        title: 'Error',
        text: 'Por favor, complete los filtros de búsqueda correctamente',
        confirmButtonText: 'OK'
      });
      return;
    }


    console.log('entro??');

    const startDate = this.filtroForm.value.startDate;
    const endDate = this.filtroForm.value.endDate;
    console.log('entro??');

    if (endDate < startDate) {
      console.log('La fecha de fin no puede ser menor que la fecha de inicio');
      return;
    }

    const formattedStartDate = this.formatDateSave(startDate);
    const formattedEndDate = this.formatDateSave(endDate);

    const idsubproducto = this.filtroForm.get('idsubproducto')?.value;
    const dnijefe = this.filtroForm.get('dnijefe')?.value;
    const dnisupervisor = this.filtroForm.get('dnisupervisor')?.value;
    const idpdv = this.filtroForm.get('idpdv')?.value;

    const convertToNullIfZero = (value: any) => (value === 0 || value === '0' || value === '') ? null : value;

    const requestFilter: any = {
      fechainicial: formattedStartDate,
      fechafinal: formattedEndDate,
      idemppaisnegcue: this.idemppaisnegcue
      // idsubproducto: convertToNullIfZero(idsubproducto),
      // idtiporegistro: Number(this.filtroForm.value.idtiporegistro) | 0,
      // dnijefe: convertToNullIfZero(dnijefe),
      // dnisupervisor: convertToNullIfZero(dnisupervisor),
      // idpdv: convertToNullIfZero(idpdv)
    };

    // console.log('Fecha de inicio:', formattedStartDate);
    this.botonExcelHabilitado = true;
    console.log('entro??');

    if (this.perfil === 'ADMIN') {
      this.ventasdetallelista$ = this.ventasService.getVentasAdmin(requestFilter);

    } else if (this.perfil === 'JV') {
      requestFilter.idjefe = localStorage.getItem('user') || '';

      this.ventasdetallelista$ = this.ventasService.getVentasJefe(requestFilter);

    } else if (this.perfil === 'SG') {
      requestFilter.idsuper = localStorage.getItem('user') || '';
      this.ventasdetallelista$ = this.ventasService.getVentasSuper(requestFilter);

    } else if (this.perfil === 'HC') {
      requestFilter.idpromotor = localStorage.getItem('user') || '';
      this.ventasdetallelista$ = this.ventasService.getVentasPromotor(requestFilter);


    } else {
      console.log('Perfil no reconocido');
    }

    this.ventasdetallelista$?.subscribe({
      next: (data: any[]) => {
        this.ventasdetallelist = data; // Actualiza la lista con los datos obtenidos
        this.filteredVentasdetallelist = [...this.ventasdetallelist]; // Inicializa la lista filtrada

        console.log('Datos asignados a ventasdetallelist:', this.ventasdetallelist);
      },
      error: (error) => {
        console.error('Error al obtener los datos:', error);
      }
    });

    this.paginator?.firstPage();



    console.log('requestFilter:', requestFilter)



  }

  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  formatDateSave(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  onRowClick(users: any) {

  }

  exportarExcel() {
    const startDate = this.filtroForm.value.startDate;
    const endDate = this.filtroForm.value.endDate;

    // Formatear las fechas de inicio y fin usando tu método de formato
    const formattedStartDate = this.formatDateSave(startDate);
    const formattedEndDate = this.formatDateSave(endDate);

    this.ventasdetallelista$?.subscribe(data => {
      // console.log('data', data);
      if (data && data.length > 0) {
        // Filtra los datos para la hoja "ventas"
        const data1 = data.map(item => ({
          idventasdetalle: item.idventasdetalle,
          idventas: item.idventas,
          fechaoperacion: item.fechaoperacion ? new Date(item.fechaoperacion).toLocaleDateString() : null, // Formato de solo fecha
          docpromotor: item.docpromotorasesor,
          // idpdv: item.idpdv,
          nombrepdv: item.nombrepdv,
          // idtipodocumento: item.idtipodocumento,
          nombretipodocumento: item.nombretipodocumento,
          doccliente: item.doccliente,
          // idtipobiometria: item.idtipobiometria,
          nombretipobiometria: item.nombretipobiometria,
          numcelularcontrato: item.numcelularcontrato,
          correocliente: item.correocliente,
          observacion: item.observacion,
          // nombrevoucher: item.nombrevoucher,
          // numeroruc: item.numeroruc,
          // codcomprobante: item.codcomprobante,
          // numeroserie: item.numeroserie,
          // numero: item.numero,
          // fechaemisionvoucher: item.fechaemisionvoucher,
          // montovoucher: item.montovoucher,
          // tramaqrcode: item.tramaqrcode,
          // idsubproducto: item.idsubproducto,
          nombresubproducto: item.nombresubproducto,
          // idoperador: item.idoperador,
          nombreoperador: item.nombreoperador,
          // idtipoequipo: item.idtipoequipo,
          nombretipoequipo: item.nombretipoequipo,
          // idtiposeguro: item.idtiposeguro,
          nombretiposeguro: item.nombretiposeguro,

          // idtipoetiqueta: item.idtipoetiqueta,
          nombretipoetiqueta: item.nombretipoetiqueta,
          // idtipopago: item.idtipopago,
          nombretipopago: item.nombretipopago,
          // idplan: item.idplan,
          nombreplan: item.nombreplan,
          // idmodelo: item.idmodelo,
          nombremodelo: item.nombremodelo,
          imeiequipo: item.imeiequipo,
          imeisim: item.imeisim,
          iccid: item.iccid,
          // idbundle: item.idbundle,
          nombrebundle: item.nombrebundle,
          pagocaja: item.pagocaja,
          numerocelular: item.numerocelular,
          // idtipoaccesorio: item.idtipoaccesorio,
          nombretipoaccesorio: item.nombretipoaccesorio,
          cantidadaccesorio: item.cantidadaccesorio,
          pagoaccesorio: item.pagoaccesorio,
          imeiaccesorio: item.imeiaccesorio,
          numeroorden: item.numeroorden,
          // ventasromimeicoincide: item.ventasromimeicoincide.trim(),  // Eliminando espacios en blanco
          // codigoauthbundle: item.codigoauthbundle,
          // flagcodigoauthbundle: item.flagcodigoauthbundle,
          // idcodigo: item.idcodigo,
          nombrecuenta: item.nombrecuenta,
          // estado: item.estado,
          usuariocreacion: item.usuariocreacion,
          fechacreacion: new Date(item.fechacreacion).toLocaleString()  // Convertir a formato de fecha
          // usuariomodificacion: item.usuariomodificacion,
          // fechamodificacion: item.fechamodificacion ? new Date(item.fechamodificacion).toLocaleDateString() : null,
          // usuarioanulacion: item.usuarioanulacion,
          // fechaanulacion: item.fechaanulacion ? new Date(item.fechaanulacion).toLocaleDateString() : null
        }));

        // Crea hojas de trabajo
        const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data1);

        // Crea un libro de trabajo y añade la hoja
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws1, 'ventas');

        // Define el nombre del archivo usando las fechas de inicio y fin
        const fileName = `ventas_${formattedStartDate}_to_${formattedEndDate}.xlsx`;

        // Guarda el archivo
        XLSX.writeFile(wb, fileName);
      }
    });
  }


  eliminarventasdetalle(idventasdetalle: any) {
    console.log('idventasdetalle', idventasdetalle);
    console.log('usuario', this.usuario);
    Swal.fire({
      title: '¿Estás seguro de eliminar la venta?',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.ventasService.getDeleteVentasDetalle(idventasdetalle, this.usuario).subscribe((res) => {
          console.log('res', res);
          if (res) {
            this.buscar();

            Swal.fire('Venta eliminada con éxito', '', 'success');
          } else {
            Swal.fire('Error al eliminar la venta', '', 'error');
          }
        });
      }
    });
  }

  search() {
    if (!this.searchTerm.trim()) {
      // Si no hay término de búsqueda, muestra la lista completa
      this.filteredVentasdetallelist = this.ventasdetallelist ? [...this.ventasdetallelist] : [];
    } else {
      const searchLowerCase = this.searchTerm.toLowerCase();
      // Filtra la lista según el término de búsqueda
      this.filteredVentasdetallelist = (this.ventasdetallelist || []).filter((item: any) => {
        return (
          (item.docpromotorasesor || '').toLowerCase().includes(searchLowerCase) ||
          (item.numeroorden || '').toLowerCase().includes(searchLowerCase) ||
          (item.idventas?.toString() || '').toLowerCase().includes(searchLowerCase) ||
          (item.idventasdetalle?.toString() || '').toLowerCase().includes(searchLowerCase) ||
          (item.nombresubproducto || '').toLowerCase().includes(searchLowerCase)
        );
      });
    }
  
    // Resetear el paginador a la primera página
    this.paginator?.firstPage();
  
    // Actualizar los valores de `desde` y `hasta`
    this.desde = 0;
    this.hasta = this.pageSize;
  
    console.log('Lista filtrada:', this.filteredVentasdetallelist);
  }


}
