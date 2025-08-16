import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { ModeloEquipo } from '../../../../../../../models/entel-retail/mantenimiento/modelo';
import { ModeloService } from '../../../../../../../services/entel-retail/mantenimientos/modelo.service';
import Swal from 'sweetalert2';
import { NgSelectModule } from '@ng-select/ng-select';

@Component({
  selector: 'app-modelos',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    NgSelectModule
  ],
  templateUrl: './modelos.component.html',
  styleUrl: './modelos.component.css'
})
export class ModelosComponent implements OnInit {
  manegementForm: UntypedFormGroup;
  modelosList: ModeloEquipo[] = [];
  filteredModelosList: ModeloEquipo[] = [];

  searchTermModelo: string = '';

  @ViewChild('paginatorModelo') paginatorModelo: MatPaginator | null = null;
  pageSizeModelo = 10;
  desdeM: number = 0;
  hastaM: number = 10;

  modelo: ModeloEquipo = new ModeloEquipo();

  usuario: string | null = null;
  idemppaisnegcue: number = 0;

  marcas: string[] = [];
  gammas: string[] = [];

  constructor(
    private fb: UntypedFormBuilder,
    private paginatorIntl: MatPaginatorIntl,
    private modeloService: ModeloService
  ) {
    this.manegementForm = this.createFormTurn();
    this.paginatorIntl.itemsPerPageLabel = "Registros por página: ";
    this.usuario = localStorage.getItem('user');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
  }

  ngOnInit(): void {
    this.limpiarFormulario();
    this.searchTermModelo = '';
  }

  createFormTurn(): UntypedFormGroup {
    return this.fb.group({
      description: new FormControl('', Validators.required),
      nombremarca: new FormControl(Validators.required),
      nombregamma: new FormControl(Validators.required)
    });
  }

    getManegementForm(tipo: string) {
      const descriptionValue = this.manegementForm.get('description')?.value ? this.manegementForm.get('description')?.value.trim() : null;
      const nombremarca = this.manegementForm.get('nombremarca')?.value;
      const nombregamma = this.manegementForm.get('nombregamma')?.value;
  
      if (descriptionValue === null || descriptionValue === '') {
        Swal.fire({
          title: "Respuesta",
          text: "Debe llenar la descripción",
          icon: "error"
        });
        return;
      }
  
      if (nombremarca === null) {
        Swal.fire({
          title: "Respuesta",
          text: "Debe Seleccionar Marca",
          icon: "error"
        });
        return;
      }
  
      if (nombregamma === null) {
        Swal.fire({
          title: "Respuesta",
          text: "Debe Seleccionar Gamma",
          icon: "error"
        });
        return;
      }
  
      switch (tipo) {
        case 'modelos':
          const modelo: ModeloEquipo = {
            nombremodelo: descriptionValue,
            nombremarca: nombremarca,
            nombregamma: nombregamma,
            idemppaisnegcue: this.idemppaisnegcue,
            usuariocreacion: this.usuario
          };
          console.log('modeloPOST', modelo)
          this.modeloService.postModeloRomweb(modelo).subscribe({
            next: (res) => this.handleApiResponse(res, () => {
              this.limpiarFormulario();
              this.getModeloRomWeb(this.idemppaisnegcue);
            }),
            error: () => {
              Swal.fire({
                title: "Respuesta",
                text: "Ocurrió un error con el servidor",
                icon: "error"
              }).then(() => {
                this.getModeloRomWeb(this.idemppaisnegcue);
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


  cambiarpaginaModelo(e: PageEvent) {
    this.desdeM = e.pageIndex * e.pageSize;
    this.hastaM = this.desdeM + e.pageSize;
  }

  searchModelo() {
    if (!this.searchTermModelo.trim()) {
      this.filteredModelosList = this.modelosList;
    } else {
      this.filteredModelosList = this.modelosList.filter(item =>
        item.nombremodelo!.toLowerCase().includes(this.searchTermModelo.toLowerCase())
      );
    }

    this.desdeM = 0;
    this.hastaM = this.pageSizeModelo;
    this.paginatorModelo?.firstPage();
  }

  public getModeloRomWeb(idemppaisnegcue?: number) {
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

    this.modeloService.getModeloRomWeb(idemppaisnegcueDef!).subscribe({
      next: (data) => {
        if (data) {
          this.modelosList = data;
          this.filteredModelosList = data;

          // const dataFilter = data.filter((x:any)=>x.nombremarca!==null || x.nombregamma!==null)

          const dataFilter = data.filter((x: any) => x.nombremarca !== null && x.nombregamma !== null);


          console.log('Modelo', this.filteredModelosList)
          console.log('Modelo SIN NULL', dataFilter)

          console.log('gammas',this.gammas)
          this.marcas = Array.from(
            new Set(
              dataFilter
                .map((item: any) => item.nombremarca)
                .filter((marca: any) => marca !== null && marca !== undefined)
            )
          );
          this.gammas = Array.from(
            new Set(
              dataFilter
                .map((item: any) => item.nombregamma)
                .filter((gamma: any) => gamma !== null && gamma !== undefined)
            )
          );

          if (this.paginatorModelo) {
            this.paginatorModelo.firstPage();
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

  eliminarModelo(item: ModeloEquipo) {
    item.editing = false;
    this.deleteRowModelo(item); // Llama al método deleteRow() con los parámetros correspondientes
  }

  deleteRowModelo(item: ModeloEquipo) {

    const modelo: ModeloEquipo = {
      idmodelo: item.idmodelo,
      nombremodelo: item.nombremodelo,
      idemppaisnegcue: this.idemppaisnegcue,
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
        this.modeloService.deleteModeloRomweb(modelo).subscribe({
          next: (res) => this.handleApiResponse(res, () => {
            this.limpiarFormulario();
            this.getModeloRomWeb(this.idemppaisnegcue);
          }),
          error: () => {
            Swal.fire({
              title: "Respuesta",
              text: "Ocurrió un error con el servidor",
              icon: "error"
            }).then(() => {
              this.getModeloRomWeb(this.idemppaisnegcue);
            });
          }
        })
      } else if (result.dismiss) {
        console.log('CANCELADO DELETE MODELO');
      }
    });
  }

  enableEditingModelo(item: ModeloEquipo) {
    this.filteredModelosList.forEach(t => {
      if (t !== item) {
        t.editing = false; // Desactiva la edición de todos los demás turnos
      }
    });
    item.editing = true; // Activa la edición del turno seleccionado
  }

  saveChangesModelo(item: ModeloEquipo) {
    if (!item.nombremodelo || item.nombremodelo.trim() === '') {
      Swal.fire({
        title: "Alerta",
        text: "El campo no puede estar vacío",
        icon: "warning"
      });
      item.nombremodelo = '';
      return;
    }

    // if (item.nombremarca === null) {
    //   Swal.fire({
    //     title: "Respuesta",
    //     text: "Debe Seleccionar Marca",
    //     icon: "error"
    //   });
    //   return;
    // }

    // if (item.nombregamma === null) {
    //   Swal.fire({
    //     title: "Respuesta",
    //     text: "Debe Seleccionar Gamma",
    //     icon: "error"
    //   });
    //   return;
    // }

    item.editing = false;
    // Usa una expresión ternaria para asegurar que trim y toUpperCase se aplican solo si strmodeloequipodesc no es null o undefined
    item.nombremodelo = item.nombremodelo
      ? item.nombremodelo.trim().replace(/\s+/g, ' ').toUpperCase()
      : item.nombremodelo;
    item.usuariomodificacion = this.usuario;
    console.log('saveChangesModelo', item);

    this.modeloService.postModeloRomweb(item).subscribe({
      next: (res) => this.handleApiResponse(res, () => {
        this.limpiarFormulario();
        this.getModeloRomWeb(this.idemppaisnegcue);
      }),
      error: () => {
        Swal.fire({
          title: "Respuesta",
          text: "Ocurrió un error con el servidor",
          icon: "error"
        }).then(() => {
          this.getModeloRomWeb(this.idemppaisnegcue);
        });
      }
    })

  }

  onDescriptionChangeModelo(event: Event, item: ModeloEquipo) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      item.nombremodelo = inputElement.value.toUpperCase();
    }
  }

  cancelEditingModelo(item: ModeloEquipo) {
    item.editing = false;
    console.log('cancelEditingModelo', item);
  }
}
