import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { NgSelectModule } from '@ng-select/ng-select';
import { Accesoriotpf } from '../../../../../../../models/entel-tpf/mantenimiento/accesoriotpf';
import { AccesoriotpfService } from '../../../../../../../services/entel-tpf/mantenimientos/accesoriotpf.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-accesoriostpf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    NgSelectModule
  ],
  templateUrl: './accesoriostpf.component.html',
  styleUrl: './accesoriostpf.component.css'
})
export class AccesoriostpfComponent {
  manegementForm: UntypedFormGroup;

  accesoriosList: Accesoriotpf[] = [];
  filteredAccesoriosList: Accesoriotpf[] = [];

  searchTermAccesorio: string = '';

  @ViewChild('paginatorAccesorio') paginatorAccesorio: MatPaginator | null = null;
  pageSizeAccesorio = 10;
  desdeA: number = 0;
  hastaA: number = 10;

  accesorio: Accesoriotpf = new Accesoriotpf();

  usuario: string | null = null;
  idemppaisnegcue: number = 0;

  subtipos: string[] = [];
  categorias: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private accesorioService: AccesoriotpfService,
    private paginatorIntl: MatPaginatorIntl
  ) {
    this.manegementForm = this.createFormTurn();
    this.paginatorIntl.itemsPerPageLabel = "Registros por página: ";
    this.usuario = localStorage.getItem('user');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
  }

  ngOnInit(): void {
    this.limpiarFormulario();
    this.searchTermAccesorio = '';
  }

  createFormTurn(): UntypedFormGroup {
    return this.fb.group({
      description: new FormControl('', Validators.required),
      subtipoaccesorio: new FormControl(Validators.required),
      categoriaaccesorio: new FormControl(Validators.required)
    });
  }

  getManegementForm(tipo: string) {

    const descriptionValue = this.manegementForm.get('description')?.value ? this.manegementForm.get('description')?.value.trim() : null;
    const subtipoaccesorio = this.manegementForm.get('subtipoaccesorio')?.value;
    const categoriaaccesorio = this.manegementForm.get('categoriaaccesorio')?.value;

    if (descriptionValue === null || descriptionValue === '') {
      Swal.fire({
        title: "Respuesta",
        text: "Debe llenar la descripción",
        icon: "error"
      });
      return;
    }

    if (subtipoaccesorio === null) {
      Swal.fire({
        title: "Respuesta",
        text: "Debe Seleccionar Subtipo",
        icon: "error"
      });
      return;
    }

    if (categoriaaccesorio === null) {
      Swal.fire({
        title: "Respuesta",
        text: "Debe Seleccionar Categoria",
        icon: "error"
      });
      return;
    }

    switch (tipo) {
      case 'accesorios':
        const accesorio: Accesoriotpf = {
          nombretipoaccesorio: descriptionValue,
          subtipoaccesorio: subtipoaccesorio,
          categoriaaccesorio: categoriaaccesorio,
          idemppaisnegcue: this.idemppaisnegcue,
          usuariocreacion: this.usuario
        };
        console.log('POST accesorio', accesorio)
        this.accesorioService.postAccesorioRomweb(accesorio).subscribe({
          next: (res) => this.handleApiResponse(res, () => {
            this.limpiarFormulario();
            this.getAccesorioRomWeb(this.idemppaisnegcue);
          }),
          error: () => {
            Swal.fire({
              title: "Respuesta",
              text: "Ocurrió un error con el servidor",
              icon: "error"
            }).then(() => {
              this.getAccesorioRomWeb(this.idemppaisnegcue);
            });
          }
        });
        break;
      default:
        break;
    }

  }

  private handleApiResponse(response: any, callback: () => void) {
    if (response && response.mensaje) {
      const [icono, msj] = response.mensaje.split('/');
      Swal.fire({
        title: "Respuesta",
        text: msj,
        icon: icono as 'success' | 'info' | 'warning' | 'error'
      }).then(() => {
        callback();
      });
    } else {
      Swal.fire({
        title: "Respuesta",
        text: "Ocurrió un error con el servidor",
        icon: "error"
      }).then(() => {
        callback();
      });
    }
  }

  private showErrorToast(message: string) {
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
      title: message
    });
  }

  transformToUpperCase(event: Event): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);

    this.manegementForm.get('description')?.setValue(input.value, { emitEvent: false });
  }

  transformToUpperCaseTable(event: Event, itemrow: any): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    input.value = input.value.toUpperCase();
    input.setSelectionRange(start, end);

    this.manegementForm.get('description')?.setValue(input.value, { emitEvent: false });
  }

  limpiarFormulario() {
    this.manegementForm.reset();
  }

  cambiarpaginaAccesorio(e: PageEvent) {
    this.desdeA = e.pageIndex * e.pageSize;
    this.hastaA = this.desdeA + e.pageSize;
  }

  searchAccesorio() {
    if (!this.searchTermAccesorio.trim()) {
      this.filteredAccesoriosList = this.accesoriosList;
    } else {
      this.filteredAccesoriosList = this.accesoriosList.filter(item =>
        item.nombretipoaccesorio!.toLowerCase().includes(this.searchTermAccesorio.toLowerCase())
      );
    }

    this.desdeA = 0;
    this.hastaA = this.pageSizeAccesorio;
    this.paginatorAccesorio?.firstPage();
  }

  public getAccesorioRomWeb(idemppaisnegcue: number) {
    Swal.fire({
      title: 'Cargando Datos...',
      text: 'Por favor, espere mientras se cargan los datos.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    const idemppaisnegcueDef = idemppaisnegcue === 0 ? this.idemppaisnegcue : idemppaisnegcue;

    this.accesorioService.getAccesorioRomWeb(idemppaisnegcueDef!).subscribe({
      next: (data) => {
        if (data) {
          this.accesoriosList = data;
          this.filteredAccesoriosList = data;

          const dataFilter = data.filter((x:any)=>x.subtipoaccesorio!==null || x.categoriaaccesorio!==null)

          console.log('Accesorio', this.filteredAccesoriosList)
          console.log('Accesorio', dataFilter)

          this.subtipos = Array.from(new Set(dataFilter.map((item: any) => item.subtipoaccesorio)));
          this.categorias = Array.from(new Set(dataFilter.map((item: any) => item.categoriaaccesorio)));

          if (this.paginatorAccesorio) {
            this.paginatorAccesorio.firstPage();
          }
          Swal.close();
        } else {
          this.showErrorToast("Error con el servidor. No se pudo cargar los datos.");
        }
      },
      error: () => {
        this.showErrorToast("Error con el servidor. No se pudo cargar los datos.");
      }
    });
  }

  eliminarAccesorio(item: Accesoriotpf) {
    item.editing = false;
    this.deleteRowAccesorio(item); // Llama al método deleteRow() con los parámetros correspondientes
  }

  deleteRowAccesorio(item: Accesoriotpf) {
    const accesorio: Accesoriotpf = {
      idtipoaccesorio: item.idtipoaccesorio,
      //idaccesorio: item.idaccesorio,
      nombretipoaccesorio: item.nombretipoaccesorio,
      idemppaisnegcue: item.idemppaisnegcue,
      usuariomodificacion: this.usuario
    }

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.\nSi sólo necesita corregir, utilice la función editar en el ícono del lapiz',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        console.log('del accesorio', accesorio)
        this.accesorioService.deleteAccesesorioRomWeb(accesorio).subscribe({
          next: (res) => this.handleApiResponse(res, () => {
            this.limpiarFormulario();
            this.getAccesorioRomWeb(this.idemppaisnegcue);
          }),
          error: () => {
            Swal.fire({
              title: "Respuesta",
              text: "Ocurrió un error con el servidor",
              icon: "error"
            }).then(() => {
              this.getAccesorioRomWeb(this.idemppaisnegcue);
            });
          }
        })
      } else if (result.dismiss) {
        console.log('CANCELADO DELETE ACCESORIO 123');
      }
    });
  }

  enableEditingAccesorio(item: Accesoriotpf) {
    this.filteredAccesoriosList.forEach(t => {
      if (t !== item) {
        t.editing = false; // Desactiva la edición de todos los demás turnos
      }
    });
    item.editing = true; // Activa la edición del turno seleccionado
  }

  saveChangesAccesorio(item: Accesoriotpf) {
    if (!item.nombretipoaccesorio || item.nombretipoaccesorio.trim() === '') {
      Swal.fire({
        title: "Alerta",
        text: "El campo no puede estar vacío",
        icon: "warning"
      });
      item.nombretipoaccesorio = '';
      return;
    }

    if (item.subtipoaccesorio === null) {
      Swal.fire({
        title: "Respuesta",
        text: "Debe Seleccionar Subtipo",
        icon: "error"
      });
      return;
    }

    if (item.categoriaaccesorio === null) {
      Swal.fire({
        title: "Respuesta",
        text: "Debe Seleccionar Categoria",
        icon: "error"
      });
      return;
    }

    item.editing = false;
    // Usa una expresión ternaria para asegurar que trim y toUpperCase se aplican solo si strmodeloequipodesc no es null o undefined
    item.nombretipoaccesorio = item.nombretipoaccesorio
      ? item.nombretipoaccesorio.trim().replace(/\s+/g, ' ').toUpperCase()
      : item.nombretipoaccesorio;
    item.usuariomodificacion = this.usuario;
    console.log('saveChangesAccesorio', item);

    this.accesorioService.postAccesorioRomweb(item).subscribe({
      next: (res) => this.handleApiResponse(res, () => {
        this.limpiarFormulario();
        this.getAccesorioRomWeb(this.idemppaisnegcue);
      }),
      error: () => {
        Swal.fire({
          title: "Respuesta",
          text: "Ocurrió un error con el servidor",
          icon: "error"
        }).then(() => {
          this.getAccesorioRomWeb(this.idemppaisnegcue);
        });
      }
    })
  }

  onDescriptionChangeAccesorio(event: Event, item: Accesoriotpf) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      item.nombretipoaccesorio = inputElement.value.toUpperCase();
    }
  }

  cancelEditingAccesorio(item: Accesoriotpf) {
    item.editing = false;
    console.log('cancelEditingAccesorio', item);
  }
}
