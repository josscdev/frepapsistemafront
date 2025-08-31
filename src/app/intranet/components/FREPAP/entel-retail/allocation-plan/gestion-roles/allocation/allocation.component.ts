import { Component, inject, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import {
  MatDialog,
} from '@angular/material/dialog';
import { EditarAllocationComponent } from './editar-allocation/editar-allocation.component';
import { AllocationService } from '../../../../../../services/entel-retail/allocation-plan/allocation.service';
import { Allocation } from '../../../../../../models/entel-retail/allocation-plan/allocation';
import { CommonModule } from '@angular/common';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import { forkJoin, map } from 'rxjs';

@Component({
  selector: 'app-allocation',
  standalone: true,
  imports: [
    CommonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './allocation.component.html',
  styleUrl: './allocation.component.css'
})
export class AllocationComponent implements OnInit {
  @ViewChild('paginator') paginator?: MatPaginator;
  readonly dialog = inject(MatDialog);
  perfil: string = "";

  allocationList: Allocation[] = []
  filteredAllocationList: Allocation[] = []

  searchTerm: string = ''; // Término de búsqueda vinculado al input

  pageSize = 20

  desde: number = 0;
  hasta: number = 20;

  mes: string = '';

  data: any[] = [];
  dataAllocation: any[] = [];
  usuario: string;
  idemppaisnegcue: number;

  fileName: string = '';
  errorMessage: any;

  today = new Date();
  numeroMes: number = 0;

  menuString: any;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  periodo: string = '';
  selectedButton: string = '';

  puntosDeVentaPorPromotor: {
    docusuario: string;
    nombres: string;
    puntosDeVenta: { idpdv: number; nombrepdv: string; fechainicio: string; fechafin: string; idtipolicencia: number; nombretipolicencia: string }[];
  }[] = []; // Resultados combinados

  filteredPuntosDeVentaPorPromotor: typeof this.puntosDeVentaPorPromotor = [];

  openEdit(allocation: any): void {
    console.log('this.numeroMes', this.numeroMes)
    const dialogRefedit = this.dialog.open(EditarAllocationComponent, {
      data: { titulo: 'Editar Rol', allocationData: allocation, numMes: this.numeroMes, perfil: this.perfil },
      height: '95%',
      width: '80%'
    });
    dialogRefedit.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
      //console.log('epriodo edit fin', this.periodo)
      const periodo = (localStorage.getItem('periodo') || '');
      console.log('epriodo edit fin', periodo)
      this.getAllRolPromotor(periodo);
    });
  }

  constructor(
    private fb: UntypedFormBuilder,
    private allocationService: AllocationService,
    private router: Router
  ) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.periodo = (localStorage.getItem('periodo') || '');
    this.usuario = (localStorage.getItem('user') || '');
    this.menuString = (localStorage.getItem('menu') || '');

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


    this.getAllRolPromotor('ACT');
  }

  ngOnInit(): void {

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

  // downloadExcel() {
  //   const link = document.createElement('a');
  //   link.href = 'assets/documents/excel/formatoRolEntelRetailRom.xlsx';
  //   link.download = 'formatoRolEntelRetailRom.xlsx';
  //   link.click();
  // }

  downloadExcel() {
    const link = document.createElement('a');
    const request = {
      idemppaisnegcue: this.idemppaisnegcue,
      vista: 'allocationRetail'
    }
    this.allocationService
    .getNombreExcel
    (request.idemppaisnegcue,
    request.vista).subscribe({
      next: (response) => {
        console.log('Respuesta del API:', response);
        link.href = 'assets/documents/excel/' + response.nombrearchivo + '.xlsx';
        link.download = response.nombrearchivo + '.xlsx';
        link.click();
      },
      error: (error) => {
        console.error('Error al obtener el nombre del Excel:', error);
      }
    })
  }


  selectButton(button: string) {
    this.selectedButton = button;
    this.getAllRolPromotor(button);
  }

  getAllRolPromotor(periodo: string) {
    this.searchTerm = '';
    this.allocationList = [];
    this.filteredAllocationList = [];
    this.puntosDeVentaPorPromotor = [];
    this.filteredPuntosDeVentaPorPromotor = [];

    if (periodo === 'ANT') {
      this.numeroMes = (this.today.getMonth() - 1 + 12) % 12;
      console.log('numeroMes', this.numeroMes);
      this.mes = this.meses[this.numeroMes];
      console.log('mes', this.mes);
      localStorage.setItem('periodo', periodo)

    } else if (periodo === 'ACT') {
      this.numeroMes = this.today.getMonth();
      console.log('numeroMes', this.numeroMes);
      this.mes = this.meses[this.numeroMes];
      console.log('mes', this.mes);
      localStorage.setItem('periodo', periodo)

    } else if (periodo === 'POST') {
      this.numeroMes = (this.today.getMonth() + 1) % 12;
      console.log('numeroMes', this.numeroMes);
      this.mes = this.meses[this.numeroMes];
      console.log('mes', this.mes);
      localStorage.setItem('periodo', periodo)
    } else if (periodo === 'POST-1') {
      this.numeroMes = (this.today.getMonth() + 2) % 12;
      console.log('numeroMes', this.numeroMes);
      this.mes = this.meses[this.numeroMes];
      console.log('mes', this.mes);
      localStorage.setItem('periodo', periodo)
    }

    this.periodo = (localStorage.getItem('periodo') || '');

    const request = {
      usuario: this.usuario,
      idemppaisnegcue: this.idemppaisnegcue,
      tipoperiodo: periodo
    }
    this.allocationService
      .getAllRolPromotor(request.usuario, request.idemppaisnegcue, request.tipoperiodo)
      .subscribe((res) => {
        if (res?.length) {
          this.allocationList = res;
          this.filteredAllocationList = res;

          // Realizar peticiones de puntos de venta
          const peticiones = res.map((promotor: any) =>
            this.allocationService.getRolUsuarioPDV(promotor.docusuario, this.idemppaisnegcue, periodo).pipe(
              map((puntosDeVenta) => ({
                docusuario: promotor.docusuario,
                nombres: promotor.nombres,
                puntosDeVenta: puntosDeVenta.map((pdv: any) => ({
                  idpdv: pdv.idpdv,
                  nombrepdv: pdv.nombrepdv,
                  fechainicio: this.formatDate(new Date(pdv.fechainicio)),
                  fechafin: this.formatDate(new Date(pdv.fechafin)),
                  idtipolicencia: pdv.idtipolicencia,
                  nombretipolicencia: pdv.nombretipolicencia
                })),
              }))
            )
          );

          // Ejecutar todas las peticiones y almacenar los resultados
          forkJoin(peticiones).subscribe((resultados: any) => {
            this.puntosDeVentaPorPromotor = resultados;
            this.filteredPuntosDeVentaPorPromotor = resultados;
            console.log('Datos cargados:', this.puntosDeVentaPorPromotor);
          });
        } else {
          console.log('No se encontraron registros.');
        }
      });
  }

  getClaseLicencia(tipo: string): string {
    switch (tipo?.toUpperCase()) {
      case 'ACTIVO':
        return 'bg-success text-white';
      case 'CESE':
        return 'bg-gray';
      case 'SUSPENSION':
        return 'bg-warning';
      default:
        return 'custom-badge';
    }
  }

  cambiarpagina(e: PageEvent) {
    //console.log(e, 'first');
    this.desde = e.pageIndex * e.pageSize;
    this.hasta = this.desde + e.pageSize;
  }

  search() {
    if (!this.searchTerm.trim()) {
      // Si el término de búsqueda está vacío, no filtre.
      this.filteredPuntosDeVentaPorPromotor = this.puntosDeVentaPorPromotor;
    } else {
      const searchTermLower = this.searchTerm.toLowerCase();

      this.filteredPuntosDeVentaPorPromotor = this.puntosDeVentaPorPromotor.filter((item) => {
        // Comprueba documento y nombre del promotor
        const matchesPromotor =
          item.docusuario.toLowerCase().includes(searchTermLower) ||
          item.nombres.toLowerCase().includes(searchTermLower);

        // Comprueba los puntos de venta asociados
        const matchesPuntosDeVenta = item.puntosDeVenta.some((pdv) =>
          pdv.nombrepdv.toLowerCase().includes(searchTermLower) || pdv.nombretipolicencia.toLowerCase().includes(searchTermLower)
        );

        return matchesPromotor || matchesPuntosDeVenta;
      });
    }

    // Resetear el paginador a la primera página
    this.paginator?.firstPage();

    // Actualizar los valores de `desde` y `hasta`
    this.desde = 0;
    this.hasta = this.pageSize;
  }

  onFileChange(event: any) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length !== 1) throw new Error('No se puede usar múltiples archivos');

    const file = input.files[0];
    this.fileName = file.name; // Guardamos el nombre del archivo seleccionado
    const reader = new FileReader();

    reader.onload = (e: any) => {
      const bstr: string = e.target.result;
      const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });

      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });

      if (data.length === 0) {
        throw new Error('La hoja está vacía');
      }

      const headers: string[] = data[0] as string[];

      this.data = data.slice(1).map((row: any) => {
        const obj: any = {};
        headers.forEach((header: string, index: number) => {
          obj[header] = row[index] !== undefined ? row[index].toString() : null;
        });
        return obj;
      }).filter(row => Object.values(row).some(value => value !== null));

      // Parse dates and validate
      this.dataAllocation = this.data.map(item => ({
        docusuario: item['DOCPROMOTOR'] ? item['DOCPROMOTOR'].toString() : '',
        nombrepdv: item['PUNTOVENTA'] ? item['PUNTOVENTA'].toString() : '',
        fechainicio: item['FECHAINICIO'] ? this.parseDate(item['FECHAINICIO']) : null,
        fechafin: item['FECHAFIN'] ? this.parseDate(item['FECHAFIN']) : null,
        usuarioredtde: item['USUARIO_RED_TDE'] ? item['USUARIO_RED_TDE'].toString() : '',
        usuarioportal: item['USUARIO_PORTAL'] ? item['USUARIO_PORTAL'].toString() : '',
        referente: item['REFERENTE'] ? item['REFERENTE'].toString() : '',
        idtipolicencia: item['IDTIPOLICENCIA'] ? Number(item['IDTIPOLICENCIA']) : null,
        observacionlicencia: item['OBSERVACION_LICENCIA'] ? item['OBSERVACION_LICENCIA'].toString() : '',
        idtipoestado: item['IDTIPOESTADO'] ? Number(item['IDTIPOESTADO']) : null,
        idtipofuncionalidad: item['IDTIPOFUNCIONALIDAD'] ? Number(item['IDTIPOFUNCIONALIDAD']) : null,
        idtipotrabajo: item['IDTIPOTRABAJO'] ? Number(item['IDTIPOTRABAJO']) : null,
        idemppaisnegcue: this.idemppaisnegcue,
        estado: 1,
        usuariocreacion: this.usuario
      }));

      const errorMessages: string[] = [];
      const isValid = this.validateData(this.dataAllocation, errorMessages, this.periodo);

      if (!isValid) {
        this.displayErrors(errorMessages);
        // Restablecer el nombre del archivo si hay errores
        this.fileName = '';
      } else {

        console.log(this.data);
        console.log(this.dataAllocation);
      }

      // Reset the input value to allow re-selection of the same file
      input.value = '';
    };

    reader.readAsBinaryString(file);
  }

  parseDate(dateStr: string): Date {
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  // validateData(data: any[], errorMessages: string[]): boolean {
  //   const dateOverlap = (startDate1: Date, endDate1: Date, startDate2: Date, endDate2: Date): boolean => {
  //     return (startDate1 <= endDate2) && (startDate2 <= endDate1);
  //   };

  //   const docusuarioMap = new Map<string, any[]>();
  //   const currentYear = new Date().getFullYear(); // Obtiene el año actual
  //   //const currentMonth = new Date().getMonth() + 1; // Obtiene el mes actual (0-11 a 1-12)

  //   for (let item of data) {
  //     // Validar fechainicio
  //     const fechainicio = item.fechainicio;
  //     const fechafin = item.fechafin;

  //     // Validaciones para fechainicio
  //     if (fechainicio) {
  //       const day = fechainicio.getDate();
  //       const month = fechainicio.getMonth(); // Ajuste de índice (0-11 a 1-12)
  //       const year = fechainicio.getFullYear();

  //       if (day <= 0 || day > 31) {
  //         errorMessages.push(`El día de fechainicio para docusuario ${item.docusuario} es inválido: ${day}`);
  //       }

  //       if (month !== this.numeroMes) { // Validación del mes actual

  //         errorMessages.push(`El mes de fechainicio para docusuario ${item.docusuario} debe ser el mes: ${this.mes}(${this.numeroMes+1})`);
  //       }

  //       if (year !== currentYear) {
  //         errorMessages.push(`El año de fechainicio para docusuario ${item.docusuario} debe ser el año actual: ${year}`);
  //       }
  //     }

  //     // Validaciones para fechafin
  //     if (fechafin) {
  //       const day = fechafin.getDate();
  //       const month = fechafin.getMonth() + 1; // Ajuste de índice (0-11 a 1-12)
  //       const year = fechafin.getFullYear();

  //       if (day <= 0 || day > 31) {
  //         errorMessages.push(`El día de fechafin para docusuario ${item.docusuario} es inválido: ${day}`);
  //       }

  //       if (month !== this.numeroMes) { // Validación del mes actual
  //         errorMessages.push(`El mes de fechafin para docusuario ${item.docusuario} debe ser el mes: ${this.mes}(${this.numeroMes+1})`);
  //       }

  //       if (year !== currentYear) {
  //         errorMessages.push(`El año de fechafin para docusuario ${item.docusuario} debe ser el año actual: ${year}`);
  //       }
  //     }

  //     // Validar que fechafin no sea menor que fechainicio
  //     if (fechainicio && fechafin && fechafin < fechainicio) {
  //       errorMessages.push(`La fechafin para docusuario ${item.docusuario} no puede ser menor que la fechainicio`);
  //     }

  //     // Validaciones existentes
  //     if (!docusuarioMap.has(item.docusuario)) {
  //       docusuarioMap.set(item.docusuario, []);
  //     }
  //     const entries = docusuarioMap.get(item.docusuario)!;

  //     for (let entry of entries) {
  //       // Check for date duplication by docusuario and puntoventa
  //       if (entry.puntoventa === item.puntoventa &&
  //         entry.fechainicio.getTime() === item.fechainicio.getTime() &&
  //         entry.fechafin.getTime() === item.fechafin.getTime()) {
  //         errorMessages.push(`Fecha duplicada para docusuario ${item.docusuario} y puntoventa ${item.puntoventa}`);
  //       }
  //       // Check for date overlap by docusuario
  //       if (dateOverlap(entry.fechainicio, entry.fechafin, item.fechainicio, item.fechafin)) {
  //         errorMessages.push(`Fechas solapadas para docusuario ${item.docusuario}`);
  //       }
  //     }
  //     entries.push(item);
  //   }

  //   return errorMessages.length === 0;
  // }

  validateData(data: any[], errorMessages: string[], periodo: string): boolean {
    const dateOverlap = (startDate1: Date, endDate1: Date, startDate2: Date, endDate2: Date): boolean => {
      return (startDate1 <= endDate2) && (startDate2 <= endDate1);
    };
  
    const docusuarioMap = new Map<string, any[]>();
    const currentYear = new Date().getFullYear(); // Obtiene el año actual
    const currentMonth = new Date().getMonth(); // Obtiene el mes actual (0-11)
  
    let numeroMes: number;
    let selectedYear: number;
    
    switch (periodo) {
      case 'ANT':
        numeroMes = (currentMonth + 11) % 12; // Mes anterior
        selectedYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        break;
      case 'ACT':
        numeroMes = currentMonth; // Mes actual
        selectedYear = currentYear;
        break;
      case 'POST':
        numeroMes = (currentMonth + 1) % 12; // Mes siguiente
        selectedYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        break;
      case 'POST-1':
        numeroMes = (currentMonth + 2) % 12; // Dos meses siguientes
        selectedYear = currentMonth >= 10 ? currentYear + 1 : currentYear;
        break;
      default:
        errorMessages.push(`Periodo desconocido: ${periodo}`);
        return false;
    }
  
    for (let item of data) {
      // Validar fechainicio
      const fechainicio = new Date(item.fechainicio);
      const fechafin = new Date(item.fechafin);
  
      if (fechainicio && fechafin) {
        const startDay = fechainicio.getDate();
        const startMonth = fechainicio.getMonth() + 1; // Mes ajustado (1-12)
        const startYear = fechainicio.getFullYear();
  
        const endDay = fechafin.getDate();
        const endMonth = fechafin.getMonth() + 1; // Mes ajustado (1-12)
        const endYear = fechafin.getFullYear();
  
        if (startDay <= 0 || startDay > 31) {
          errorMessages.push(`El día de fechainicio para docusuario ${item.docusuario} es inválido: ${startDay}`);
        }
  
        if (endDay <= 0 || endDay > 31) {
          errorMessages.push(`El día de fechafin para docusuario ${item.docusuario} es inválido: ${endDay}`);
        }
  
        // Validar que las fechas estén en el mismo mes y año
        if (startMonth !== endMonth || startYear !== endYear) {
          errorMessages.push(`Las fechas de fechainicio y fechafin para docusuario ${item.docusuario} deben estar en el mismo mes y año`);
        }
  
        // Validar el mes y año según el periodo seleccionado
        const validStartMonth = (selectedYear === startYear && startMonth === numeroMes + 1) ||
                                (selectedYear === startYear + 1 && numeroMes === 11 && startMonth === 1);
  
        const validEndMonth = (selectedYear === endYear && endMonth === numeroMes + 1) ||
                              (selectedYear === endYear + 1 && numeroMes === 11 && endMonth === 1);
  
        if (!validStartMonth || !validEndMonth) {
          errorMessages.push(`Las fechas para docusuario ${item.docusuario} deben corresponder a: ${this.meses[numeroMes]} del año ${selectedYear}`);
        }
  
        // Validar que fechafin no sea menor que fechainicio
        if (fechafin < fechainicio) {
          errorMessages.push(`La fechafin para docusuario ${item.docusuario} no puede ser menor que la fechainicio`);
        }
      }
  
      // Validaciones existentes
      if (!docusuarioMap.has(item.docusuario)) {
        docusuarioMap.set(item.docusuario, []);
      }
      const entries = docusuarioMap.get(item.docusuario)!;
  
      for (let entry of entries) {
        // Check for date duplication by docusuario and puntoventa
        if (entry.puntoventa === item.puntoventa &&
            entry.fechainicio.getTime() === item.fechainicio.getTime() &&
            entry.fechafin.getTime() === item.fechafin.getTime()) {
          errorMessages.push(`Fecha duplicada para docusuario ${item.docusuario} y puntoventa ${item.puntoventa}`);
        }
        // Check for date overlap by docusuario
        if (dateOverlap(entry.fechainicio, entry.fechafin, item.fechainicio, item.fechafin)) {
          errorMessages.push(`Fechas solapadas para docusuario ${item.docusuario}`);
        }
      }
      entries.push(item);
    }
  
    return errorMessages.length === 0;
  }

  displayErrors(errorMessages: string[]) {
    errorMessages.forEach(message => console.error(message));

    // Crear una lista HTML de mensajes de error
    const htmlErrorList = errorMessages.map(message => `<li>${message}</li>`).join('');
    const errorMessageHtml = `<ul>${htmlErrorList}</ul>`;

    Swal.fire({
      icon: "error",
      title: "Errores",
      html: errorMessageHtml,
      confirmButtonText: "OK"
    });
  }

  guardarRoles() {
    console.log('guardarROL: ', this.dataAllocation);
    this.allocationService.postRoles(this.dataAllocation).subscribe(res => {
      console.log('RES ROLES:', res);

      if (res) {
        // Crear una lista de mensajes con íconos
        const messagesWithIcons = res.map((item: any) => {
          const icon = item.success
            ? '<i class="bi bi-check-circle" style="color: green;"></i>'
            : '<i class="bi bi-x-circle" style="color: red;"></i>';
          return `${icon} ${item.message}`; // Combina el ícono con el mensaje
        });
        this.displayMessages(messagesWithIcons);
        const periodo = (localStorage.getItem('periodo') || '');
        this.getAllRolPromotor(periodo);

      } else {
        this.data = [];
        this.dataAllocation = [];
        console.log('POST ROLES:', res);
      }
    }, err => {
      console.error('Error en la petición:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error en la petición',
        text: 'Ocurrió un error al enviar la solicitud. Por favor, inténtelo de nuevo más tarde.',
        confirmButtonText: 'OK'
      });
    });
  }

  displayMessages(messages: string[]) {
    messages.forEach(message => console.error(message));

    // Crear una lista HTML de mensajes con íconos
    const htmlMsgList = messages.map(message => `<p>${message}</p>`).join('');

    Swal.fire({
      title: "Mensajes",
      html: htmlMsgList,
      confirmButtonText: "OK"
    });
  }

}
