import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AllocationtpfService } from '../../../../../../../services/entel-tpf/allocationtpf/allocationtpf.service';
import Swal from 'sweetalert2';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-editar-usuarios-enteltpf',
  standalone: true,
  imports: [ReactiveFormsModule,CommonModule,FormsModule],
  templateUrl: './editar-usuarios-enteltpf.component.html',
  styleUrl: './editar-usuarios-enteltpf.component.css'
})
export class EditarUsuariosEnteltpfComponent implements OnInit {
  editForm: FormGroup;
   idemppaisnegcue: number = 0;
   usuario: string = '';
   periodo: string = '';
  constructor(
      private dialogRef: MatDialogRef<EditarUsuariosEnteltpfComponent>,

      private fb: FormBuilder,
       private allocationService: AllocationtpfService,
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
