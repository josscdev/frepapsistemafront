import { Component, OnInit } from '@angular/core';
import { BundleService } from '../../../../../../services/entel-retail/mantenimientos/bundle.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { ActualizarBundle, ListarBundle, ResultadoBundle } from './models/bundle';

@Component({
  selector: 'app-bundle',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bundle.component.html',
  styleUrl: './bundle.component.css'
})
export class BundleComponent implements OnInit {
  bundles: ListarBundle[] = [];
  editing: boolean = false;
  editingId: number | null = null;
  previousStatus: number | null = null;
  idemppaisnegcue: number = 0;
  usuario: string = '';

  constructor(
    private bundleServices: BundleService,
    private router: Router
  ) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.usuario = (localStorage.getItem('user') || '');
  }

  ngOnInit(): void {
    this.getBundles();
  }

  getBundles(): void {
    console.log('idemppaisnegcue', this.idemppaisnegcue);
    console.log('usuario', this.usuario);
    this.bundleServices.getBundles(this.idemppaisnegcue).subscribe({
      next: (data: ListarBundle[]) => {
        this.bundles = data;
        console.log('data bundle', this.bundles);
      },
      error: (error) => {
        console.error('Error al obtener bundles:', error);
      }
    });
  }

  enableEditingBundleStatus(bundle: ListarBundle): void {
    this.editing = true;
    this.editingId = bundle.idbundle ?? null;
    this.previousStatus = bundle.estado ?? null;
  }

  cancelEditingBundleStatus(bundle: ListarBundle): void {
    this.editing = false;
    this.editingId = null;
    if (this.previousStatus !== null) {
      bundle.estado = this.previousStatus;
    }
  }

  saveBundleStatus(bundle: ListarBundle): void {
    this.editing = false;
    this.editingId = null;

    const actualizar: ActualizarBundle = {
      idbundle: bundle.idbundle!,
      estadobundle: bundle.estado!,
      usuario: this.usuario
    };

    this.bundleServices.putBundles(actualizar).subscribe({
      next: (data: ResultadoBundle) => {
        console.log('Respuesta SP:', data);

        if (data.estado === 'Success') {
          Swal.fire({
            title: '¡Éxito!',
            text: data.mensaje,
            icon: 'success',
            confirmButtonText: 'Aceptar'
          }).then((result) => {
            if (result.isConfirmed) {
              this.getBundles();
            }
          });
        } else {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Hubo un error con el servidor',
            showConfirmButton: true
          });
          console.log('Error al actualizar el estado del bundle:', data.mensaje);
        }
      },
      error: (err) => {
        console.error('Error HTTP:', err);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Hubo un problema al procesar la solicitud.',
          showConfirmButton: true
        });
      }
    });
  }
}
