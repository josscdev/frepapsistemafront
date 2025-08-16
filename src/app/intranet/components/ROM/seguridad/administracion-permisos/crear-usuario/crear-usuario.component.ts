import { ChangeDetectionStrategy, ChangeDetectorRef, Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { AbstractControl, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { CodigosResponse } from '../../../../../models/rom/seguridad/codigo';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { PermisosService } from '../../../../../services/rom/seguridad/permisos/permisos.service';
import { InsertarUsuario, RespuestaUsuario, RespuestaUsuarioXDocumento } from '../models/usuario';
import Swal from 'sweetalert2';
import { Observable, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { Inject } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

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
  selector: 'app-crear-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    NgSelectModule,
    MatDatepickerModule,
    MatProgressSpinnerModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS }
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './crear-usuario.component.html',
  styleUrl: './crear-usuario.component.css'
})
export class CrearUsuarioComponent {
  private readonly _dialogRef = inject(MatDialogRef<CrearUsuarioComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  // controls
  formUsuario!: FormGroup;

  // variables
  loading = false;
  showPassword: boolean = false;
  perfil: string = "";
  today = new Date();
  idemppaisnegcue: number = 0;
  mostrarCampos: boolean = false;
  nombreSocio: string = "";
  isLoading = true;

  // listas
  sexoList = [
    { label: 'M', value: 'M' },
    { label: 'F', value: 'F' }
  ];
  cuentasListaSocios: CodigosResponse[] = [];
  cuentasLista: CodigosResponse[] = [];
  estadoList = [
    { label: 'Activo', value: 1 },
    { label: 'Inactivo', value: 0 }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<CrearUsuarioComponent>,
    private permisosService: PermisosService,
    private cdr: ChangeDetectorRef
  ) {

    this.cuentasListaSocios = this.data.cuentasListaSocios;
    this.cuentasLista = this.data.cuentasLista;
    this.perfil = this.data.perfil;

    if (this.perfil === 'ADMIN') {
      //En el sp si manda ADMIN puede buscar docusuario de cualquier socio
      this.nombreSocio = this.perfil;
    } else {
      // En el sp si manda el nombre del socio puede buscar docusuario de ese socio
      this.nombreSocio = this.data.nombreSocio;
    }

    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);

    console.log('data', this.data);
    this.crearFormulario();
  }

  ngOnInit(): void {

  }

  crearFormulario() {
    this.formUsuario = this.fb.group({
      docusuario: [null, Validators.required],
      nombres: [null, Validators.required],
      apellidopaterno: [null, Validators.required],
      apellidomaterno: [null, Validators.required],
      sexo: [null],
      fechaingreso: [null, this.maxDateValidator(this.today)],
      direccion: [null],
      celular: [null],
      correopersonal: [null],
      correocorp: [null],
      fechanacimiento: [null, this.maxDateValidator(this.today)],
      usuario: [null, Validators.required],
      clave: [null, Validators.required],
      idemppaisnegcue: [null, Validators.required],
      estado: [null, Validators.required],
      usuariocreacion: [localStorage.getItem('usuario') || null]
    });
  }

  //Transformar a mayusculas
  transformToUpperCase(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const valor = input.value.toUpperCase();
    input.value = valor;
    input.setSelectionRange(start, end);

    this.formUsuario.get(campo)?.setValue(valor, { emitEvent: false });
  }

  //Transformar a mayusculas y quitar espacios
  transformarInput(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    let valor = input.value.toUpperCase().replace(/\s+/g, '');
    input.value = valor;
    input.setSelectionRange(start, end);

    this.formUsuario.get(campo)?.setValue(valor, { emitEvent: false });
  }

  //Limpiar espacios
  limpiarEspacios(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    let valor = input.value.replace(/\s+/g, '');
    input.value = valor;
    input.setSelectionRange(start, end);

    this.formUsuario.get(campo)?.setValue(valor, { emitEvent: false });
  }

  buscarUsuario(): void {

    let dni = this.formUsuario.get('docusuario')?.value;

    console.log('dni', dni);

    if (!dni || dni.length > 15) {
      Swal.fire({
        icon: 'warning',
        title: 'Documento inválido',
        text: 'Debe ingresar un documento válido.',
        confirmButtonText: 'Cerrar'
      });
      return;
    }

    this.isLoading = true;
    this.mostrarCampos = true;
    this.cdr.detectChanges(); // 🔁 Forzar actualización

    this.permisosService.getUsuarioPorDocumento(dni, this.nombreSocio).subscribe({
      next: (res: RespuestaUsuario | RespuestaUsuarioXDocumento) => {
        if (this.isRespuestaUsuario(res) && res.estado === 'ERROR') {
          this.formUsuario.reset({
            docusuario: dni,
            estado: 1
          });
          Swal.fire({
            icon: 'warning',
            title: 'No encontrado',
            text: res.mensaje ?? 'No se encontró el usuario.',
            confirmButtonText: 'Cerrar'
          });
        } else {
          this.formUsuario.patchValue(res as RespuestaUsuarioXDocumento);
          Swal.fire({
            icon: 'success',
            title: 'Usuario encontrado',
            text: 'Datos cargados correctamente.',
            timer: 2500,
            showConfirmButton: false
          });
        }

        this.isLoading = false;
        this.cdr.detectChanges(); // 🔁 Forzar actualización
      },
      error: () => {
        this.isLoading = false;
        this.cdr.detectChanges(); // 🔁 Forzar actualización
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'No se pudo conectar con el servidor.',
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }

  isRespuestaUsuario(res: any): res is RespuestaUsuario {
    return 'estado' in res && 'mensaje' in res;
  }

  
  maxDateValidator(maxDate: Date): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const selectedDate = new Date(control.value);
      if (selectedDate > maxDate) {
        return { maxDate: true };
      }
      return null;
    };
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  nuevoUsuario(): void {
    this.isLoading = true;
    this.mostrarCampos = true;

    this.formUsuario.reset({
      estado: 1
    });

    // Simula un pequeño tiempo de carga para que se vea el spinner
    setTimeout(() => {
      this.isLoading = false;
      this.cdr.detectChanges();
    }, 300);
  }


  guardar(): void {
    if (this.formUsuario.invalid) {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Por favor, complete todos los campos obligatorios.',
        confirmButtonText: 'Cerrar'
      });
      return
    };

    this.loading = true;

    const rawValues = this.formUsuario.getRawValue();

    const data: InsertarUsuario = {
      docusuario: rawValues.docusuario,
      nombres: rawValues.nombres,
      apellidopaterno: rawValues.apellidopaterno,
      apellidomaterno: rawValues.apellidomaterno,
      sexo: rawValues.sexo || null,
      fechaingreso: rawValues.fechaingreso || null,
      direccion: rawValues.direccion?.trim() || null,
      celular: rawValues.celular?.trim() || null,
      correopersonal: rawValues.correopersonal?.trim() || null,
      correocorp: rawValues.correocorp?.trim() || null,
      fechanacimiento: rawValues.fechanacimiento || null,
      usuario: rawValues.usuario,
      clave: rawValues.clave,
      idemppaisnegcue: rawValues.idemppaisnegcue,
      estado: rawValues.estado,
      usuariocreacion: localStorage.getItem('user') || ''
    };

    this.permisosService.insertarActualizarUsuario(data).subscribe({
      next: () => {
        this.loading = false;
        this.dialogRef.close(true);
        Swal.fire({
          icon: 'success',
          title: 'Usuario guardado',
          text: 'El usuario se guardó correctamente.',
          confirmButtonText: 'Cerrar'
        });
      },
      error: () => {
        this.loading = false;
        Swal.fire({
          icon: 'error',
          title: 'Error del servidor',
          text: 'No se pudo conectar con el servidor.',
          confirmButtonText: 'Cerrar'
        });
      }
    });
  }

  cerrar(): void {
    this.dialogRef.close(false);
  }
}
