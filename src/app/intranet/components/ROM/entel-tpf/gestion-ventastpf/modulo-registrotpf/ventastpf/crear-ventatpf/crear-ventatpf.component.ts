import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, inject, model, signal } from '@angular/core';
import { AbstractControl, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { Bundletpf, Modelotpf, Operadortpf, Planestpf, Subproductotpf, TipoAccesoriotpf, TipoBiometriatpf, TipoDocumentotpf, TipoEquipotpf, TipoEtiquetatpf, TipoPagotpf, TipoSegurotpf } from '../../../../../../../models/entel-tpf/ventastpf/listasVentastpf';
import { Observable } from 'rxjs';
import { ActualizarNombreVoucherRequesttpf, UploadImageRequesttpf, VentasDetalletpf, Ventastpf } from '../../../../../../../models/entel-tpf/ventastpf/ventastpf';
import { VentastpfService } from '../../../../../../../services/entel-tpf/ventastpf/ventastpf.service';
import Swal from 'sweetalert2';
import { AuthService } from '../../../../../../../services/auth/auth.service';

export interface DialogData {
  animal: string;
  name: string;
  titulo: string;
  perfil: string;
}

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

export class Lista {
  value!: number;
  viewValue!: string;
}

export class Option {
  id!: number;
  name!: string;
}

export class ListaImeis {
  imeiequipo!: string;
  imeiequipodescripcion!: string;
  flagpicking!: number;
}

@Component({
  selector: 'app-crear-ventatpf',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    MatDatepickerModule,
    MatSelectModule,
    MatAutocompleteModule,
    AsyncPipe,
    MatButtonModule,
    NgSelectModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './crear-ventatpf.component.html',
  styleUrl: './crear-ventatpf.component.css'
})
export class CrearVentatpfComponent {
  readonly dialogRef = inject(MatDialogRef<CrearVentatpfComponent>);
  readonly data = inject<DialogData>(MAT_DIALOG_DATA);
  readonly animal = model(this.data.animal);
  botonBloqueado: any = false;
  tipoDocumentoList: TipoDocumentotpf[] = [];
  tipoBiometriaList: TipoBiometriatpf[] = [];
  operadorList: Operadortpf[] = [];
  tipoEquipoList: TipoEquipotpf[] = [];
  tipoSeguroList: TipoSegurotpf[] = [];

  tipoEtiquetaList: TipoEtiquetatpf[] = [];
  tipoPagoList: TipoPagotpf[] = [];
  bundleList: Bundletpf[] = [];

  tipoList: Lista[] = [
    { value: 1, viewValue: 'item 1' },
    { value: 2, viewValue: 'item 2' }
  ];

  tipoSubproductoList: Option[] = [];
  filteredOptionstipoSubproducto!: Observable<Option[]>;

  isOperador: boolean = false;
  isAccesorio: boolean = false;
  isUpselling: boolean = false;


  optionsImeiEquipo: ListaImeis[] = [];
  filteredOptionsImeiEquipo!: Observable<ListaImeis[]>;

  planesList: Option[] = [];
  filteredPlanesOptionsList!: Observable<Option[]>;

  modeloList: Option[] = [];
  filteredModeloOptionsList!: Observable<Option[]>;

  tipoAccesorioList: Option[] = [];
  filteredtipoAccesorioOptionsList!: Observable<Option[]>;

  ventaForm!: FormGroup;

  today = new Date();

  fileName?: string;
  base64File?: string;
  selectedFile: File | null = null; // Almacena el archivo seleccionado

  withGun: boolean = true;

  perfil: string = "";

  errorMessage = signal('');
  ventasDetalle: VentasDetalletpf[] = [];

  usuario: string = '';
  idemppaisnegcue: number;
  idusuario: number;
  idpdv: number;
  isBlockSave: boolean = true;
  isButtonDisabled: boolean = false;

  constructor(
    private fb: UntypedFormBuilder,
    private ventastpfService: VentastpfService,
    private authService: AuthService
  ) {
    this.usuario = (localStorage.getItem('user') || '');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
    this.idusuario = Number(localStorage.getItem('idusuario') || 0);
    this.idpdv = Number(localStorage.getItem('idpdv') || 0);
    console.log('data titulo', this.data.titulo);
    console.log('data perfil', this.data.perfil);
    this.getTipoDocumento();
    this.getTipoBiometria();
    this.getTipoSeguro();

    this.getSubproducto();
    this.getOperador();
    this.getTipoEquipo();
    this.getTipoEtiqueta();
    this.getTipoPago();
    this.getPlanes();
    this.getModelo();
    this.getBundle();
    this.getTipoAccesorio();

    // this.perfil = (localStorage.getItem('PerfilVentas') || '');
    this.perfil = this.data.perfil;
    console.log('this.perfil Create Venta:', this.perfil)
  }

  getTipoDocumento() {
    this.ventastpfService.getTipoDocumento(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip docu', res);
      if (res !== null) {
        this.tipoDocumentoList = res;
      }
    })
  }

  getTipoBiometria() {
    this.ventastpfService.getTipoBiometria(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip biometria', res);
      if (res !== null) {
        this.tipoBiometriaList = res;
      }
    })
  }

  getSubproducto() {
    this.ventastpfService.getSubproducto(this.idemppaisnegcue).subscribe((res: Subproductotpf[]) => {
      console.log('lista tip getSubproducto', res);
      if (res !== null) {

        this.tipoSubproductoList = res.map(subproducto => ({
          id: subproducto.idsubproducto,
          name: subproducto.nombresubproducto
        }) as Option);
        //this.tipoSubproductoList.push({ id: 0, name: 'NINGUNO' });
        // Trigger the first filtering to initialize the list
        //this.idSubproductoControl.setValue('');

        // console.log('tipoSubproductoList', this.tipoSubproductoList);

      }
    });
  }

  getOperador() {
    this.ventastpfService.getOperador(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getOperador', res);
      if (res !== null) {
        this.operadorList = res;
      }
    })
  }

  getTipoEquipo() {
    this.ventastpfService.getTipoEquipo(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoEquipo', res);
      if (res !== null) {
        this.tipoEquipoList = res;
      }
    })
  }

  getTipoSeguro() {
    this.ventastpfService.getTipoSeguro(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoSeguro', res);
      if (res !== null) {
        this.tipoSeguroList = res;
      }
    })
  }


  getTipoEtiqueta() {
    this.ventastpfService.getTipoEtiqueta(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoEtiqueta', res);
      if (res !== null) {
        this.tipoEtiquetaList = res;
      }
    })
  }

  getTipoPago() {
    this.ventastpfService.getTipoPago(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoPago', res);
      if (res !== null) {
        this.tipoPagoList = res;
      }
    })
  }

  getPlanes() {
    this.ventastpfService.getPlanes(this.idemppaisnegcue).subscribe((res: Planestpf[]) => {
      console.log('lista tip getPlanes', res);
      if (res !== null) {

        this.planesList = res.map(planes => ({
          id: planes.idplan,
          name: planes.nombreplan
        }) as Option);
        // Trigger the first filtering to initialize the list
        //this.idPlanControl.setValue('');
      }

    })
  }

  getModelo() {
    this.ventastpfService.getModelo(this.idemppaisnegcue).subscribe((res: Modelotpf[]) => {
      console.log('lista tip getModelo', res);
      if (res !== null) {

        this.modeloList = res.map(modelo => ({
          id: modelo.idmodelo,
          name: modelo.nombremodelo
        }) as Option);
        // Trigger the first filtering to initialize the list
        //this.idModeloControl.setValue('');
      }
    })
  }

  getBundle() {
    this.ventastpfService.getBundle(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getBundle', res);
      if (res !== null) {
        this.bundleList = res.filter((x: Bundletpf) => x.estado === 1);
      }
    })
  }

  getTipoAccesorio() {
    this.ventastpfService.getTipoAccesorio(this.idemppaisnegcue).subscribe((res: TipoAccesoriotpf[]) => {
      console.log('lista tip getTipoAccesorio', res);
      if (res !== null) {

        this.tipoAccesorioList = res.map(tipoaccesorio => ({
          id: tipoaccesorio.idtipoaccesorio,
          name: tipoaccesorio.nombretipoaccesorio
        }) as Option);
        // Trigger the first filtering to initialize the list
        //this.idTipoAccesorioControl.setValue('');
      }

    })
  }

  ngOnInit(): void {
    this.ventaForm = this.createForm();
    if (this.ventaForm.valid) {
      console.log('Formulario enviado:', this.ventaForm.value);
    } else {
      console.log('Formulario inválido');
    }
    // Inicializa cada control y su respectivo filtro
    // this.initializeSubproductoAutocomplete();
    // this.initializeIMEIequipoAutocomplete();
    // this.initializePlanAutocomplete();
    // this.initializeModeloAutocomplete();
    // this.initializeTipoAccesorioAutocomplete();
    const requestPdv = {
      usuario: this.usuario,
      idemppaisnegcue: this.idemppaisnegcue
    };
  
    this.authService.getIdPdv(requestPdv).subscribe(res => {
      const idpdvActual = res.idpdv;
      const idpdvLocal = this.idpdv;

      console.log('idpdvActual', idpdvActual);
      console.log('idpdvLocal', idpdvLocal);
  
      if (idpdvActual !== idpdvLocal && this.perfil!=='ADMIN') {
        Swal.fire({
          title: 'Cambio de Punto de Venta Detectado',
          text: 'Tu punto de venta ha cambiado. Por favor, vuelve a iniciar sesión.',
          icon: 'warning',
          confirmButtonColor: '#d33',
          confirmButtonText: 'Volver al inicio',
          allowOutsideClick: true,
          allowEscapeKey: true
        }).then(() => {
          this.dialogRef.close(); // 👈 Cierra el diálogo
          location.href = '/'; // ⚠️ location.href = '/' es más directo que router.navigate(['/']), porque recarga la aplicación completamente
        });
      }
    });
  }

  createForm(): UntypedFormGroup {
    return this.fb.group({
      correo: new FormControl(null, [Validators.required, Validators.email]),
      startdate: new FormControl(this.today, [Validators.required, this.maxDateValidator(this.today)]),
      idtipodocumento: new FormControl(null, Validators.required),
      numerodocumento: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+$')]),
      celularcontrato: new FormControl(null, [Validators.required, Validators.pattern('^[0-9]+$')]),
      idtipobiometria: new FormControl(null, Validators.required),
      fileControl: new FormControl(null), // Añadido el control de archivo

      numeroruc: new FormControl(null),
      codcomprobante: new FormControl(null),
      numeroserie: new FormControl(null),
      numero: new FormControl(null),
      fechaemision: new FormControl(null),
      montovoucher: new FormControl(null, [Validators.maxLength(6)]),
      tramaqrcode: new FormControl(null),
      observacion: new FormControl(null),

      idsubproducto: new FormControl(null, Validators.required),
      idoperador: new FormControl(null),
      idtipoequipo: new FormControl(null),
      idtiposeguro: new FormControl(null),
      montoupselling: new FormControl(null),

      idtipoetiqueta: new FormControl(null),
      idtipopago: new FormControl(null),
      idtipoaccesorio: new FormControl(null),
      cantidadaccesorio: new FormControl(null),
      idplan: new FormControl(null),
      idmodelo: new FormControl(null),
      pagoaccesorio: new FormControl(null, [Validators.maxLength(6)]),
      imeiaccesorio: new FormControl(null),
      imeiequipo: new FormControl(null),
      imeisim: new FormControl(null),
      iccid: new FormControl(null),
      idbundle: new FormControl(null),
      pagocaja: new FormControl(null, [Validators.maxLength(6)]),
      numerocelular: new FormControl(null),
      numeroorden: new FormControl(null, Validators.required),
    });
  }

  changeTipoDocumento(event: any) {
    const tipodocumento = event; // Aquí obtienes el id del subproducto seleccionado
    if (tipodocumento && tipodocumento.idtipodocumento) {
      const idtipodocumento = tipodocumento.idtipodocumento;
      console.log('idtipodocumento', idtipodocumento);

      // Encuentra el objeto etiqueta correspondiente en la lista
      const idtipodocumentoSeleccionado = this.tipoDocumentoList.find(tipodocumento => tipodocumento.idtipodocumento === idtipodocumento);
      console.log('idtipodocumentoSeleccionado', idtipodocumentoSeleccionado)

      // Verifica si la descripción (name) contiene la palabra "PORTA"
      if (idtipodocumentoSeleccionado && idtipodocumentoSeleccionado.nombretipodocumento.includes('DNI')
        || idtipodocumentoSeleccionado && idtipodocumentoSeleccionado.nombretipodocumento.includes('RUC')) {
          const biometriaDigital = this.tipoBiometriaList.find(x => x.nombretipobiometria === 'DIGITAL');
          this.ventaForm.get('idtipobiometria')?.setValue(biometriaDigital?.idtipobiometria);
          this.ventaForm.get('idtipobiometria')?.enable();
      }

      if (idtipodocumentoSeleccionado && idtipodocumentoSeleccionado.nombretipodocumento.includes('C.E')
        || idtipodocumentoSeleccionado && idtipodocumentoSeleccionado.nombretipodocumento.includes('PASAPORTE')) {
          const biometriaManual = this.tipoBiometriaList.find(x => x.nombretipobiometria === 'MANUAL');
          this.ventaForm.get('idtipobiometria')?.setValue(biometriaManual?.idtipobiometria);
          this.ventaForm.get('idtipobiometria')?.disable();
      }
    } else {
      console.log('tipodocumento', tipodocumento);
    }

  }

  onInputDocumento(event: Event, controlName: string) {
    const input = event.target as HTMLInputElement;
    // Elimina los espacios y filtra la entrada para permitir solo números
    const cleanedValue = input.value.replace(/\s+/g, '').replace(/[^0-9]/g, '');
    // Actualiza el valor del FormControl en el formulario
    this.ventaForm.get(controlName)?.setValue(cleanedValue, { emitEvent: false });
  }

  limitDigits(event: any): void {
    const input = event.target;
    if (input.value.length > 6) {
      input.value = input.value.slice(0, 6);
    }
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
        this.ventaForm.get('fileControl')?.patchValue(base64);

        console.log('Base64 imagen:', this.base64File);

        // Llama al servicio para obtener los datos del lector de códigos
        this.ventastpfService.getDataReaderCode(this.base64File).subscribe(res => {
          console.log('res', res);
          if (res.data.data !== null) {
            this.ventaForm.get('numeroruc')?.setValue(res.data.data.numRuc);
            this.ventaForm.get('codcomprobante')?.setValue(res.data.data.codComp);
            this.ventaForm.get('numeroserie')?.setValue(res.data.data.numeroSerie);
            this.ventaForm.get('numero')?.setValue(res.data.data.numero);
            this.ventaForm.get('fechaemision')?.setValue(res.data.data.fechaEmision);
            this.ventaForm.get('montovoucher')?.setValue(res.data.data.monto);

            // Deshabilitar los campos para que no puedan ser editados
            this.ventaForm.get('numeroruc')?.disable();
            this.ventaForm.get('codcomprobante')?.disable();
            this.ventaForm.get('numeroserie')?.disable();
            this.ventaForm.get('numero')?.disable();
            this.ventaForm.get('fechaemision')?.disable();
            this.ventaForm.get('montovoucher')?.disable();

            this.ventaForm.get('tramaqrcode')?.setValue(res.data.data.tramaQRCode);

            if (this.ventaForm.get('numeroruc')?.disabled &&
              this.ventaForm.get('codcomprobante')?.disabled &&
              this.ventaForm.get('numeroserie')?.disabled &&
              this.ventaForm.get('numero')?.disabled &&
              this.ventaForm.get('fechaemision')?.disabled &&
              this.ventaForm.get('montovoucher')?.disabled) {
              this.botonBloqueado = true;

            }
          }
          else {
            console.error('No se encontraron datos en el lector de códigos');
            Swal.fire({
              icon: 'error',
              title: 'Boleta Inválida',
              text: 'No se encontraron datos en el lector de códigos.',
              confirmButtonText: 'OK'
            });
          }

        }
        )

      };

      reader.readAsDataURL(file); // Lee el archivo como data URL
    }
  }

  limpiarImagen() {
    this.ventaForm.get('fileControl')?.setValue(null)
    this.fileName = '';

    this.ventaForm.get('numeroruc')?.enable();
    this.ventaForm.get('codcomprobante')?.enable();
    this.ventaForm.get('numeroserie')?.enable();
    this.ventaForm.get('numero')?.enable();
    this.ventaForm.get('fechaemision')?.enable();
    this.ventaForm.get('montovoucher')?.enable();

    this.ventaForm.get('numeroruc')?.setValue(null);
    this.ventaForm.get('codcomprobante')?.setValue(null);
    this.ventaForm.get('numeroserie')?.setValue(null);
    this.ventaForm.get('numero')?.setValue(null);
    this.ventaForm.get('fechaemision')?.setValue(null);
    this.ventaForm.get('montovoucher')?.setValue(null);
  }

  limpiarDatosCliente() {
    this.ventaForm.get('correo')?.setValue(null)
    this.ventaForm.get('idtipodocumento')?.setValue(null)
    this.ventaForm.get('numerodocumento')?.setValue(null)
    this.ventaForm.get('celularcontrato')?.setValue(null)
    this.ventaForm.get('idtipobiometria')?.setValue(null)
    this.ventaForm.get('fileControl')?.setValue(null)
    this.fileName = '';

    this.ventaForm.get('numeroruc')?.enable();
    this.ventaForm.get('codcomprobante')?.enable();
    this.ventaForm.get('numeroserie')?.enable();
    this.ventaForm.get('numero')?.enable();
    this.ventaForm.get('fechaemision')?.enable();
    this.ventaForm.get('montovoucher')?.enable();

    this.ventaForm.get('numeroruc')?.setValue(null);
    this.ventaForm.get('codcomprobante')?.setValue(null);
    this.ventaForm.get('numeroserie')?.setValue(null);
    this.ventaForm.get('numero')?.setValue(null);
    this.ventaForm.get('fechaemision')?.setValue(null);
    this.ventaForm.get('montovoucher')?.setValue(null);
  }

  limpiarDatosBoleta() {
    this.ventaForm.get('numeroruc')?.setValue(null)
    this.ventaForm.get('codcomprobante')?.setValue(null)
    this.ventaForm.get('numeroserie')?.setValue(null)
    this.ventaForm.get('numero')?.setValue(null)
    this.ventaForm.get('fechaemision')?.setValue(null)
    this.ventaForm.get('montovoucher')?.setValue(null)
    this.ventaForm.get('observacion')?.setValue(null)
  }

  limpiarDatosVenta() {
    this.ventaForm.get('idsubproducto')?.setValue(null)
    this.ventaForm.get('idoperador')?.setValue(null)
    this.ventaForm.get('idtipoequipo')?.setValue(null)
    this.ventaForm.get('idtipoetiqueta')?.setValue(null)
    this.ventaForm.get('idtiposeguro')?.setValue(null)
    this.ventaForm.get('montoupselling')?.setValue(null)

    this.ventaForm.get('idtipopago')?.setValue(null)
    this.ventaForm.get('idtipoaccesorio')?.setValue(null)
    this.ventaForm.get('cantidadaccesorio')?.setValue(null)
    this.ventaForm.get('idplan')?.setValue(null)
    this.ventaForm.get('idbundle')?.setValue(null);
    this.ventaForm.get('idmodelo')?.setValue(null)
    this.ventaForm.get('pagoaccesorio')?.setValue(null)
    this.ventaForm.get('imeiaccesorio')?.setValue(null)
    this.ventaForm.get('imeiequipo')?.setValue(null)
    this.ventaForm.get('imeisim')?.setValue(null)
    this.ventaForm.get('iccid')?.setValue(null)
    this.ventaForm.get('pagocaja')?.setValue(null)
    this.ventaForm.get('numerocelular')?.setValue(null)
    this.ventaForm.get('numeroorden')?.setValue(null)
  }

  // Método que podrías usar para enviar el formulario, donde usas el archivo seleccionado
  onSubmit(): void {
    console.log('Entra?', this.ventaForm.value);

    if (this.ventaForm.valid) {

      // if (!this.validacionesIsIdIntegerSubmit()) return;

      // this.validacionesNullSubmit();

      console.log('Entra VALID?', this.ventaForm.value);

      // Obtén el id del tipo de etiqueta seleccionado
      const idSubproducto = this.ventaForm.get('idsubproducto')?.value;
      // Encuentra el objeto etiqueta correspondiente en la lista
      const subproductoSeleccionado = this.tipoSubproductoList.find(subproducto => subproducto.id === idSubproducto);

      const idOperador = this.ventaForm.get('idoperador')?.value;
      const operadorSeleccionado = this.operadorList.find(operador => operador.idoperador === idOperador);

      const idTipoEquipo = this.ventaForm.get('idtipoequipo')?.value;
      const tipoEquipoSeleccionado = this.tipoEquipoList.find(tipoequipo => tipoequipo.idtipoequipo === idTipoEquipo);

      const idTipoSeguro = this.ventaForm.get('idtiposeguro')?.value;
      const tipoSeguroSeleccionado = this.tipoSeguroList.find(tipoeseguro => tipoeseguro.idtiposeguro === idTipoSeguro);

      const idTipoEtiqueta = this.ventaForm.get('idtipoetiqueta')?.value;
      const etiquetaSeleccionada = this.tipoEtiquetaList.find(etiqueta => etiqueta.idtipoetiqueta === idTipoEtiqueta);

      const idTipoPago = this.ventaForm.get('idtipopago')?.value;
      const tipoPagoSeleccionado = this.tipoPagoList.find(tipopago => tipopago.idtipopago === idTipoPago);

      const idPlan = this.ventaForm.get('idplan')?.value;
      const planSeleccionado = this.planesList.find(plan => plan.id === idPlan);

      const idModelo = this.ventaForm.get('idmodelo')?.value;
      const modeloSeleccionado = this.modeloList.find(modelo => modelo.id === idModelo);

      const idBundle = this.ventaForm.get('idbundle')?.value;
      console.log('BUNDLEEE1', idBundle)


      if (idBundle !== null) {
        const existeBundle = this.ventasDetalle.some(detalle => detalle.idbundle !== null && detalle.idbundle !== undefined);
        if (existeBundle) {
          this.ventaForm.get('idsubproducto')?.setValue(null)
          this.ventaForm.get('idoperador')?.setValue(null)
          this.ventaForm.get('idtipoequipo')?.setValue(null)
          this.ventaForm.get('idtiposeguro')?.setValue(null)
          this.ventaForm.get('montoupselling')?.setValue(null)
          this.ventaForm.get('idtipoetiqueta')?.setValue(null)
          this.ventaForm.get('idtipopago')?.setValue(null)
          this.ventaForm.get('idplan')?.setValue(null)
          this.ventaForm.get('idmodelo')?.setValue(null)
          this.ventaForm.get('imeiequipo')?.setValue(null)
          this.ventaForm.get('imeisim')?.setValue(null)
          this.ventaForm.get('iccid')?.setValue(null)
          this.ventaForm.get('idbundle')?.setValue(null)
          this.ventaForm.get('pagocaja')?.setValue(null)
          this.ventaForm.get('numerocelular')?.setValue(null)
          this.ventaForm.get('numeroorden')?.setValue(null)

          this.ventaForm.get('idtipoaccesorio')?.setValue(null)
          this.ventaForm.get('cantidadaccesorio')?.setValue(null)
          this.ventaForm.get('pagoaccesorio')?.setValue(null)
          this.ventaForm.get('imeiaccesorio')?.setValue(null)

          Swal.fire({
            icon: 'warning',
            title: 'Registro de Bundle Ya Existe',
            text: 'Solo se permite un registro con un bundle. No se puede agregar otro.',
            confirmButtonText: 'OK',
          });
          console.log('BUNDLEEE3', this.ventaForm.get('idbundle')?.value)
          return; // Salir de la función si ya hay un registro con idbundle
        }
      }


      const bundleSeleccionado = this.bundleList.find(bundle => bundle.idbundle === idBundle);

      const idTipoAccesorio = this.ventaForm.get('idtipoaccesorio')?.value;
      const tipoAccesorioSeleccionado = this.tipoAccesorioList.find(tipoaccesorio => tipoaccesorio.id === idTipoAccesorio);

      // Crear el objeto VentasDetalle
      const nuevoDetalle: VentasDetalletpf = {
        idventasdetalle: 0, // Asigna el valor adecuado o inicial
        idventas: 0, // Asigna el valor adecuado o inicial
        idsubproducto: idSubproducto || null,
        nombresubproducto: subproductoSeleccionado?.name || '',
        idoperador: idOperador || null,
        nombreoperador: operadorSeleccionado?.nombreoperador || '',
        idtipoequipo: idTipoEquipo || null,
        nombretipoequipo: tipoEquipoSeleccionado?.nombretipoequipo || '',
        idtiposeguro: idTipoSeguro || null,
        nombretiseguro: tipoSeguroSeleccionado?.nombretiposeguro || '',
        montoupselling: this.ventaForm.get('montoupselling')?.value || null,
        idtipoetiqueta: idTipoEtiqueta || null,
        nombretipoetiqueta: etiquetaSeleccionada?.nombretipoetiqueta || '',
        idtipopago: idTipoPago || null,
        nombrepago: tipoPagoSeleccionado?.nombretipopago || '',
        idplan: idPlan || null,
        nombreplan: planSeleccionado?.name || '',
        idmodelo: idModelo || null,
        nombremodelo: modeloSeleccionado?.name || '',
        imeiequipo: this.ventaForm.get('imeiequipo')?.value || null,
        imeisim: this.ventaForm.get('imeisim')?.value || null,
        iccid: this.ventaForm.get('iccid')?.value || null,
        idbundle: idBundle || null,
        nombrebundle: bundleSeleccionado?.nombrebundle || '',
        pagocaja: this.ventaForm.get('pagocaja')?.value || null,
        numerocelular: this.ventaForm.get('numerocelular')?.value || null,
        idtipoaccesorio: idTipoAccesorio || null,
        nombretipoaccesorio: tipoAccesorioSeleccionado?.name || '',
        cantidadaccesorio: this.ventaForm.get('cantidadaccesorio')?.value || null,
        pagoaccesorio: this.ventaForm.get('pagoaccesorio')?.value || null,
        imeiaccesorio: this.ventaForm.get('imeiaccesorio')?.value || null,
        numeroorden: this.ventaForm.get('numeroorden')?.value || null,
        ventasromimeicoincide: '', // Asigna el valor adecuado (ej: 'SI' o 'NO')
        codigoauthbundle: '', // Asigna el valor adecuado
        flagcodigoauthbundle: 0, // Asigna el valor adecuado (ej: 1 para true, 0 para false)
        idemppaisnegcue: this.idemppaisnegcue, // Asigna el valor adecuado
        estado: 0, // Asigna el valor adecuado (ej: 1 para activo)
        usuariocreacion: this.usuario, // Reemplaza con el nombre de usuario actual
        fechacreacion: '',
        usuariomodificacion: '',
        fechamodificacion: '',
        usuarioanulacion: '',
        fechaanulacion: ''
      };

      this.ventasDetalle.push(nuevoDetalle);

      console.log('ventasDetalle agregar', this.ventasDetalle);
      this.ventaForm.get('idsubproducto')?.setValue(null)
      this.ventaForm.get('idoperador')?.setValue(null)
      this.ventaForm.get('idtipoequipo')?.setValue(null)
      this.ventaForm.get('idtiposeguro')?.setValue(null)
      this.ventaForm.get('montoupselling')?.setValue(null)

      this.ventaForm.get('idtipoetiqueta')?.setValue(null)
      this.ventaForm.get('idtipopago')?.setValue(null)
      this.ventaForm.get('idplan')?.setValue(null)
      this.ventaForm.get('idmodelo')?.setValue(null)
      this.ventaForm.get('imeiequipo')?.setValue(null)
      this.ventaForm.get('imeisim')?.setValue(null)
      this.ventaForm.get('iccid')?.setValue(null)
      this.ventaForm.get('idbundle')?.setValue(null)
      this.ventaForm.get('pagocaja')?.setValue(null)
      this.ventaForm.get('numerocelular')?.setValue(null)
      this.ventaForm.get('numeroorden')?.setValue(null)

      this.ventaForm.get('idtipoaccesorio')?.setValue(null)
      this.ventaForm.get('cantidadaccesorio')?.setValue(null)
      this.ventaForm.get('pagoaccesorio')?.setValue(null)
      this.ventaForm.get('imeiaccesorio')?.setValue(null)

      this.isBlockSave = false;
      // Añadir el archivo en base64
      if (this.base64File) {
        console.log('this.base64File', this.base64File);
      }

      // Aquí enviarías formData a tu backend usando HttpClient, por ejemplo
      console.log('this.base64File - SIN VALOR', this.base64File);
    }
  }

  eliminarVenta(detalle: VentasDetalletpf): void {
    const index = this.ventasDetalle.indexOf(detalle);
    if (index >= 0) {
      this.ventasDetalle.splice(index, 1);
    }
  }

  validacionesIsIdIntegerSubmit(): boolean {
    let _result = true;

    const idsubproductoValue = this.ventaForm.get('idsubproducto')?.value;
    if (!this.isInteger(idsubproductoValue)) {
      this.ventaForm.get('idsubproducto')?.setValue(null)
      console.error('El valor debe ser un número entero.');
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'warning',
        title: '<b>Subproducto Inválido</b>',
        showCloseButton: true,
        text: 'Debe seleccionar un subproducto válido'
      });
      return false;
    }

    const idplanValue = this.ventaForm.get('idplan')?.value;
    if (!this.isInteger(idplanValue)) {
      this.ventaForm.get('idplan')?.setValue(null)
      console.error('El valor debe ser un número entero.');
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'warning',
        title: '<b>Plan Inválido</b>',
        showCloseButton: true,
        text: 'Debe seleccionar un plan válido'
      });
      return false;
    }

    const idmodeloValue = this.ventaForm.get('idmodelo')?.value;
    if (!this.isInteger(idmodeloValue)) {
      this.ventaForm.get('idmodelo')?.setValue(null)
      console.error('El valor debe ser un número entero.');
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'warning',
        title: '<b>Modelo Inválido</b>',
        showCloseButton: true,
        text: 'Debe seleccionar un modelo válido'
      });
      return false;
    }

    const idtipoaccesorioValue = this.ventaForm.get('idtipoaccesorio')?.value;
    if (!this.isInteger(idtipoaccesorioValue)) {
      this.ventaForm.get('idtipoaccesorio')?.setValue(null)
      console.error('El valor debe ser un número entero.');
      const Toast = Swal.mixin({
        toast: true,
        position: 'bottom-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'warning',
        title: '<b>Tipo Accesorio Inválido</b>',
        showCloseButton: true,
        text: 'Debe seleccionar un accesorio válido'
      });
      return false;
    }

    const imeiequipo = this.ventaForm.get('imeiequipo')?.value
    if (this.perfil === 'ADMIN') {
      return true;
    } else {
      const encontrarimeiequipo = this.optionsImeiEquipo.find(x => x.imeiequipo === imeiequipo)
      if (!encontrarimeiequipo && imeiequipo !== '' && imeiequipo !== null) {
        this.ventaForm.get('imeiequipo')?.setValue(null)
        const Toast = Swal.mixin({
          toast: true,
          position: 'bottom-end',
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          },
        });
        Toast.fire({
          icon: 'warning',
          title: '<b>IMEI Equipo Inválido</b>',
          showCloseButton: true,
          text: 'Debe seleccionar un IMEI Equipo válido'
        });
        return false;
      }
    }


    return _result;
  }

  validacionesNullSubmit() {
    const idsubproductoValue = this.ventaForm.get('idsubproducto')?.value;
    if (idsubproductoValue === '') {
      this.ventaForm.get('idsubproducto')?.setValue(null)
    }

    const idplanValue = this.ventaForm.get('idplan')?.value;
    if (idplanValue === '') {
      this.ventaForm.get('idplan')?.setValue(null)
    }

    const idmodeloValue = this.ventaForm.get('idmodelo')?.value;
    if (idmodeloValue === '') {
      this.ventaForm.get('idmodelo')?.setValue(null)
    }

    const idtipoaccesorioValue = this.ventaForm.get('idtipoaccesorio')?.value;
    if (idtipoaccesorioValue === '') {
      this.ventaForm.get('idtipoaccesorio')?.setValue(null)
    }

    const imeiequipo = this.ventaForm.get('imeiequipo')?.value
    if (imeiequipo === '') {
      this.ventaForm.get('imeiequipo')?.setValue(null)
    }
  }

  private isInteger(value: any): boolean {
    return Number.isInteger(Number(value));
  }

  get idSubproductoControl(): FormControl {
    return this.ventaForm.get('idsubproducto')! as FormControl;
  }

  changeInputs(event: any) {
    const subproducto = event;
    if (subproducto && subproducto.id) {
      const idSubproducto = subproducto.id; // Aquí obtienes el id del subproducto seleccionado
      console.log('idsubproducto', idSubproducto);

      // Encuentra el objeto etiqueta correspondiente en la lista
      const subproductoSeleccionado = this.tipoSubproductoList.find(subproducto => subproducto.id === idSubproducto);

      // Verifica si la descripción (name) contiene la palabra "PORTA"
      if (subproductoSeleccionado && subproductoSeleccionado.name.includes('PORTA')) {
        this.isOperador = true;
      } else {
        this.isOperador = false;
        this.ventaForm.get('idtipoequipo')?.setValue(null)
      }

      if (subproductoSeleccionado && subproductoSeleccionado.name.includes('UPSELLING')) {
        this.isUpselling = true;
        console.log('si tiene upselling', subproductoSeleccionado);
      } else {
        this.isUpselling = false;
        console.log('no tiene upselling', subproductoSeleccionado);
        this.ventaForm.get('montoupselling')?.setValue(null)

      }
      
      if (subproductoSeleccionado && subproductoSeleccionado.name.includes('ACCESORIO')) {
        this.isAccesorio = true;
        this.ventaForm.get('idoperador')?.setValue(null)
        this.ventaForm.get('idtipoequipo')?.setValue(null)
        this.ventaForm.get('idtipoetiqueta')?.setValue(null)
        this.ventaForm.get('idtiposeguro')?.setValue(null)
        this.ventaForm.get('montoupselling')?.setValue(null)
        this.ventaForm.get('idtipopago')?.setValue(null)
        this.ventaForm.get('idtipoaccesorio')?.setValue(null)
        this.ventaForm.get('cantidad')?.setValue(null)
        this.ventaForm.get('idplan')?.setValue(null)
        this.ventaForm.get('idmodelo')?.setValue(null)
        this.ventaForm.get('pagoaccesorio')?.setValue(null)
        this.ventaForm.get('imeiaccesorio')?.setValue(null)
        this.ventaForm.get('imeiequipo')?.setValue(null)
        this.ventaForm.get('imeisim')?.setValue(null)
        this.ventaForm.get('iccid')?.setValue(null)
        this.ventaForm.get('idbundle')?.setValue(null)
        this.ventaForm.get('pagocaja')?.setValue(null)
        this.ventaForm.get('numerocelular')?.setValue(null)
        this.ventaForm.get('numeroorden')?.setValue(null)

      } else {
        this.isAccesorio = false;
      }

    } else {
      console.log('subproducto', subproducto);
    }
  }

  get idIMEIequipoControl(): FormControl {
    return this.ventaForm.get('imeiequipo')! as FormControl;
  }

  get idPlanControl(): FormControl {
    return this.ventaForm.get('idplan')! as FormControl;
  }

  get idModeloControl(): FormControl {
    return this.ventaForm.get('idmodelo')! as FormControl;
  }

  get idTipoAccesorioControl(): FormControl {
    return this.ventaForm.get('idtipoaccesorio')! as FormControl;
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

  saveVentas() {

    if(this.idpdv===0 && this.perfil!=='ADMIN'){
      Swal.fire({
        title: 'Registro Denegado',
        text: "Punto de Venta no Asignado",
        icon: 'error',
        confirmButtonColor: '#3085d6',
        confirmButtonText: 'Ok'
      });
      this.dialogRef.close();
      return;
    }

    if (this.isButtonDisabled) {
      return;
    }

    this.isButtonDisabled = true;

    // Simulación de una operación asincrónica
    setTimeout(() => {
      // Aquí iría tu lógica de guardado
      console.log('Venta guardada');

      // Vuelve a habilitar el botón después de completar la operación
      this.isButtonDisabled = false;
    }, 1000); // Reemplaza esto con la duración de tu operación real

    const startDate = this.ventaForm.get('startdate')?.value;

    const formattedStartDate = this.formatDateSave(startDate);

    let isVoucher = false;

    if (this.base64File) {
      isVoucher = true;
    } else {
      isVoucher = false;
    }

    const nuevaVenta: Ventastpf = {
      idventas: 0,
      fechaoperacion: formattedStartDate,
      docpromotorasesor: this.usuario,
      idpdv: this.idpdv,
      correocliente: this.ventaForm.get('correo')?.value || null,
      idtipodocumento: this.ventaForm.get('idtipodocumento')?.value || null,
      doccliente: this.ventaForm.get('numerodocumento')?.value || null,
      idtipobiometria: this.ventaForm.get('idtipobiometria')?.value || null,
      numcelularcontrato: this.ventaForm.get('celularcontrato')?.value || null,
      nombrevoucher: '',// se llena como null en la bd por el sp
      numeroruc: this.ventaForm.get('numeroruc')?.value || null,
      codcomprobante: this.ventaForm.get('codcomprobante')?.value || null,
      numeroserie: this.ventaForm.get('numeroserie')?.value || null,
      numero: this.ventaForm.get('numero')?.value || null,
      fechaemisionvoucher: this.ventaForm.get('fechaemision')?.value || null,
      montovoucher: this.ventaForm.get('montovoucher')?.value || null,
      tramaqrcode: this.ventaForm.get('tramaqrcode')?.value || null,
      observacion: this.ventaForm.get('observacion')?.value || null,
      idemppaisnegcue: this.idemppaisnegcue,
      estado: 0,
      usuariocreacion: this.usuario,
      fechacreacion: '',
      usuariomodificacion: '',
      fechamodificacion: '',
      usuarioanulacion: '',
      fechaanulacion: '',
      ventasDetalles: this.ventasDetalle
    }

    console.log('Nueva Venta: ', nuevaVenta);

    this.ventastpfService.postVentas(nuevaVenta).subscribe(res => {
      if (res !== null) {
        console.log('Ventas Result', res)
        if (res.success) {
          this.limpiarDatosCliente();
          this.limpiarDatosBoleta();
          this.limpiarDatosVenta();
          this.ventasDetalle = [];
          this.isBlockSave = true;

          console.log('isVoucher', isVoucher)
          //Guardar Voucher
          if (isVoucher) {
            const requestUploadVoucher: UploadImageRequesttpf = {
              Base64Image: this.base64File,
              VoucherName: res.nombrevoucher
            }

            this.ventastpfService.uploadVoucherRetail(requestUploadVoucher).subscribe(result => {
              if (result !== null) {
                if (result.status === 'OK') {
                  console.log('Resultado Subida S3', result);
                  const requestUpdateNombreVoucher: ActualizarNombreVoucherRequesttpf = {
                    idventa: res.idventa,
                    nombrevoucher: result.nombreVoucher
                  }
                  this.ventastpfService.updateNameVoucherRetail(requestUpdateNombreVoucher).subscribe(response => {
                    console.log('Resultado Actualizar Nombre Voucher', response);
                    isVoucher = false;
                    this.dialogRef.close();
                    setTimeout(() => {
                      Swal.fire({
                        title: 'Registro exitoso',
                        text: "Venta guardada. Voucher Cargado",
                        icon: 'success',
                        confirmButtonColor: '#3085d6',
                        confirmButtonText: 'Ok'
                      });
                    }, 1000); // 1000 milisegundos = 1 segundo
                  })
                  this.base64File = '';
                } else {
                  this.dialogRef.close();
                  setTimeout(() => {
                    Swal.fire({
                      title: 'Ocurrió un problema con la Base de Datos',
                      text: "Voucher no cargado",
                      icon: 'error',
                      confirmButtonColor: '#3085d6',
                      confirmButtonText: 'Ok'
                    });
                  }, 1000); // 1000 milisegundos = 1 segundo
                  this.base64File = '';
                }
              }
            })
          }
          this.base64File = '';
          this.dialogRef.close();
          setTimeout(() => {
            Swal.fire({
              title: 'Registro exitoso',
              text: "Venta guardada",
              icon: 'success',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Ok'
            });
          }, 1000); // 1000 milisegundos = 1 segundo
        } else {
          this.base64File = '';
          this.dialogRef.close();
          setTimeout(() => {
            Swal.fire({
              title: 'Ocurrió un problema con la Base de Datos',
              text: "Venta no registrada",
              icon: 'error',
              confirmButtonColor: '#3085d6',
              confirmButtonText: 'Ok'
            });
          }, 1000); // 1000 milisegundos = 1 segundo
        }
      }
    })

  }

  onNoClick(): void {
    this.limpiarDatosCliente();
    this.limpiarDatosBoleta();
    this.limpiarDatosVenta();
    this.ventasDetalle = [];
    this.dialogRef.close();
  }
}
