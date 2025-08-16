import { CommonModule, DatePipe } from '@angular/common';
import { Component, inject, Inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgSelectModule } from '@ng-select/ng-select';
import { VentastpfService } from '../../../../../../../services/entel-tpf/ventastpf/ventastpf.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ActualizarNombreVoucherRequesttpf, UploadImageRequesttpf, Ventastpf } from '../../../../../../../models/entel-tpf/ventastpf/ventastpf';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-editar-vouchertpf',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    NgSelectModule
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './editar-vouchertpf.component.html',
  styleUrl: './editar-vouchertpf.component.css'
})
export class EditarVouchertpfComponent {
  readonly dialogRef = inject(MatDialogRef<EditarVouchertpfComponent>);
  voucherForm: FormGroup;

  idemppaisnegcue: number;
  idusuario: number;
  perfil: string;
  usuario: string = '';

  fileName?: string;
  base64File?: string;
  selectedFile: File | null = null; // Almacena el archivo seleccionado
  botonBloqueado: any = false;
  urlPrefirmada: string = '';

  isBlockSave: boolean = true;
  defaultImageUrl: string = 'assets/img/voucher_example.png';
  isLoading: boolean = true;
  isLoadingSave: boolean = false;
  isLoadingSaveVoucher: boolean = false;

  constructor(
    private fb: FormBuilder,
    private ventastpfService: VentastpfService,
    private datePipe: DatePipe,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    this.usuario = (localStorage.getItem('user') || '');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.idusuario = Number(localStorage.getItem('idusuario') || 0);
    this.perfil = data.perfil;

    console.log('DATA', data);

    const fechaFormateada = this.datePipe.transform(data.ventaData.fechaemisionvoucher, 'yyyy-MM-dd');

    console.log('fechaFormateada', fechaFormateada);

    this.voucherForm = this.fb.group({
      idventas: [data.ventaData.idventas],
      fechaoperacion: [data.ventaData.fechaoperacion],
      doccliente: [data.ventaData.doccliente],
      nombrevoucher: [data.ventaData.nombrevoucher],
      numeroruc: [data.ventaData.numeroruc],
      codcomprobante: [data.ventaData.codcomprobante],
      numeroserie: [data.ventaData.numeroserie],
      numero: [data.ventaData.numero],
      fechaemision: [fechaFormateada],
      montovoucher: [data.ventaData.montovoucher],
      tramaqrcode: [data.ventaData.tramaqrcode]
    })
    
    const nombrevoucher = data.ventaData.nombrevoucher;
    if (nombrevoucher) {
      const request: ActualizarNombreVoucherRequesttpf = {
        nombrevoucher: nombrevoucher
      };
      this.isLoading = true; // Aquí se establece isLoading en true
      this.ventastpfService.getUrlPrefirmada(request).subscribe(result => {
        console.log('result', result);
        
        // Introduce un retraso artificial de 2 segundos
        setTimeout(() => {
          if (result.satisfactorio) {
            this.urlPrefirmada = result.urlPrefirmada;
          } else {
            this.urlPrefirmada = this.defaultImageUrl;
          }
          this.isLoading = false; // Aquí se establece isLoading en false después de la respuesta
          console.log('this.isLoading -', this.isLoading);
        }, 2000);
      }, error => {
        console.error('Error:', error);
        this.urlPrefirmada = this.defaultImageUrl;
        this.isLoading = false; // Aquí se establece isLoading en false en caso de error
      });
    } else {
      this.urlPrefirmada = this.defaultImageUrl;
      this.isLoading = false; // Asegurarse de que isLoading esté en false si no hay nombrevoucher
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.fileName = file.name;

      // Lee el archivo y lo convierte a base64
      const reader = new FileReader();
      reader.onload = () => {
        console.log('reader.result', reader.result);
        const base64 = (reader.result as string).split(',')[1]; // Extrae la cadena base64
        this.base64File = base64;

        // Actualiza el control del formulario con la cadena base64
        this.voucherForm.get('fileControl')?.patchValue(base64);

        console.log('Base64 imagen:', this.base64File);
        this.isLoadingSave = true;
        // Llama al servicio para obtener los datos del lector de códigos
        this.ventastpfService.getDataReaderCode(this.base64File).subscribe(res => {
          console.log('res', res);
          if (res.data.data !== null) {
            this.voucherForm.get('numeroruc')?.setValue(res.data.data.numRuc);
            this.voucherForm.get('codcomprobante')?.setValue(res.data.data.codComp);
            this.voucherForm.get('numeroserie')?.setValue(res.data.data.numeroSerie);
            this.voucherForm.get('numero')?.setValue(res.data.data.numero);
            this.voucherForm.get('fechaemision')?.setValue(res.data.data.fechaEmision);
            this.voucherForm.get('montovoucher')?.setValue(res.data.data.monto);

            // Deshabilitar los campos para que no puedan ser editados
            this.voucherForm.get('numeroruc')?.disable();
            this.voucherForm.get('codcomprobante')?.disable();
            this.voucherForm.get('numeroserie')?.disable();
            this.voucherForm.get('numero')?.disable();
            this.voucherForm.get('fechaemision')?.disable();
            this.voucherForm.get('montovoucher')?.disable();

            this.voucherForm.get('tramaqrcode')?.setValue(res.data.data.tramaQRCode);

            if (this.voucherForm.get('numeroruc')?.disabled &&
              this.voucherForm.get('codcomprobante')?.disabled &&
              this.voucherForm.get('numeroserie')?.disabled &&
              this.voucherForm.get('numero')?.disabled &&
              this.voucherForm.get('fechaemision')?.disabled &&
              this.voucherForm.get('montovoucher')?.disabled) {
              this.botonBloqueado = true;
            }
            this.isBlockSave = false;
            this.isLoadingSave = false;
          }
          else {
            console.error('No se encontraron datos en el lector de códigos');
            Swal.fire({
              icon: 'error',
              title: 'Boleta Inválida',
              text: 'No se encontraron datos en el lector de códigos.',
              confirmButtonText: 'OK'
            });
            this.isBlockSave = false;
            this.isLoadingSave = false;
          }

        }
        )

      };

      reader.readAsDataURL(file); // Lee el archivo como data URL
    }
  }

  limpiarImagen() {
    this.voucherForm.get('fileControl')?.setValue(null)
    this.fileName = '';

    this.voucherForm.get('numeroruc')?.enable();
    this.voucherForm.get('codcomprobante')?.enable();
    this.voucherForm.get('numeroserie')?.enable();
    this.voucherForm.get('numero')?.enable();
    this.voucherForm.get('fechaemision')?.enable();
    this.voucherForm.get('montovoucher')?.enable();

    this.voucherForm.get('numeroruc')?.setValue(null);
    this.voucherForm.get('codcomprobante')?.setValue(null);
    this.voucherForm.get('numeroserie')?.setValue(null);
    this.voucherForm.get('numero')?.setValue(null);
    this.voucherForm.get('fechaemision')?.setValue(null);
    this.voucherForm.get('montovoucher')?.setValue(null);
  }

  formatDateSave(date: Date): string {
    if (!date) {
      console.error('La fecha proporcionada es nula o indefinida.');
      return '';
    }
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
  }

  private convertirFechaAFormato(fecha: string, formato: string): string {
    const date = new Date(fecha);
    const fechaFormateada = this.datePipe.transform(date, formato);
    return fechaFormateada ? fechaFormateada : '';
  }

  private obtenerFechaActualFormato(): string {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${day}${month}${year}${hours}${minutes}${seconds}`;
  }

  saveBoleta() {
    let isVoucher = false;

    if (this.base64File) {
      isVoucher = true;
    } else {
      isVoucher = false;
    }

    const doccliente = this.voucherForm.get('doccliente')?.value;
    const idventas = this.voucherForm.get('idventas')?.value;
    const fechaOperacionFormateada = this.convertirFechaAFormato(this.data.ventaData.fechaoperacion, 'ddMMyyyy');
    const fechaActualFormateada = this.obtenerFechaActualFormato();

    const nombreboleta = idventas + '_' + fechaOperacionFormateada + '_' + doccliente + '_' + fechaActualFormateada

    const voucherVenta: Ventastpf = {
      idventas: Number(this.voucherForm.get('idventas')?.value),
      fechaoperacion: '',
      docpromotorasesor: '',
      idpdv: 0,
      correocliente: '',
      idtipodocumento: 0,
      doccliente: '',
      idtipobiometria: 0,
      numcelularcontrato: '',
      nombrevoucher: nombreboleta,// se llena como null en la bd por el sp
      numeroruc: this.voucherForm.get('numeroruc')?.value || null,
      codcomprobante: this.voucherForm.get('codcomprobante')?.value || null,
      numeroserie: this.voucherForm.get('numeroserie')?.value || null,
      numero: this.voucherForm.get('numero')?.value || null,
      fechaemisionvoucher: this.voucherForm.get('fechaemision')?.value || null,
      montovoucher: this.voucherForm.get('montovoucher')?.value || null,
      tramaqrcode: this.voucherForm.get('tramaqrcode')?.value || null,
      observacion: this.voucherForm.get('observacion')?.value || null,
      idemppaisnegcue: 0,
      estado: 0,
      usuariocreacion: '',
      fechacreacion: '',
      usuariomodificacion: this.usuario,
      fechamodificacion: '',
      usuarioanulacion: '',
      fechaanulacion: '',
      ventasDetalles: []
    }

    if (isVoucher) {
      const requestUploadVoucher: UploadImageRequesttpf = {
        Base64Image: this.base64File,
        VoucherName: nombreboleta
      }
      this.isLoadingSaveVoucher = true;
      this.isBlockSave = true;
      this.ventastpfService.uploadVoucherRetail(requestUploadVoucher).subscribe(res => {
        if (res.status === 'OK') {
          console.log('Resultado Subida S3', res);

          this.ventastpfService.updateVoucherVentas(voucherVenta).subscribe(response => {
            console.log('Resultado Actualizar Nombre Voucher', response);
            isVoucher = false;
            if (response.message === 'success') {
              this.isLoadingSaveVoucher = false;
              this.isBlockSave = true;
              this.dialogRef.close();
              Swal.fire({
                title: 'Registro exitoso',
                text: "Voucher Actualizado",
                icon: 'success',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok'
              });
            } else {
              this.isBlockSave = true;
              this.isLoadingSaveVoucher = false;
              this.dialogRef.close();
              Swal.fire({
                title: 'Ocurrió un problema con la Base de Datos',
                text: "Voucher no Actualizado",
                icon: 'error',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Ok'
              });
            }

            this.base64File = '';
          })
        } else {
          this.isBlockSave = true;
          this.isLoadingSaveVoucher = false;
          this.dialogRef.close();
          Swal.fire({
            title: 'Ocurrió un problema con la Base de Datos',
            text: "Voucher no cargado",
            icon: 'error',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok'
          });
        }
      })
    }
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

}
