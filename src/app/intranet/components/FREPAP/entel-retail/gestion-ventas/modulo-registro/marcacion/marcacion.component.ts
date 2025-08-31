import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { MarcacionService } from '../../../../../../services/entel-retail/ventas/marcacion.service';
import Swal from 'sweetalert2';

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
  selector: 'app-marcacion',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    AsyncPipe,
    MatPaginatorModule,
    NgSelectModule,
    MatNativeDateModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './marcacion.component.html',
  styleUrl: './marcacion.component.css'
})
export class MarcacionComponent implements OnInit {
  marcacionForm!: FormGroup;

  hours: string[] = [];
  minutes: string[] = [];

  hourOptions!: { id: string; hora: string; }[];
  minuteOptions!: { id: string; minuto: string; }[];

  userData: any = {};

  constructor(
    private fb: UntypedFormBuilder,
    private marcacionService: MarcacionService
  ){
  }
  
  ngOnInit(): void {
    this.generateHourOptions();
    this.generateMinuteOptions();
    this.marcacionForm = this.createForm()
  }

  createForm(): UntypedFormGroup {
    const today = new Date();
    return this.fb.group({
      docusuario:  new FormControl(null, Validators.required),
      nombrepromotor: new FormControl(
        {value: null, disabled:true}, 
        Validators.required),
      fecha: new FormControl(
        {value: today, disabled:true}, 
        Validators.required),
      hora: new FormControl(null),
      minuto: new FormControl(null)
    });
  }

  generateHourOptions() {
    const hours: string[] = [];
    for (let i = 6; i < 23; i++) {
      hours.push(this.formatNumber(i));
    }
    this.hourOptions = hours.map(hour => ({ id: hour, hora: hour }));
  }

  generateMinuteOptions() {
    const minutes: string[] = [];
    for (let i = 0; i < 60; i++) {
      minutes.push(this.formatNumber(i));
    }
    this.minuteOptions = minutes.map(minute => ({ id: minute, minuto: minute }));
  }

  formatNumber(num: number): string {
    return num < 10 ? '0' + num : num.toString();
  }

  formatDateSave(date: Date): string {
    if (!date) {
      console.error('La fecha proporcionada es nula o indefinida.');
      return '';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
  }

  getUserData(): void {
    const docusuario: any = this.marcacionForm.get('docusuario')?.value;;
    this.marcacionService.getUsuarioMarcacion(docusuario).subscribe( respuesta => {
      if(respuesta.success){
        console.log('Respuesta del servicio:', respuesta);
        this.userData = respuesta; // Asignar la respuesta a una propiedad del componente
        const nombrecompleto = this.userData.nombres + ' ' + this.userData.apellidopaterno + ' ' + this.userData.apellidomaterno
        this.marcacionForm.get('nombrepromotor')?.setValue(nombrecompleto);
        Swal.fire({
          icon: 'success',
          title: 'Mensaje',
          text: respuesta.mensaje,
          confirmButtonText: 'OK'
        });
      } else {
        console.log('Respuesta del servicio:', respuesta);
        this.marcacionForm.get('nombrepromotor')?.setValue(null);
        Swal.fire({
          icon: 'error',
          title: 'Mensaje',
          text: respuesta.mensaje,
          confirmButtonText: 'OK'
        });
      }
    })
  }

  guardarMarcacion(){
    const data = this.marcacionForm.getRawValue();

    const fechaForm = this.marcacionForm.get('fecha')?.value;

    const fechaFormateada = this.formatDateSave(fechaForm);
    const hora = this.marcacionForm.get('hora')?.value;
    const minuto = this.marcacionForm.get('minuto')?.value;

    const dataMarcacion = {
      docusuario: this.marcacionForm.get('docusuario')?.value,
      fechamarcacion: fechaFormateada + ' ' + hora + ':' + minuto + ':' + '00',
    }

    console.log('data Marcacion', data)
    console.log('data Marcacion', dataMarcacion)

    Swal.fire({
      title: 'Guardando Datos...',
      text: 'Por favor, espere mientras se guardan los datos.',
      allowOutsideClick: false,
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      }
    });

    this.marcacionService.postMarcacion(dataMarcacion.docusuario,dataMarcacion.fechamarcacion).subscribe( respuesta => {
      if(respuesta.success){
        Swal.close();
        Swal.fire({
          icon: 'success',
          title: 'Mensaje',
          text: respuesta.mensaje,
          confirmButtonText: 'OK'
        });
      } else {
        Swal.close();
        Swal.fire({
          icon: 'error',
          title: 'Mensaje',
          text: respuesta.mensaje,
          confirmButtonText: 'OK'
        });
      }
    })
  }
}
