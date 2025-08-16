import { Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { InventarioService } from '../../../../../../../services/entel-retail/inventario/inventario.service';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ListarInventarioDetalle } from '../models/inventario';
import { firstValueFrom } from 'rxjs';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-editar-inventario',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, FormsModule],
  templateUrl: './editar-inventario.component.html',
  styleUrl: './editar-inventario.component.css'
})
export class EditarInventarioComponent {

  private readonly _InventarioService = inject(InventarioService);
  private readonly _dialogRef = inject(MatDialogRef<EditarInventarioComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  // Listas
  lInventarioDetalle: WritableSignal<ListarInventarioDetalle[]> = signal([]);
  listaFiltrada: ListarInventarioDetalle[] = [];

  // Variables
  usuario: string;
  filtroTexto: string = '';

  constructor() {
    this.usuario = (localStorage.getItem('user') || '');

    effect(() => {
      this.ListarInventarioDetalle();
    });
  }

  async ngOnInit() {
    await this.ListarInventarioDetalle();
  }

  convertDateFormat(fecha: Date): string {
    const nuevaFecha = new Date(fecha);
    const year = nuevaFecha.getFullYear();
    const month = String(nuevaFecha.getMonth() + 1).padStart(2, '0');
    const day = String(nuevaFecha.getDate()).padStart(2, '0');
    const hours = String(nuevaFecha.getHours()).padStart(2, '0');
    const minutes = String(nuevaFecha.getMinutes()).padStart(2, '0');
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  }

  async ListarInventarioDetalle() {
    console.log('Inicio de la lista del detalle de inventario');
    try {
      const response = 
      await firstValueFrom(
        this._InventarioService.getInventarioDetalle
        (this.data.idinventario)
      )
      if (response) {
        // Aplicar formato a la fecha de registro de cada elemento
        response.forEach((item: any) => {
          if (item.fechacreacion) {
            item.fechacreacion = this.convertDateFormat(item.fechacreacion);
          }
        });
        this.lInventarioDetalle.set(response);
        this.aplicarFiltro();
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo obtener la lista del detalle de inventario',
          icon: 'error',
        })
      }
    } catch (error) {
      throw error;
    } finally {
      console.log('Fin de la lista del detalle de inventario');
    }
  }

  aplicarFiltro() {
    const texto = this.filtroTexto.toLowerCase();

    this.listaFiltrada = this.lInventarioDetalle().filter(item =>
      Object.values(item).some(val =>
        val?.toString().toLowerCase().includes(texto)
      )
    );
  }

  eliminarIMEI(idinventariodetalle: number)  {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    })
    .then(async (result) => {
      if (result.isConfirmed) {
        await this.eliminarInventarioDetalle(idinventariodetalle);
      }
    })
  }

  async eliminarInventarioDetalle(idinventariodetalle: number): Promise<void> {
    try {
      const response = await firstValueFrom(
        this._InventarioService.deleteInventarioDetalle(idinventariodetalle, this.usuario)
      );
      if (response) {
        if(response.estado === 'success'){
          console.log('Registro eliminado correctamente');  
          await this.ListarInventarioDetalle();
          Swal.fire({
            title: 'Éxito',
            text: response.mensaje,
            icon: 'success',
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: response.mensaje,
            icon: 'error',
          });
        }
      } else {
        Swal.fire({
          title: 'Error',
          text: 'No se pudo eliminar el registro',
          icon: 'error',
        });
      }
    } catch (error) {
      throw error;
    } finally {
      console.log('Fin de la eliminación del registro');
    }
  }

  closeDialog() {
    this._dialogRef.close();
  }
}
