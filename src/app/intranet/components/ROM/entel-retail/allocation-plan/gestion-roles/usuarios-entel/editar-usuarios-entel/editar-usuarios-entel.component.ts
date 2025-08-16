import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AllocationService } from '../../../../../../../services/entel-retail/allocation-plan/allocation.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-usuarios-entel',
  standalone: true,
  imports: [MatDialogContent, CommonModule,FormsModule,ReactiveFormsModule,MatDialogActions],
  templateUrl: './editar-usuarios-entel.component.html',
  styleUrl: './editar-usuarios-entel.component.css'
})
export class EditarUsuariosEntelComponent implements OnInit{
   editForm: FormGroup;
   idemppaisnegcue: number = 0;
   usuario: string = '';
   periodo: string = '';
  constructor(
      private dialogRef: MatDialogRef<EditarUsuariosEntelComponent>,

      private fb: FormBuilder,
       private allocationService: AllocationService,
      @Inject(MAT_DIALOG_DATA) public data: any
    ) {
      this.usuario = (localStorage.getItem('user') || '');
      this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
      this.periodo = (localStorage.getItem('periodo') || '');
     
      this.editForm = this.fb.group({
        idusuarioentel: [null],
        docusuario: [''],
        usuarioredtde: [''],
        usuarioportal: [''],
        correocorp: [''],
        celular: [''],
        idemppaisnegcue: [null],
        estado: [null]
      });
    }

    ngOnInit(): void {
     console.log('data de editar',this.data);
     if (this.data?.usuarioEntelData) {
      this.cargarDatos(this.data.usuarioEntelData);
    }
    }

    cargarDatos(usuario: any): void {
      this.editForm.patchValue({
        idusuarioentel: usuario.idusuarioentel,
        docusuario: usuario.docusuario,
        usuarioredtde: usuario.usuarioredtde,
        usuarioportal: usuario.usuarioportal,
        correocorp: usuario.correocorp,
        celular: usuario.celular,
        idemppaisnegcue: usuario.idemppaisnegcue,
        estado: usuario.estado
        
      });
    }
  
    guardarCambios(): void {
      if (this.editForm.valid) {

        const datosActualizados = {
          ...this.editForm.value,  // Mantiene todos los valores actuales del formulario
          usuariomodificacion: this.usuario  // Agrega el nuevo campo
        };
        console.log('Datos guardados:', datosActualizados);
        this.allocationService.putUsuarioEntel(datosActualizados).subscribe((res) => {
         // Mostrar SweetAlert con el mensaje de la respuesta
          Swal.fire({
            title: 'Actualización',
            text: res.message, // Muestra el mensaje devuelto por el servicio
            icon: res.success ? 'success' : 'error', // Icono según el estado de la respuesta
            confirmButtonText: 'OK'
          }).then(() => {
            this.dialogRef.close(true); // Cierra el diálogo después de confirmar
          });
        });
      }
    }
  
    cancelar(): void {
      this.dialogRef.close();
    }
}
