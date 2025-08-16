import { CommonModule } from '@angular/common';
import { Component, ViewChild, OnInit } from '@angular/core';
import { FormControl, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { AccesorioService } from '../../../../../../services/entel-retail/mantenimientos/accesorio.service';
import { ModeloService } from '../../../../../../services/entel-retail/mantenimientos/modelo.service';
import { ModeloEquipo } from '../../../../../../models/entel-retail/mantenimiento/modelo';
import { Accesorio } from '../../../../../../models/entel-retail/mantenimiento/accesorio';
import { MatPaginator, MatPaginatorModule, PageEvent, MatPaginatorIntl } from '@angular/material/paginator';
import Swal from 'sweetalert2';
import { ModelosComponent } from './modelos/modelos.component';
import { AccesoriosComponent } from './accesorios/accesorios.component';

@Component({
  selector: 'app-formulario-ventas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    ModelosComponent,
    AccesoriosComponent
  ],
  templateUrl: './formulario-ventas.component.html',
  styleUrls: ['./formulario-ventas.component.css'],
})
export class FormularioVentasComponent implements OnInit {
  @ViewChild(ModelosComponent) modelosComponent!: ModelosComponent;
  @ViewChild(AccesoriosComponent) accesoriosComponent!: AccesoriosComponent;

  // manegementForm: UntypedFormGroup;

  tipo: string = '';
  activeButton: string | null = null;

  // modelosList: ModeloEquipo[] = [];
  // filteredModelosList: ModeloEquipo[] = [];
  // accesoriosList: Accesorio[] = [];
  // filteredAccesoriosList: Accesorio[] = [];

  // searchTermModelo: string = '';
  // searchTermAccesorio: string = '';

  // @ViewChild('paginatorModelo') paginatorModelo: MatPaginator | null = null;
  // pageSizeModelo = 10;
  // desdeM: number = 0;
  // hastaM: number = 10;

  // @ViewChild('paginatorAccesorio') paginatorAccesorio: MatPaginator | null = null;
  // pageSizeAccesorio = 10;
  // desdeA: number = 0;
  // hastaA: number = 10;

  // modelo: ModeloEquipo = new ModeloEquipo();
  // accesorio: Accesorio = new Accesorio();

  titleColor: string = 'text-black'; // Color predeterminado

  usuario: string | null = null;

  idemppaisnegcue: number = 0;

  constructor(
    private fb: UntypedFormBuilder,
    private accesorioService: AccesorioService,
    private modeloService: ModeloService,
    private paginatorIntl: MatPaginatorIntl
  ) {
    // this.manegementForm = this.createFormTurn();
    this.paginatorIntl.itemsPerPageLabel = "Registros por página: ";
    this.usuario = localStorage.getItem('user');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
  }

  ngOnInit(): void { }

  setActiveButton(buttonType: string) {
    // this.limpiarFormulario();

    this.activeButton = buttonType;
    if (buttonType === 'modelos') {
      this.tipo = 'Modelos';
      setTimeout(() => {
        if (this.modelosComponent) {
          console.log('Entra Modelos');
          this.modelosComponent.getModeloRomWeb(this.idemppaisnegcue);
        }
      }, 0); // Retraso mínimo para permitir la inicialización del componente
      //this.getModeloRomWeb();
      this.titleColor = 'text-modelo'; // Color del título para "modelos"
    } else if (buttonType === 'accesorios') {
      this.tipo = 'Accesorios';
      setTimeout(() => {
        if (this.accesoriosComponent) {
          console.log('Entra Accesorios');
          this.accesoriosComponent.getAccesorioRomWeb(this.idemppaisnegcue);
        }
      }, 0); // Retraso mínimo para permitir la inicialización del componente
      // this.getAccesorioRomWeb();
      this.titleColor = 'text-accesorio'; // Color del título para "accesorios"
    }
  }

  // createFormTurn(): UntypedFormGroup {
  //   return this.fb.group({
  //     description: new FormControl('', Validators.required)
  //   });
  // }

  // getManegementForm(tipo: string) {
  //   if (this.manegementForm.valid) {
  //     // Obtener y limpiar el valor del campo description
  //     const descriptionValue = this.manegementForm.get('description')?.value.trim();

  //     switch (tipo) {
  //       case 'modelos':
  //         const modelo: ModeloEquipo = {
  //           strmodeloequipodesc: descriptionValue,
  //           strmodeloequipousucre: this.usuario
  //         };
  //         this.modeloService.postModeloRomweb(modelo).subscribe({
  //           next: (res) => this.handleApiResponse(res, () => {
  //             this.limpiarFormulario();
  //             this.getModeloRomWeb();
  //           }),
  //           error: () => {
  //             Swal.fire({
  //               title: "Respuesta",
  //               text: "Ocurrió un error con el servidor",
  //               icon: "error"
  //             }).then(() => {
  //               this.getModeloRomWeb();
  //             });
  //           }
  //         });
  //         break;
  //       case 'accesorios':
  //         const accesorio: Accesorio = {
  //           descripcion: descriptionValue,
  //           usercreate: this.usuario
  //         };
  //         this.accesorioService.postAccesorioRomweb(accesorio).subscribe({
  //           next: (res) => this.handleApiResponse(res, () => {
  //             this.limpiarFormulario();
  //             this.getAccesorioRomWeb();
  //           }),
  //           error: () => {
  //             Swal.fire({
  //               title: "Respuesta",
  //               text: "Ocurrió un error con el servidor",
  //               icon: "error"
  //             }).then(() => {
  //               this.getAccesorioRomWeb();
  //             });
  //           }
  //         });
  //         break;
  //       default:
  //         break;
  //     }
  //   }
  // }

  // private handleApiResponse(response: any, callback: () => void) {
  //   if (response && response.mensaje) {
  //     const [icono, msj] = response.mensaje.split('/');
  //     Swal.fire({
  //       title: "Respuesta",
  //       text: msj,
  //       icon: icono as 'success' | 'info' | 'warning' | 'error'
  //     }).then(() => {
  //       callback();
  //     });
  //   } else {
  //     Swal.fire({
  //       title: "Respuesta",
  //       text: "Ocurrió un error con el servidor",
  //       icon: "error"
  //     }).then(() => {
  //       callback();
  //     });
  //   }
  // }

  // private showErrorToast(message: string) {
  //   Swal.close();
  //   const Toast = Swal.mixin({
  //     toast: true,
  //     position: "bottom-end",
  //     showConfirmButton: false,
  //     timer: 3500,
  //     timerProgressBar: true,
  //     didOpen: (toast) => {
  //       toast.onmouseenter = Swal.stopTimer;
  //       toast.onmouseleave = Swal.resumeTimer;
  //     }
  //   });
  //   Toast.fire({
  //     icon: "error",
  //     title: message
  //   });
  // }

  // transformToUpperCase(event: Event): void {
  //   const input = event.target as HTMLInputElement;
  //   const start = input.selectionStart || 0;
  //   const end = input.selectionEnd || 0;

  //   input.value = input.value.toUpperCase();
  //   input.setSelectionRange(start, end);

  //   this.manegementForm.get('description')?.setValue(input.value, { emitEvent: false });
  // }

  // transformToUpperCaseTable(event: Event, itemrow:any): void {
  //   const input = event.target as HTMLInputElement;
  //   const start = input.selectionStart || 0;
  //   const end = input.selectionEnd || 0;

  //   input.value = input.value.toUpperCase();
  //   input.setSelectionRange(start, end);

  //   this.manegementForm.get('description')?.setValue(input.value, { emitEvent: false });
  // }

  // limpiarFormulario() {
  //   this.manegementForm.reset();
  // }


  // cambiarpaginaModelo(e: PageEvent) {
  //   this.desdeM = e.pageIndex * e.pageSize;
  //   this.hastaM = this.desdeM + e.pageSize;
  // }

  // searchModelo() {
  //   if (!this.searchTermModelo.trim()) {
  //     this.filteredModelosList = this.modelosList;
  //   } else {
  //     this.filteredModelosList = this.modelosList.filter(item =>
  //       item.strmodeloequipodesc!.toLowerCase().includes(this.searchTermModelo.toLowerCase())
  //     );
  //   }

  //   this.desdeM = 0;
  //   this.hastaM = this.pageSizeModelo;
  //   this.paginatorModelo?.firstPage();
  // }

  // getModeloRomWeb() {
  //   Swal.fire({
  //     title: 'Cargando Datos...',
  //     text: 'Por favor, espere mientras se cargan los datos.',
  //     allowOutsideClick: false,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     }
  //   });

  //   this.modeloService.getModeloRomWeb().subscribe({
  //     next: (data) => {
  //       if (data) {
  //         this.modelosList = data;
  //         this.filteredModelosList = data;
  //         this.accesoriosList = [];
  //         this.filteredAccesoriosList = [];
  //         if (this.paginatorModelo) {
  //           this.paginatorModelo.firstPage();
  //         }
  //         Swal.close();
  //       } else {
  //         this.showErrorToast("Error con el servidor. No se pudo cargar los datos.");
  //       }
  //     },
  //     error: () => {
  //       this.showErrorToast("Error con el servidor. No se pudo cargar los datos.");
  //     }
  //   });
  // }

  // eliminarModelo(item: ModeloEquipo) {
  //   item.editing = false;
  //   this.deleteRowModelo(item); // Llama al método deleteRow() con los parámetros correspondientes
  // }

  // deleteRowModelo(item: ModeloEquipo){
    
  //   const modelo: ModeloEquipo = {
  //     intmodeloequipoid: item.intmodeloequipoid,
  //     strmodeloequipousumodi: this.usuario
  //   }

  //   Swal.fire({
  //     title: '¿Estás seguro?',
  //     text: 'Esta acción no se puede deshacer.\nSi sólo necesita corregir, utilice la función editar en el ícono del lapiz',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Sí, eliminar',
  //     cancelButtonText: 'Cancelar'
  //   }).then((result) => {
  //     if (result.isConfirmed){
  //       this.modeloService.deleteModeloRomweb(modelo).subscribe({
  //         next: (res) => this.handleApiResponse(res, () => {
  //           this.limpiarFormulario();
  //           this.getModeloRomWeb();
  //         }),
  //         error: () => {
  //           Swal.fire({
  //             title: "Respuesta",
  //             text: "Ocurrió un error con el servidor",
  //             icon: "error"
  //           }).then(() => {
  //             this.getModeloRomWeb();
  //           });
  //         }
  //       })
  //     } else if (result.dismiss) {
  //       console.log('CANCELADO DELETE MODELO');
  //     }
  //   });
  // }

  // enableEditingModelo(item: ModeloEquipo){
  //   this.filteredModelosList.forEach(t => {
  //     if (t !== item) {
  //       t.editing = false; // Desactiva la edición de todos los demás turnos
  //     }
  //   });
  //   item.editing = true; // Activa la edición del turno seleccionado
  // }

  // saveChangesModelo(item: ModeloEquipo){
  //   if (!item.strmodeloequipodesc || item.strmodeloequipodesc.trim() === '') {
  //     Swal.fire({
  //       title: "Alerta",
  //       text: "El campo no puede estar vacío",
  //       icon: "warning"
  //     });
  //     item.strmodeloequipodesc = '';
  //     return;
  //   }

  //   item.editing = false;
  //   // Usa una expresión ternaria para asegurar que trim y toUpperCase se aplican solo si strmodeloequipodesc no es null o undefined
  //   item.strmodeloequipodesc = item.strmodeloequipodesc 
  //       ? item.strmodeloequipodesc.trim().replace(/\s+/g, ' ').toUpperCase() 
  //       : item.strmodeloequipodesc;
  //   item.strmodeloequipousumodi = this.usuario;
  //   console.log('saveChangesModelo', item);

  //   this.modeloService.postModeloRomweb(item).subscribe({
  //     next: (res) => this.handleApiResponse(res, () => {
  //       this.limpiarFormulario();
  //       this.getModeloRomWeb();
  //     }),
  //     error: () => {
  //       Swal.fire({
  //         title: "Respuesta",
  //         text: "Ocurrió un error con el servidor",
  //         icon: "error"
  //       }).then(() => {
  //         this.getModeloRomWeb();
  //       });
  //     }
  //   })
    
  // }

  // onDescriptionChangeModelo(event: Event, item: ModeloEquipo) {
  //   const inputElement = event.target as HTMLInputElement;
  //   if (inputElement) {
  //     item.strmodeloequipodesc = inputElement.value.toUpperCase();
  //   }
  // }

  // cancelEditingModelo(item: ModeloEquipo){
  //   item.editing = false;
  //   console.log('cancelEditingModelo',item);
  // }

  // cambiarpaginaAccesorio(e: PageEvent) {
  //   this.desdeA = e.pageIndex * e.pageSize;
  //   this.hastaA = this.desdeA + e.pageSize;
  // }

  // searchAccesorio() {
  //   if (!this.searchTermAccesorio.trim()) {
  //     this.filteredAccesoriosList = this.accesoriosList;
  //   } else {
  //     this.filteredAccesoriosList = this.accesoriosList.filter(item =>
  //       item.descripcion!.toLowerCase().includes(this.searchTermAccesorio.toLowerCase())
  //     );
  //   }

  //   this.desdeA = 0;
  //   this.hastaA = this.pageSizeAccesorio;
  //   this.paginatorAccesorio?.firstPage();
  // }

  // getAccesorioRomWeb() {
  //   Swal.fire({
  //     title: 'Cargando Datos...',
  //     text: 'Por favor, espere mientras se cargan los datos.',
  //     allowOutsideClick: false,
  //     showConfirmButton: false,
  //     willOpen: () => {
  //       Swal.showLoading();
  //     }
  //   });

  //   this.accesorioService.getAccesorioRomWeb().subscribe({
  //     next: (data) => {
  //       if (data) {
  //         this.accesoriosList = data;
  //         this.filteredAccesoriosList = data;
  //         this.modelosList = [];
  //         this.filteredModelosList = [];
  //         if (this.paginatorAccesorio) {
  //           this.paginatorAccesorio.firstPage();
  //         }
  //         Swal.close();
  //       } else {
  //         this.showErrorToast("Error con el servidor. No se pudo cargar los datos.");
  //       }
  //     },
  //     error: () => {
  //       this.showErrorToast("Error con el servidor. No se pudo cargar los datos.");
  //     }
  //   });
  // }

  // eliminarAccesorio(item: Accesorio) {
  //   item.editing = false;
  //   this.deleteRowAccesorio(item); // Llama al método deleteRow() con los parámetros correspondientes
  // }

  // deleteRowAccesorio(item: Accesorio){
  //   const accesorio: Accesorio = {
  //     idaccesorio: item.idaccesorio,
  //     userupdate: this.usuario
  //   }

  //   Swal.fire({
  //     title: '¿Estás seguro?',
  //     text: 'Esta acción no se puede deshacer.\nSi sólo necesita corregir, utilice la función editar en el ícono del lapiz',
  //     icon: 'warning',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3085d6',
  //     cancelButtonColor: '#d33',
  //     confirmButtonText: 'Sí, eliminar',
  //     cancelButtonText: 'Cancelar'
  //   }).then((result) => {
  //     if (result.isConfirmed){
  //       this.accesorioService.deleteAccesesorioRomWeb(accesorio).subscribe({
  //         next: (res) => this.handleApiResponse(res, () => {
  //           this.limpiarFormulario();
  //           this.getAccesorioRomWeb();
  //         }),
  //         error: () => {
  //           Swal.fire({
  //             title: "Respuesta",
  //             text: "Ocurrió un error con el servidor",
  //             icon: "error"
  //           }).then(() => {
  //             this.getAccesorioRomWeb();
  //           });
  //         }
  //       })
  //     } else if (result.dismiss) {
  //       console.log('CANCELADO DELETE ACCESORIO');
  //     }
  //   });
  // }
  
  // enableEditingAccesorio(item: Accesorio){
  //   this.filteredAccesoriosList.forEach(t => {
  //     if (t !== item) {
  //       t.editing = false; // Desactiva la edición de todos los demás turnos
  //     }
  //   });
  //   item.editing = true; // Activa la edición del turno seleccionado
  // }

  // saveChangesAccesorio(item: Accesorio){
  //   if (!item.descripcion || item.descripcion.trim() === '') {
  //     Swal.fire({
  //       title: "Alerta",
  //       text: "El campo no puede estar vacío",
  //       icon: "warning"
  //     });
  //     item.descripcion = '';
  //     return;
  //   }

  //   item.editing = false;
  //   // Usa una expresión ternaria para asegurar que trim y toUpperCase se aplican solo si strmodeloequipodesc no es null o undefined
  //   item.descripcion = item.descripcion 
  //       ? item.descripcion.trim().replace(/\s+/g, ' ').toUpperCase() 
  //       : item.descripcion;
  //   item.modelounico = item.descripcion;
  //   item.userupdate = this.usuario;
  //   console.log('saveChangesAccesorio', item);

  //   this.accesorioService.postAccesorioRomweb(item).subscribe({
  //     next: (res) => this.handleApiResponse(res, () => {
  //       this.limpiarFormulario();
  //       this.getAccesorioRomWeb();
  //     }),
  //     error: () => {
  //       Swal.fire({
  //         title: "Respuesta",
  //         text: "Ocurrió un error con el servidor",
  //         icon: "error"
  //       }).then(() => {
  //         this.getAccesorioRomWeb();
  //       });
  //     }
  //   })
  // }

  // onDescriptionChangeAccesorio(event: Event, item: Accesorio){
  //   const inputElement = event.target as HTMLInputElement;
  //   if (inputElement) {
  //     item.descripcion = inputElement.value.toUpperCase();
  //   }
  // }

  // cancelEditingAccesorio(item: Accesorio){
  //   item.editing = false;
  //   console.log('cancelEditingAccesorio',item);
  // }

}
