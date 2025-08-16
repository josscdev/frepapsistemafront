import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule, FormsModule, UntypedFormBuilder, FormGroup, AbstractControl, FormControl, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { provideNativeDateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { OracletpfService } from '../../../../../../services/entel-tpf/inventariotpf/oracletpf.service';
import { AllocationtpfService } from '../../../../../../services/entel-tpf/allocationtpf/allocationtpf.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { FiltroInsertarConciliar, InsertarOracleLogistica, MatchResumenDto } from './models/oracletpf';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { firstValueFrom } from 'rxjs';
import { DetalleConciliaciontpfComponent } from './detalle-conciliaciontpf/detalle-conciliaciontpf.component';

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


@Component({
  selector: 'app-oracletpf',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatDatepickerModule,
    CommonModule,
    MatInputModule,
    FormsModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './oracletpf.component.html',
  styleUrl: './oracletpf.component.css'
})
export class OracletpfComponent {
  //inyecciones
  private readonly _OracleService = inject(OracletpfService);
  private readonly _AllocationService = inject(AllocationtpfService);
  private readonly fb = inject(UntypedFormBuilder);
  private readonly _dialog = inject(MatDialog)

  filtroForm!: FormGroup;
  idemppaisnegcue: number;
  usuario: string;
  perfil: string = "";
  menuString: any;
  filtroTexto: string = '';
  fileName: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  totalPaginas: number = 0;
  totalPaginasArray: number[] = [];
  columnaOrden: string = '';
  direccionOrden: 'asc' | 'desc' = 'asc';

  data: any
  dataOracle: WritableSignal<InsertarOracleLogistica[]> = signal([]);

  // listas
  lTodosConciliaciones: WritableSignal<MatchResumenDto[]> = signal([]);
  lConciliaciones: WritableSignal<MatchResumenDto[]> = signal([]);
  lFiltradaConciliaciones: WritableSignal<MatchResumenDto[]> = signal([]);

  constructor() {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.usuario = (localStorage.getItem('user') || '');
  }

  async ngOnInit() {
    this.filtroForm = this.createForm();
  }

  createForm(): UntypedFormGroup {
    const today = new Date();
    return this.fb.group({
      startDateinv: new FormControl(today, Validators.required),
      endDateinv: new FormControl(today, Validators.required),
      startDateol: new FormControl(today, Validators.required),
      endDateol: new FormControl(today, Validators.required)
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const startInv = group.get('startDateinv')?.value;
    const endInv = group.get('endDateinv')?.value;
    const startOl = group.get('startDateol')?.value;
    const endOl = group.get('endDateol')?.value;

    let invalid = false;

    if (startInv && endInv && endInv < startInv) invalid = true;
    if (startOl && endOl && endOl < startOl) invalid = true;

    return invalid ? { 'dateRangeInvalid': true } : null;
  }

  downloadExcel() {
    const link = document.createElement('a');
    const request = {
      idemppaisnegcue: this.idemppaisnegcue,
      vista: 'oracleLogisticaTpf'
    }
    this._AllocationService
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

  onFileChange(event: any) {
    Swal.fire({
      title: 'Cargando...',
      text: 'Procesando archivo',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length !== 1) throw new Error('No se puede usar múltiples archivos');

      const file = input.files[0];
      this.fileName = file.name; // Guardamos el nombre del archivo seleccionado
      const reader = new FileReader();

      reader.onload = (e: any) => {
        try {
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

          this.dataOracle.set(this.data.map((item: any) => ({
            pdvRom: item['PDV ROM'] ? item['PDV ROM'].toString() : null,
            supervisor: item['SUPERVISOR'] ? item['SUPERVISOR'].toString() : null,
            pareto: item['Pareto / No Pareto'] ? item['Pareto / No Pareto'].toString() : null,
            gestorRom: item['Gestor(a) Rom'] ? item['Gestor(a) Rom'].toString() : null,
            categoria: item['CATEGORIA'] ? item['CATEGORIA'].toString() : null,
            territorio: item['TERRITORIO'] ? item['TERRITORIO'].toString() : null,
            tipoArticulo: item['TIPO ARTICULO'] ? item['TIPO ARTICULO'].toString() : null,
            codigoOracle: item['CODIGO ORACLE'] ? item['CODIGO ORACLE'].toString() : null,
            descripcion: item['DESCRIPCION'] ? item['DESCRIPCION'].toString() : null,
            serieSim: item['SERIE (SIM)'] ? item['SERIE (SIM)'].toString() : null,
            serieFicticio: item['SERIE FICTICIO (IMEI)'] ? item['SERIE FICTICIO (IMEI)'].toString() : null,
            valorizado: item['VALORIZADO S/.'] ? item['VALORIZADO S/.'].toString() : null,
            fechaRecepcion: item['FECHA RECEP'] ? item['FECHA RECEP'].toString() : null,
            statusActual: item['STATUS ACT'] ? item['STATUS ACT'].toString() : null,
            tipoAlmacen: item['TIPO ALM'] ? item['TIPO ALM'].toString() : null,
            diasStock: item['DIA STOCK'] ? item['DIA STOCK'].toString() : null,
            largoSim: item['Largo SIM'] ? item['Largo SIM'].toString() : null,
            largoFicticio: item['Largo Ficticio'] ? item['Largo Ficticio'].toString() : null,
            modeloUnico: item['MODELO UNICO'] ? item['MODELO UNICO'].toString() : null,
            subInventario: item['SUB INV'] ? item['SUB INV'].toString() : null
          })));

          console.log(this.dataOracle());
          Swal.close();
          // Reset the input value to allow re-selection of the same file
          input.value = '';
        } catch (error: any) {
          Swal.close();
          Swal.fire('Error', error.message || 'Error procesando el archivo', 'error');
        }
      };

      reader.onerror = () => {
        Swal.close();
        Swal.fire('Error', 'No se pudo leer el archivo', 'error');
      };

      reader.readAsBinaryString(file);
    } catch (error: any) {
      Swal.close();
      Swal.fire('Error', error.message || 'Error procesando el archivo', 'error');
    }
  }

  guardarOracle() {
    this._OracleService.insertarOracle(this.dataOracle(), this.usuario).subscribe({
      next: (response: any) => {
        if (response.estado === 'Success') {
          Swal.fire({
            icon: 'success',
            title: 'Guardado',
            text: `${this.dataOracle().length} IMEIs registrados correctamente`,
            timer: 1500,
            showConfirmButton: false
          }).then(() => {
          });
        } else if (response.estado === 'Parcial') {
          Swal.fire({
            icon: 'warning',
            title: 'Advertencia',
            text: response.mensaje,
            showConfirmButton: true
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error con el servidor',
            showConfirmButton: true
          });
        }
      },
      error: (err: any) => {
        console.error(err);
        console.log('Error al guardar. Problema con la API');
      }
    })
  }

  async conciliarOracle() {
    if (this.filtroForm.invalid) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, complete todos los campos',
        icon: 'error',
      })
      return
    }

    const data: FiltroInsertarConciliar = {
      fechainicioinv: this.formatDate(this.filtroForm.get('startDateinv')?.value),
      fechafininv: this.formatDate(this.filtroForm.get('endDateinv')?.value),
      fechainiciolog: this.formatDate(this.filtroForm.get('startDateol')?.value),
      fechafinlog: this.formatDate(this.filtroForm.get('endDateol')?.value),
      idemppaisnegcue: this.idemppaisnegcue,
      usuario: this.usuario
    }

    Swal.fire({
      title: 'Cargando...',
      text: 'Procesando archivo',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const response = await firstValueFrom(
        this._OracleService.obtenerConciliacionesAsync(data)
      );
      if (response) {
        console.log(response);
        this.lTodosConciliaciones.set(response);
        const uniqueByNombrePdv = Array.from(
          new Map(response.map((item: MatchResumenDto) => [item.nombrepdv, item])).values()
        ) as MatchResumenDto[];
        this.lConciliaciones.set(uniqueByNombrePdv);
        this.aplicarFiltro();
        console.log(this.lConciliaciones());
        Swal.close();
      } else {
        Swal.close();
        Swal.fire({
          title: 'Error',
          text: 'Hubo un problema con el servidor',
          icon: 'error',
        })
      }
    } catch (error) {
      console.error(error);
      Swal.close();
    } finally {
      console.log('Fin de la lista oracle conciliacion');
    }
  }

  formatDate(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase();

    this.lFiltradaConciliaciones.set(this.lConciliaciones().filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(texto)
      )
    )
    )

    this.paginaActual = 1;
    this.totalPaginas = Math.ceil(this.lFiltradaConciliaciones().length / this.itemsPorPagina);
    this.totalPaginasArray = Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  ordenarPor(campo: string) {
    if (this.columnaOrden === campo) {
      this.direccionOrden = this.direccionOrden === 'asc' ? 'desc' : 'asc';
    } else {
      this.columnaOrden = campo;
      this.direccionOrden = 'asc';
    }

    this.aplicarFiltroOrden(); // Vuelve a filtrar y ordenar con la nueva dirección
  }

  aplicarFiltroOrden() {
    const texto = this.filtroTexto.toLowerCase();

    this.lFiltradaConciliaciones.set(this.lConciliaciones().filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(texto)
      )
    )
    )

    if (this.columnaOrden) {
      this.lFiltradaConciliaciones().sort((a, b) => {
        const valorA = a[this.columnaOrden as keyof MatchResumenDto];
        const valorB = b[this.columnaOrden as keyof MatchResumenDto];

        if (valorA == null) return 1;
        if (valorB == null) return -1;

        if (typeof valorA === 'string') {
          return this.direccionOrden === 'asc'
            ? (valorA as string).localeCompare(valorB as string)
            : (valorB as string).localeCompare(valorA as string);
        } else if (valorA instanceof Date || typeof valorA === 'number') {
          return this.direccionOrden === 'asc'
            ? valorA > valorB ? 1 : -1
            : valorA < valorB ? 1 : -1;
        }

        return 0;
      });
    }

    this.paginaActual = 1;
    this.totalPaginas = Math.ceil(this.lFiltradaConciliaciones().length / this.itemsPorPagina);
    this.totalPaginasArray = Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  paginador() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    console.log('paginador', this.lFiltradaConciliaciones())
    return this.lFiltradaConciliaciones().slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }

  detalleConciliacion(item: any) {

    console.log(item);

    // Filtra los elementos que coinciden con el nombrepdv del item, imeiflagestado 'E' y docpromotorasesor definido
    const listaEncontrados = this.lTodosConciliaciones().filter(
      (match: MatchResumenDto) =>
        match.nombrepdv === item.nombrepdv &&
        match.imeiflagestado === 'E'
    );

    // Filtra los elementos que coinciden con el nombrepdv del item, imeiflagestado 'F' y docpromotorasesor definido
    const listaFaltantes = this.lTodosConciliaciones().filter(
      (match: MatchResumenDto) =>
        match.nombrepdv === item.nombrepdv &&
        match.imeiflagestado === 'F'
    )

    // Filtra los elementos que coinciden con el nombrepdv del item, imeiflagestado 'S' y docpromotorasesor definido
    const listaSobrantes = this.lTodosConciliaciones().filter(
      (match: MatchResumenDto) =>
        match.nombrepdv === item.nombrepdv &&
        match.imeiflagestado === 'S'
    )

    console.log(listaEncontrados);

    const config: MatDialogConfig = {
      data: {
        listaEncontrados: listaEncontrados,
        listaFaltantes: listaFaltantes,
        listaSobrantes: listaSobrantes,
        nombrepdv: item.nombrepdv
      }
    }

    const dialogRef = this._dialog.open(DetalleConciliaciontpfComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      console.log(`Dialog close`);
    })
  }
}
