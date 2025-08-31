import { Component, EventEmitter, inject, Inject, NgModule, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, UntypedFormGroup, Validators } from '@angular/forms';  // Asegúrate de importar ReactiveFormsModule
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { map, Observable, startWith } from 'rxjs';
import { VentasService } from '../../../../../../../services/entel-retail/ventas/ventas.service';
import { Bundle, Modelo, Operador, Planes, Subproducto, TipoAccesorio, TipoEquipo, TipoEtiqueta, TipoPago, TipoSeguro } from '../../../../../../../models/entel-retail/ventas/listasVentas';
import { MatSelectModule } from '@angular/material/select';
import { InventarioService } from '../../../../../../../services/entel-retail/inventario/inventario.service';
import { IMEIequipos } from '../../../../../../../models/entel-retail/inventario/imeiEquipos';
import { NgSelectModule, NgOption } from '@ng-select/ng-select';
import { VentasDetalle } from '../../../../../../../models/entel-retail/ventas/ventas';
import Swal from 'sweetalert2';

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
  selector: 'app-editar-venta',
  standalone: true,
  imports: [
    ReactiveFormsModule,  // Agrega ReactiveFormsModule aquí
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    CommonModule,
    FormsModule,
    NgSelectModule
  ],
  templateUrl: './editar-venta.component.html',
  styleUrl: './editar-venta.component.css'
})
export class EditarVentaComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<EditarVentaComponent>);
  editForm: FormGroup;
  isAccesorio: boolean = false;
  isUpselling: boolean = false;

  tipoSubproductoList: Option[] = [];
  filteredOptionstipoSubproducto!: Observable<Option[]>;

  planesList: Option[] = [];
  filteredPlanesOptionsList!: Observable<Option[]>;

  modeloList: Option[] = [];
  filteredModeloOptionsList!: Observable<Option[]>;

  optionsImeiEquipo: ListaImeis[] = [];
  filteredOptionsImeiEquipo!: Observable<ListaImeis[]>;

  tipoAccesorioList: Option[] = [];
  filteredtipoAccesorioOptionsList!: Observable<Option[]>;

  operadorList: Operador[] = [];
  tipoEquipoList: TipoEquipo[] = [];
  tipoSeguroList: TipoSeguro[] = [];
  
  tipoEtiquetaList: TipoEtiqueta[] = [];
  tipoPagoList: TipoPago[] = [];
  bundleList: Bundle[] = [];

  idemppaisnegcue: number;
  isOperador: boolean = false;
  idusuario: number;
  idusuarioromweb: number;
  perfil: string;
  isLoading = true;
  usuario: string = '';
  isButtonDisabled: boolean = false;

  constructor(
    private fb: FormBuilder,
    private ventasService: VentasService,
    private inventarioService: InventarioService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.usuario = (localStorage.getItem('user') || '');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.idusuario = Number(localStorage.getItem('idusuario') || 0);
    this.idusuarioromweb = Number(localStorage.getItem('idusuarioromweb') || 0);
    this.perfil = data.perfil;
    console.log('this.perfil MODAL EDIT',this.perfil);
    
    // Initialize form with data from dialog
    this.editForm = this.fb.group({
      idventasdetalle: [data.ventaData.idventasdetalle, Validators.required],
      idventas: [data.ventaData.idventas, Validators.required],
      fechaoperacion: [data.ventaData.fechaoperacion, Validators.required],
      docpromotorasesor: [data.ventaData.docpromotorasesor],
      nombrepdv: [data.ventaData.nombrepdv],
      nombretipodocumento: [data.ventaData.nombretipodocumento],
      doccliente: [data.ventaData.doccliente],
      nombretipobiometria: [data.ventaData.nombretipobiometria],
      numcelularcontrato: [data.ventaData.numcelularcontrato],
      correocliente: [data.ventaData.correocliente],
      observacion: [data.ventaData.observacion],
      nombrevoucher: [data.ventaData.nombrevoucher],

      idsubproducto: [''],
      nombresubproducto: [data.ventaData.nombresubproducto],
      idoperador: [''],
      nombreoperador: [data.ventaData.nombreoperador],
      idtipoequipo: [''],
      nombretipoequipo: [data.ventaData.nombretipoequipo],
      idtiposeguro: [''],
      nombretiposeguro: [data.ventaData.nombretiposeguro],
      montoupselling: [data.ventaData.montoupselling],

      idtipoetiqueta: [''],
      nombretipoetiqueta: [data.ventaData.nombretipoetiqueta],
      idtipopago: [''],
      nombretipopago: [data.ventaData.nombretipopago],
      idplan: [''],
      nombreplan: [data.ventaData.nombreplan],
      idmodelo: [''],
      nombremodelo: [data.ventaData.nombremodelo],
      imeiequipo: [data.ventaData.imeiequipo],
      imeisim: [data.ventaData.imeisim],
      iccid: [data.ventaData.iccid],
      idbundle: [''],
      nombrebundle: [data.ventaData.nombrebundle],
      pagocaja: [data.ventaData.pagocaja],
      numerocelular: [data.ventaData.numerocelular],
      idtipoaccesorio: [''],
      nombretipoaccesorio: [data.ventaData.nombretipoaccesorio],
      cantidadaccesorio: [data.ventaData.cantidadaccesorio],
      pagoaccesorio: [data.ventaData.pagoaccesorio],
      imeiaccesorio: [data.ventaData.imeiaccesorio],
      numeroorden: [data.ventaData.numeroorden],
    });

    this.getSubproducto();
    this.getOperador();
    this.getTipoEquipo();
    this.getTipoSeguro();
    this.getTipoEtiqueta();
    this.getTipoPago();
    this.getPlanes();
    this.getModelo();
    // this.getIMEIequipos();
    this.getTipoAccesorio();
    this.getBundle();
  }

  getSubproducto() {
    this.ventasService.getSubproducto(this.idemppaisnegcue).subscribe((res: Subproducto[]) => {
      console.log('lista tip getSubproducto', res);
      if (res !== null) {

        this.tipoSubproductoList = res.map(subproducto => ({
          id: subproducto.idsubproducto,
          name: subproducto.nombresubproducto
        }) as Option);
        // Trigger the first filtering to initialize the list
        const idsubproductoventa = this.data.ventaData.idsubproducto
        this.idSubproductoControl.setValue(idsubproductoventa);
      }
    });
  }

  getOperador() {
    this.ventasService.getOperador(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getOperador', res);
      if (res !== null) {
        this.operadorList = res;
      }
    })
  }

  getTipoEquipo() {
    this.ventasService.getTipoEquipo(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoEquipo', res);
      if (res !== null) {
        this.tipoEquipoList = res;
        const idtipoequipoventa = this.data.ventaData.idtipoequipo;
        this.editForm.get('idtipoequipo')?.setValue(idtipoequipoventa);
      }
    })
  }

  getTipoSeguro() {
    this.ventasService.getTipoSeguro(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoSeguro', res);
      if (res !== null) {
        this.tipoSeguroList = res;
        const idtiposeguroventa = this.data.ventaData.idtiposeguro;
        this.editForm.get('idtiposeguro')?.setValue(idtiposeguroventa);  
      }
    })
  }
  getTipoEtiqueta() {
    this.ventasService.getTipoEtiqueta(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoEtiqueta', res);
      if (res !== null) {
        this.tipoEtiquetaList = res;
        const idtipoetiquetaventa = this.data.ventaData.idtipoetiqueta;
        this.editForm.get('idtipoetiqueta')?.setValue(idtipoetiquetaventa);
      }
    })
  }

  getTipoPago() {
    this.ventasService.getTipoPago(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getTipoPago', res);
      if (res !== null) {
        this.tipoPagoList = res;
        const idtipopagoventa = this.data.ventaData.idtipopago;
        this.editForm.get('idtipopago')?.setValue(idtipopagoventa);
      }
    })
  }

  getPlanes() {
    this.ventasService.getPlanes(this.idemppaisnegcue).subscribe((res: Planes[]) => {
      console.log('lista tip getPlanes', res);
      if (res !== null) {

        this.planesList = res.map(planes => ({
          id: planes.idplan,
          name: planes.nombreplan
        }) as Option);
        // Trigger the first filtering to initialize the list
        const idplanventa = this.data.ventaData.idplan
        this.idPlanControl.setValue(idplanventa);
      }

    })
  }

  getModelo() {
    this.ventasService.getModelo(this.idemppaisnegcue).subscribe((res: Modelo[]) => {
      console.log('lista tip getModelo', res);
      if (res !== null) {

        this.modeloList = res.map(modelo => ({
          id: modelo.idmodelo,
          name: modelo.nombremodelo
        }) as Option);
        // Trigger the first filtering to initialize the list
        const idmodelo = this.data.ventaData.idmodelo
        this.idModeloControl.setValue(idmodelo);
      }
    })
  }

  // getIMEIequipos() {
  //   this.inventarioService.getIMEIequipos(this.idusuarioromweb).subscribe((res: IMEIequipos[]) => {
  //     console.log('lista tip getIMEIequipos', res);
  //     if (res !== null) {
  //       this.optionsImeiEquipo = res.map(imeiequipos => ({
  //         imeiequipo: imeiequipos.iemiequipo,
  //         imeiequipodescripcion: imeiequipos.iemiequipodescripcion
  //       }) as ListaImeis);
  //       // Trigger the first filtering to initialize the list
  //       const imeiequipoventa = this.data.ventaData.imeiequipo
  //       this.idIMEIequipoControl.setValue(imeiequipoventa);
  //     }
  //   });
  // }

  getTipoAccesorio() {
    this.ventasService.getTipoAccesorio(this.idemppaisnegcue).subscribe((res: TipoAccesorio[]) => {
      console.log('lista tip getTipoAccesorio', res);
      if (res !== null) {

        this.tipoAccesorioList = res.map(tipoaccesorio => ({
          id: tipoaccesorio.idtipoaccesorio,
          name: tipoaccesorio.nombretipoaccesorio
        }) as Option);
        // Trigger the first filtering to initialize the list
        const idtipoaccesorioventa = this.data.ventaData.idtipoaccesorio
        this.idTipoAccesorioControl.setValue(idtipoaccesorioventa);
      }

    })
  }

  getBundle() {
    this.ventasService.getBundle(this.idemppaisnegcue).subscribe(res => {
      console.log('lista tip getBundle', res);
      if (res !== null) {
        this.bundleList = res;
        const idbundleventa = this.data.ventaData.idbundle;
        this.editForm.get('idbundle')?.setValue(idbundleventa);
      }
    })
  }

  ngOnInit(): void {
    this.editForm.get('fechaoperacion')?.disable();

    console.log(this.data);

    this.loadData();

    if (this.perfil === 'HC') {
      console.log('ENTRA HC?',this.perfil);
      this.editForm.get('idbundle')?.disable();
      this.editForm.get('imeiequipo')?.disable();
      this.editForm.get('imeisim')?.disable();
      this.editForm.get('iccid')?.disable();
    }

    const subproductoSeleccionado = this.editForm.get('nombresubproducto')?.value;
    if (subproductoSeleccionado && subproductoSeleccionado.includes('ACCESORIOS')) {
      this.isAccesorio = true;
    } else {
      this.isAccesorio = false;
    }

    if (subproductoSeleccionado && subproductoSeleccionado.includes('UPSELLING')) {
      this.isUpselling = true;
      console.log('si tiene upselling', subproductoSeleccionado);
    } else {
      this.isUpselling = false;
      console.log('no tiene upselling', subproductoSeleccionado);

    }
    if (subproductoSeleccionado && subproductoSeleccionado.includes('PORTA')) {
      this.isOperador = true;
      const idoperadorventa = this.data.ventaData.idoperador;
      this.editForm.get('idoperador')?.setValue(idoperadorventa);
    } else {
      this.isOperador = false;
    }
  }

  loadData() {
    setTimeout(() => {
      this.isLoading = false;
    }, 1500); // Simula una carga de datos con un retraso de 2 segundos
  }

  get idSubproductoControl(): FormControl {
    return this.editForm.get('idsubproducto')! as FormControl;
  }

  changeInputs(event: any) {
    const subproducto = event; // Aquí obtienes el objeto del subproducto seleccionado
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
        this.editForm.get('idtipoequipo')?.setValue(null)
      }

      if (subproductoSeleccionado && subproductoSeleccionado.name.includes('UPSELLING')) {
        this.isUpselling = true;
        console.log('si tiene upselling', subproductoSeleccionado);
      } else {
        this.isUpselling = false;
        console.log('no tiene upselling', subproductoSeleccionado);

      }
      if (subproductoSeleccionado && subproductoSeleccionado.name.includes('ACCESORIO')) {
        this.isAccesorio = true;
        console.log('this.isAccesorio',this.isAccesorio);
        this.editForm.get('idoperador')?.setValue(null)
        this.editForm.get('idtipoequipo')?.setValue(null)
        this.editForm.get('idtiposeguro')?.setValue(null)
        this.editForm.get('montoupselling')?.setValue(null)

        this.editForm.get('idtipoetiqueta')?.setValue(null)
        this.editForm.get('idtipopago')?.setValue(null)
        this.editForm.get('idtipoaccesorio')?.setValue(null)
        this.editForm.get('cantidad')?.setValue(null)
        this.editForm.get('idplan')?.setValue(null)
        this.editForm.get('idmodelo')?.setValue(null)
        this.editForm.get('pagoaccesorio')?.setValue(null)
        this.editForm.get('imeiaccesorio')?.setValue(null)
        this.editForm.get('imeiequipo')?.setValue(null)
        this.editForm.get('imeisim')?.setValue(null)
        this.editForm.get('iccid')?.setValue(null)
        this.editForm.get('imeiequipo')?.enable();
        this.editForm.get('imeisim')?.enable();
        this.editForm.get('iccid')?.enable();
        // this.editForm.get('idbundle')?.setValue(null)
        this.editForm.get('pagocaja')?.setValue(null)
        this.editForm.get('numerocelular')?.setValue(null)
        this.editForm.get('numeroorden')?.setValue(null)
      } else {
        this.isAccesorio = false;
        console.log('this.isAccesorio',this.isAccesorio);
      }
    } else {
      console.log('subproducto', subproducto);
    }

  }

  get idPlanControl(): FormControl {
    return this.editForm.get('idplan')! as FormControl;
  }

  get idModeloControl(): FormControl {
    return this.editForm.get('idmodelo')! as FormControl;
  }

  get idIMEIequipoControl(): FormControl {
    return this.editForm.get('imeiequipo')! as FormControl;
  }

  get idTipoAccesorioControl(): FormControl {
    return this.editForm.get('idtipoaccesorio')! as FormControl;
  }

  onInputDocumento(event: Event) {
    const input = event.target as HTMLInputElement;
    // Filtra la entrada para permitir solo números
    input.value = input.value.replace(/[^0-9]/g, '');
  }

  limitDigits(event: any): void {
    const input = event.target;
    if (input.value.length > 6) {
      input.value = input.value.slice(0, 6);
    }
  }

  editarBoleta() {

  }

  saveEditVenta() {
    if (this.isButtonDisabled) {
      return;
    }

    // Simulación de una operación asincrónica
    setTimeout(() => {
      // Aquí iría tu lógica de guardado
      console.log('Venta guardada');

      // Vuelve a habilitar el botón después de completar la operación
      this.isButtonDisabled = false;
    }, 1000); // Reemplaza esto con la duración de tu operación real

    const datos = this.editForm.value;
    console.log('datos', datos);

    const request: VentasDetalle = {
      idventasdetalle: this.editForm.get('idventasdetalle')?.value || 0, // Asigna el valor adecuado o inicial
      idventas: 0, // Asigna el valor adecuado o inicial
      idsubproducto: this.editForm.get('idsubproducto')?.value || 0,
      idoperador: this.editForm.get('idoperador')?.value || 0,
      idtipoequipo: this.editForm.get('idtipoequipo')?.value || 0,
      idtiposeguro: this.editForm.get('idtiposeguro')?.value || 0,
      montoupselling: this.editForm.get('montoupselling')?.value || null,

      idtipoetiqueta: this.editForm.get('idtipoetiqueta')?.value || 0,
      idtipopago: this.editForm.get('idtipopago')?.value || 0,
      idplan: this.editForm.get('idplan')?.value || 0,
      idmodelo: this.editForm.get('idmodelo')?.value || 0,
      imeiequipo: this.editForm.get('imeiequipo')?.value || null,
      imeisim: this.editForm.get('imeisim')?.value || null,
      iccid: this.editForm.get('iccid')?.value || null,
      idbundle: this.editForm.get('idbundle')?.value || 0,
      pagocaja: this.editForm.get('pagocaja')?.value || null,
      numerocelular: this.editForm.get('numerocelular')?.value || null,
      idtipoaccesorio: this.editForm.get('idsubproducto')?.value || 0,
      cantidadaccesorio: this.editForm.get('cantidadaccesorio')?.value || null,
      pagoaccesorio: this.editForm.get('pagoaccesorio')?.value || null,
      imeiaccesorio: this.editForm.get('imeiaccesorio')?.value || null,
      numeroorden: this.editForm.get('numeroorden')?.value || null,
      ventasromimeicoincide: '', // Asigna el valor adecuado (ej: 'SI' o 'NO')
      codigoauthbundle: '', // Asigna el valor adecuado
      flagcodigoauthbundle: 0, // Asigna el valor adecuado (ej: 1 para true, 0 para false)
      idemppaisnegcue: this.idemppaisnegcue, // Asigna el valor adecuado
      estado: 0, // Asigna el valor adecuado (ej: 1 para activo)
      usuariocreacion: '', // Reemplaza con el nombre de usuario actual
      fechacreacion: '',
      usuariomodificacion: this.usuario,
      fechamodificacion: '',
      usuarioanulacion: '',
      fechaanulacion: ''
    }

    this.ventasService.updateVentasDetalle(request).subscribe(res => {
      console.log('actualizar detalle venta:', res);
      if (res !== null) {
        if (res.message === 'success') {
          this.dialogRef.close();
          Swal.fire({
            title: 'Actualización exitosa',
            text: "Venta Actualizada",
            icon: 'success',
            confirmButtonColor: '#3085d6',
            confirmButtonText: 'Ok'
          });
        }
      }
    })
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
