import { Component } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, Validators } from '@angular/forms';
import { InsertarInventario, InsertarInventarioDetalle, InsertarSoloInventarioDetalle, ListarInventario } from './models/inventariotpf';
import { AuthService } from '../../../../../../services/auth/auth.service';
import { Router } from '@angular/router';
import { InventariotpfService } from '../../../../../../services/entel-tpf/inventariotpf/inventariotpf.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { EditarInventariotpfComponent } from './editar-inventariotpf/editar-inventariotpf.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AsyncPipe, CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginatorModule } from '@angular/material/paginator';
import { SpinnerComponent } from '../../../../../../shared/spinner/spinner.component';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

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
  selector: 'app-inventariotpf',
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
  templateUrl: './inventariotpf.component.html',
  styleUrl: './inventariotpf.component.css'
})
export class InventariotpfComponent {
  filtroForm!: FormGroup;
  desde: number = 0;
  hasta: number = 10;
  idemppaisnegcue: number;
  usuario: string;
  perfil: string = "";
  menuString: any;
  isLoading: boolean = false;
  inventarioList: ListarInventario[] = [];
  filtroTexto: string = '';
  paginaActual: number = 1;
  itemsPorPagina: number = 10;
  listaFiltrada: ListarInventario[] = [];
  totalPaginas: number = 0;
  totalPaginasArray: number[] = [];
  columnaOrden: string = '';
  direccionOrden: 'asc' | 'desc' = 'asc';

  constructor(
    private fb: UntypedFormBuilder,
    private authService: AuthService,
    private router: Router,
    private inventarioService: InventariotpfService, // Cambia esto por el servicio correcto
    private _dialog: MatDialog
  ) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.menuString = (localStorage.getItem('menu') || '');
    this.usuario = (localStorage.getItem('user') || '');

    let menu;
    if (this.menuString) {
      menu = JSON.parse(this.menuString);
      const url = this.router.url;
      const partes = url.split("/");
      const nuevaUrl = partes.slice(2).join("/");
      this.perfil = this.checkUrl(menu, nuevaUrl);
    } else {
      menu = '';
    }

    if (this.perfil === 'ADMIN') {
      const requestPdv = {
        idemppaisnegcue: 0,
        usuario: this.usuario
      };
      this.authService.getIdPdv(requestPdv).subscribe(resPdv => {
        localStorage.setItem('idpdv', resPdv.idpdv);
      });
    }
  }

  ngOnInit() {
    this.filtroForm = this.createForm();
  }

  createForm(): UntypedFormGroup {
    const today = new Date();
    return this.fb.group({
      startDate: new FormControl(today, Validators.required),
      endDate: new FormControl(today, Validators.required),
      docusuario: new FormControl(this.usuario),
      perfil: new FormControl(this.perfil),
      idpdv: new FormControl(localStorage.getItem('idpdv'))
    }, { validators: this.dateRangeValidator });
  }

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('startDate')?.value;
    const end = group.get('endDate')?.value;
    return start && end && end < start ? { 'dateRangeInvalid': true } : null;
  }

  checkUrl(menu: any, requestedPath: string): string {
    if (!menu || !Array.isArray(menu)) return 'No hay menu';

    for (const modulo of menu) {
      if (modulo.rutamodulo === requestedPath) return modulo.nombreperfilmodulo;

      if (modulo.submodules && Array.isArray(modulo.submodules)) {
        for (const submodulo of modulo.submodules) {
          if (submodulo.rutasubmodulo === requestedPath) return submodulo.nombreperfilsubmodulo;

          if (submodulo.items && Array.isArray(submodulo.items)) {
            for (const item of submodulo.items) {
              if (item.rutaitemmodulo === requestedPath) return item.nombreperfilitemmodulo;
            }
          }
        }
      }
    }

    return 'No esta en el menú';
  }

  convertDateFormat(fecha: Date): string {
    const nuevaFecha = new Date(fecha);
    const year = nuevaFecha.getFullYear();
    const month = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const day = String(nuevaFecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  buscar() {
    if (this.filtroForm.invalid) {
      Swal.fire({ icon: 'error', title: 'Error', text: 'Complete los filtros correctamente' });
      return;
    }

    const filtros = {
      idPdv: Number(this.filtroForm.value.idpdv),
      fechaInicio: this.convertDateFormat(this.filtroForm.value.startDate),
      fechaFin: this.convertDateFormat(this.filtroForm.value.endDate),
      docusuario: this.filtroForm.value.docusuario,
      idemppaisnegcue: this.idemppaisnegcue,
      perfil: this.perfil
    };

    this.isLoading = true;

    this.inventarioService.obtenerInventario(filtros).subscribe({
      next: (data) => {
        this.inventarioList = data;
        this.aplicarFiltro();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al obtener inventario:', err);
        this.isLoading = false;
        Swal.fire({ icon: 'error', title: 'Error', text: 'Hubo un problema con el servidor' });
      }
    });
  }

  aplicarFiltroOrden() {
    const texto = this.filtroTexto.toLowerCase();

    this.listaFiltrada = this.inventarioList.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(texto)
      )
    );

    if (this.columnaOrden) {
      this.listaFiltrada.sort((a, b) => {
        const valorA = a[this.columnaOrden as keyof ListarInventario];
        const valorB = b[this.columnaOrden as keyof ListarInventario];

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
    this.totalPaginas = Math.ceil(this.listaFiltrada.length / this.itemsPorPagina);
    this.totalPaginasArray = Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase();

    this.listaFiltrada = this.inventarioList.filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(texto)
      )
    );

    this.paginaActual = 1;
    this.totalPaginas = Math.ceil(this.listaFiltrada.length / this.itemsPorPagina);
    this.totalPaginasArray = Array(this.totalPaginas).fill(0).map((_, i) => i + 1);
  }

  paginador() {
    const inicio = (this.paginaActual - 1) * this.itemsPorPagina;
    const fin = inicio + this.itemsPorPagina;
    return this.listaFiltrada.slice(inicio, fin);
  }

  cambiarPagina(pagina: number) {
    if (pagina >= 1 && pagina <= this.totalPaginas) {
      this.paginaActual = pagina;
    }
  }


  abrir() {
    let imeisTemp: string[] = [];
    // <input id="imei-input" class="swal2-input" maxlength="16" placeholder="Ingrese IMEI" autofocus>

    const renderHtml = () => `
      <input id="imei-input" class="swal2-input" maxlength="16" placeholder="Escanee IMEI" autofocus >

      <div id="imei-error" style="color: red; font-size: 0.9em; margin-top: 5px;"></div>
      <div style="max-height: 200px; overflow-y: auto; margin-top:10px">
        <table class="table table-sm table-bordered">
          <thead>
            <tr><th>#</th><th>IMEI</th></tr>
          </thead>
          <tbody id="imei-table-body">
            ${imeisTemp.map((imei, i) => `<tr><td>${i + 1}</td><td>${imei}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'Registrar IMEIs',
      html: renderHtml(),
      showCancelButton: true,
      confirmButtonText: 'Guardar todos',
      cancelButtonText: 'Cerrar',
      preConfirm: () => {
        if (imeisTemp.length === 0) {
          Swal.showValidationMessage('Debe ingresar al menos un IMEI');
          return false;
        }
        return imeisTemp;
      },
      didOpen: () => {
        const input = document.getElementById('imei-input') as HTMLInputElement;
        const errorDiv = document.getElementById('imei-error') as HTMLDivElement;
        const tbody = document.getElementById('imei-table-body');
        input?.focus();

        let imeisTempLocal = imeisTemp;
        let inputBuffer = '';
        let lastCharTime = 0;
        let scanStartTime = 0;

        input.addEventListener('keydown', (e) => {
          const now = Date.now();

          // Bloquear Enter
          if (e.key === 'Enter') {
            e.preventDefault();
            return;
          }

          // Permitir solo números
          if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            return;
          }

          // Si el usuario es ADMIN, no hacer validación por tiempo
          if (this.perfil === 'ADMIN') {
            inputBuffer += e.key;

            if (inputBuffer.length === 15) {
              const nuevoImei = inputBuffer;
              inputBuffer = '';

              if (imeisTempLocal.includes(nuevoImei)) {
                errorDiv.textContent = `El IMEI ${nuevoImei} ya fue registrado.`;
                setTimeout(() => input.value = '', 0);
                return;
              }

              imeisTempLocal.push(nuevoImei);
              errorDiv.textContent = '';

              const row = document.createElement('tr');
              row.innerHTML = `<td>${imeisTempLocal.length}</td><td>${nuevoImei}</td>`;
              tbody?.appendChild(row);

              setTimeout(() => input.value = '', 0);
            }

            return;
          }

          // Lógica para usuarios NO ADMIN
          if (inputBuffer.length === 0) {
            scanStartTime = now;
          }

          if (now - lastCharTime > 50) {
            inputBuffer = '';
            scanStartTime = now;
          }

          lastCharTime = now;
          inputBuffer += e.key;

          if (inputBuffer.length === 15) {
            const totalTime = now - scanStartTime;

            if (totalTime > 400) {
              errorDiv.textContent = 'Entrada rechazada. Use un lector de IMEI.';
              inputBuffer = '';
              setTimeout(() => input.value = '', 0);
              return;
            }

            const nuevoImei = inputBuffer;
            inputBuffer = '';

            if (imeisTempLocal.includes(nuevoImei)) {
              errorDiv.textContent = `El IMEI ${nuevoImei} ya fue registrado.`;
              setTimeout(() => input.value = '', 0);
              return;
            }

            imeisTempLocal.push(nuevoImei);
            errorDiv.textContent = '';

            const row = document.createElement('tr');
            row.innerHTML = `<td>${imeisTempLocal.length}</td><td>${nuevoImei}</td>`;
            tbody?.appendChild(row);
          }

          setTimeout(() => input.value = '', 0);
        });
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        //const fechaActual = new Date();
        const registrosInventario: InsertarInventarioDetalle[] = result.value.map((imei: string) => ({
          imeiequipo: imei,
          idemppaisnegcue: this.idemppaisnegcue,
          usuario: this.usuario,
        }));

        const data: InsertarInventario = {
          docpromotorasesor: this.filtroForm.get('docusuario')?.value || null,
          idpdv: Number(localStorage.getItem('idpdv')),
          idemppaisnegcue: this.idemppaisnegcue,
          usuario: this.usuario,
          detalles: registrosInventario
        }


        this.inventarioService.registrarInventario(data).subscribe({
          next: (response) => {
            if (response.estado === 'Success') {
              Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: `${registrosInventario.length} IMEIs registrados correctamente`,
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                this.buscar();
              });
            } else if (response.estado === 'Parcial') {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: String(response.mensaje),
                showConfirmButton: true
              }).then(() => {
                this.buscar();
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
          error: (err) => {
            console.error('Error al registrar inventario:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema con el servidor'
            });
          }
        });
      }
    });
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

  conciliar(idiventario: number) {
    let imeisTemp: string[] = [];
    // <input id="imei-input" class="swal2-input" maxlength="16" placeholder="Ingrese IMEI" autofocus>

    const renderHtml = () => `
      <input id="imei-input" class="swal2-input" maxlength="16" placeholder="Escanee IMEI" autofocus >
      
      <div id="imei-error" style="color: red; font-size: 0.9em; margin-top: 5px;"></div>
      <div style="max-height: 200px; overflow-y: auto; margin-top:10px">
        <table class="table table-sm table-bordered">
          <thead>
            <tr><th>#</th><th>IMEI</th></tr>
          </thead>
          <tbody id="imei-table-body">
            ${imeisTemp.map((imei, i) => `<tr><td>${i + 1}</td><td>${imei}</td></tr>`).join('')}
          </tbody>
        </table>
      </div>
    `;

    Swal.fire({
      title: 'Agregar IMEIs',
      html: renderHtml(),
      showCancelButton: true,
      confirmButtonText: 'Guardar todos',
      cancelButtonText: 'Cerrar',
      preConfirm: () => {
        if (imeisTemp.length === 0) {
          Swal.showValidationMessage('Debe ingresar al menos un IMEI');
          return false;
        }
        return imeisTemp;
      },
      didOpen: () => {
        const input = document.getElementById('imei-input') as HTMLInputElement;
        const errorDiv = document.getElementById('imei-error') as HTMLDivElement;
        const tbody = document.getElementById('imei-table-body');
        input?.focus();

        let imeisTempLocal = imeisTemp;
        let inputBuffer = '';
        let lastCharTime = 0;
        let scanStartTime = 0;

        input.addEventListener('keydown', (e) => {
          const now = Date.now();

          // Bloquear Enter
          if (e.key === 'Enter') {
            e.preventDefault();
            return;
          }

          // Permitir solo números
          if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
            e.preventDefault();
            return;
          }

          // Si el usuario es ADMIN, no hacer validación por tiempo
          if (this.perfil === 'ADMIN') {
            inputBuffer += e.key;

            if (inputBuffer.length === 15) {
              const nuevoImei = inputBuffer;
              inputBuffer = '';

              if (imeisTempLocal.includes(nuevoImei)) {
                errorDiv.textContent = `El IMEI ${nuevoImei} ya fue registrado.`;
                setTimeout(() => input.value = '', 0);
                return;
              }

              imeisTempLocal.push(nuevoImei);
              errorDiv.textContent = '';

              const row = document.createElement('tr');
              row.innerHTML = `<td>${imeisTempLocal.length}</td><td>${nuevoImei}</td>`;
              tbody?.appendChild(row);

              setTimeout(() => input.value = '', 0);
            }

            return;
          }

          // Lógica para usuarios NO ADMIN
          if (inputBuffer.length === 0) {
            scanStartTime = now;
          }

          if (now - lastCharTime > 50) {
            inputBuffer = '';
            scanStartTime = now;
          }

          lastCharTime = now;
          inputBuffer += e.key;

          if (inputBuffer.length === 15) {
            const totalTime = now - scanStartTime;

            if (totalTime > 400) {
              errorDiv.textContent = 'Entrada rechazada. Use un lector de IMEI.';
              inputBuffer = '';
              setTimeout(() => input.value = '', 0);
              return;
            }

            const nuevoImei = inputBuffer;
            inputBuffer = '';

            if (imeisTempLocal.includes(nuevoImei)) {
              errorDiv.textContent = `El IMEI ${nuevoImei} ya fue registrado.`;
              setTimeout(() => input.value = '', 0);
              return;
            }

            imeisTempLocal.push(nuevoImei);
            errorDiv.textContent = '';

            const row = document.createElement('tr');
            row.innerHTML = `<td>${imeisTempLocal.length}</td><td>${nuevoImei}</td>`;
            tbody?.appendChild(row);
          }

          setTimeout(() => input.value = '', 0);
        });
      }
    }).then(result => {
      if (result.isConfirmed && result.value) {
        //const fechaActual = new Date();
        const registrosInventario: InsertarInventarioDetalle[] = result.value.map((imei: string) => ({
          imeiequipo: imei,
          idemppaisnegcue: this.idemppaisnegcue,
          usuario: this.usuario,
        }));

        const data: InsertarSoloInventarioDetalle = {
          idinventario: idiventario,
          usuario: this.usuario,
          detalles: registrosInventario
        }

        this.inventarioService.registrarInventarioDetalle(data).subscribe({
          next: (response) => {
            if (response.estado === 'Success') {
              Swal.fire({
                icon: 'success',
                title: 'Guardado',
                text: `${registrosInventario.length} IMEIs registrados correctamente`,
                timer: 1500,
                showConfirmButton: false
              }).then(() => {
                this.buscar();
              });
            } else if (response.estado === 'Parcial') {
              Swal.fire({
                icon: 'warning',
                title: 'Advertencia',
                text: response.mensaje,
                showConfirmButton: true
              }).then(() => {
                this.buscar();
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
          error: (err) => {
            console.error('Error al registrar inventario:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema con el servidor'
            });
          }
        });
      }
    });
  }

  editarInventario(item: ListarInventario) {
    const config: MatDialogConfig = {
      maxWidth: '900px',
      disableClose: true,
      data: {
        idinventario: item.idinventario,
        nombrepromotor: item.nombrecompleto,
        nombrepdv: item.nombrepdv,
        docpromotorasesor: item.docpromotorasesor,
      }
    }

    const dialogRef = this._dialog.open(EditarInventariotpfComponent, config);

    dialogRef.afterClosed().subscribe(result => {
      this.buscar();
    });
  }

  eliminarInventario(idinventario: number) {
    Swal.fire({
      title: '¿Estás seguro de eliminar el inventario registrado?',
      showCancelButton: true,
      confirmButtonText: `Eliminar`,
      confirmButtonColor: '#d33',
      cancelButtonText: 'Cancelar',
      cancelButtonColor: '#3085d6',
    }).then((result) => {
      if (result.isConfirmed) {
        this.inventarioService.deleteInventario(idinventario, this.usuario).subscribe({
          next: () => {
            Swal.fire({
              icon: 'success',
              title: 'Eliminado',
              text: 'El inventario fue eliminado correctamente',
              timer: 1500,
              showConfirmButton: false
            }).then(() => {
              this.buscar();
            });
          },
          error: (err) => {
            console.error('Error al eliminar inventario:', err);
            Swal.fire({
              icon: 'error',
              title: 'Error',
              text: 'Hubo un problema con el servidor'
            });
          }
        })
      }
    });
  }

}
