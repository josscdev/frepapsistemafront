import { CommonModule } from '@angular/common';
import { Component, Inject, inject } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTabsModule } from '@angular/material/tabs';
import { NgSelectModule } from '@ng-select/ng-select';
import { Allocationtpf, EstadoPromotortpf, Funcionalidadtpf, PuntoVentatpf, TipoLicenciatpf, TipoTrabajotpf } from '../../../../../../../models/entel-tpf/allocation-plantpf/allocationtpf';
import { AllocationtpfService } from '../../../../../../../services/entel-tpf/allocationtpf/allocationtpf.service';
import Swal from 'sweetalert2';
import { Allocation } from '../../../../../../../models/entel-retail/allocation-plan/allocation';

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
  selector: 'app-editar-allocationtpf',
  standalone: true,
  imports: [
    MatDialogModule,
    MatTabsModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    NgSelectModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './editar-allocationtpf.component.html',
  styleUrl: './editar-allocationtpf.component.css'
})
export class EditarAllocationtpfComponent {
  readonly dialogRef = inject(MatDialogRef<EditarAllocationtpfComponent>);
  editForm: FormGroup;

  puntoVentaList: PuntoVentatpf[] = [];
  estadoPromotorList: EstadoPromotortpf[] = [];
  funcionalidadList: Funcionalidadtpf[] = [];
  tipoLicenciaList: TipoLicenciatpf[] = [];
  tipoTrabajoList: TipoTrabajotpf[] = [];

  isRol: boolean = true;
  isMotivo: boolean = false;
  nombreCabecera: string = 'Rol';

  idemppaisnegcue: number = 0;
  usuario: string = '';
  periodo: string = '';

  options = [
    { value: 'SI', description: 'SI' },
    { value: 'NO', description: 'NO' }
  ];

  docusuario: string = '';
  nombrespromotor: string = '';
  usuarioredtde: string = '';
  usuarioportal: string = '';
  listaRolesAbd: any[] = [];
  numMes: number = 0;

  meses = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ];

  botonesGuardar: boolean[] = [];

  constructor(
    private fb: FormBuilder,
    private allocationtpfService: AllocationtpfService,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.usuario = (localStorage.getItem('user') || '');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
    this.periodo = (localStorage.getItem('periodo') || '');
    console.log('data', data)
    this.numMes = Number(data.numMes) + 1;
    this.editForm = this.fb.group({
      roles: this.fb.array([]), // Usamos un FormArray para los objetos de la lista
    });
  }

  dateRangeValidator(group: AbstractControl): ValidationErrors | null {
    const start = group.get('fechainicio')?.value;
    const end = group.get('fechafin')?.value;
    return start && end && end < start ? { 'dateRangeInvalid': true } : null;
  }

  ngOnInit(): void {
    this.getRoles();
    this.getPdv();
    this.getEstadoPromotor();
    this.getFuncionalidad();
    this.getTipoLicencia();
    this.getTipoTrabajo();
    this.botonesGuardar = []; // Inicializa como un array vacío
    console.log('Valores del formulario:', this.editForm.value);
  }

  getRolesFormArray(): FormArray {
    return this.editForm.get('roles') as FormArray;
  }

  createRoleFormGroup(role: any, index: number): FormGroup {
    const formGroup = this.fb.group({
      idrol: [role.idrol || 0],                          // idrol
      docusuario: [role.docusuario || ''],                // docusuario
      nombres: [role.nombres || ''],                      // nombres
      idpdv: [role.idpdv || ''],                          // idpdv (idpuntoventa)
      nombrepdv: [role.nombrepdv || ''],
      fechainicio: [role.fechainicio],     // fechainicio
      fechafin: [role.fechafin],           // fechafin
      usuarioredtde: [role.usuarioredtde || ''],          // usuarioredtde (usuariotde)
      usuarioportal: [role.usuarioportal || ''],          // usuarioportal
      idtipolicencia: [role.idtipolicencia || ''],        // idtipolicencia
      observacionlicencia: [role.observacionlicencia || ''],  // observacionlicencia
      idtipoestado: [role.idtipoestado || ''],            // idtipoestado (idestadopromotor)
      idtipotrabajo: [role.idtipotrabajo || ''],          // idtipotrabajo
      idtipofuncionalidad: [role.idtipofuncionalidad || ''],  // idfuncionalidad
      referente: [role.referente || ''],                  // referente
      gestante: [role.gestante || ''],                    // gestante (esgestante)
      fechacarnetsanidad: [role.fechacarnetsanidad],  // fechacarnetsanidad
      idemppaisnegcue: [role.idemppaisnegcue || ''],      // idemppaisnegcue
      fechacese: [role.fechacese],         // fechacese
      estado: [role.estado || 1]
    }, { validators: this.dateRangeValidator }); // <-- Aquí aplicamos el validador
  
    // Escuchar cambios en el formulario y actualizar el estado del botón
    formGroup.valueChanges.subscribe(() => {
      this.botonesGuardar[index] = formGroup.dirty;
      console.log('formGroup.dirty', formGroup.dirty);
      console.log('this.botonesGuardar[index]', this.botonesGuardar[index]);
      console.log('index', index);
    });

    return formGroup;
  
  }

  getRoles() {
    const usuario = this.data.allocationData ? this.data.allocationData.docusuario : '';
    const perfil = this.data ? this.data.perfil : null;
    console.log('perfil', perfil)
    let usuarioperfil; // Declaramos la variable fuera del if-else

    if (perfil === 'SG' || perfil === 'JV') {
      usuarioperfil = (localStorage.getItem('user') || '0'); // Proporciona un valor por defecto en caso de null
      console.log('usuariosuper', usuarioperfil)
    } else {
      usuarioperfil = '0';
    }

    const request = {
      usuario: usuario,
      idemppaisnegcue: this.idemppaisnegcue,
      tipoperiodo: this.periodo,
      usuarioperfil: usuarioperfil
    };
    console.log('request getRoles', request)
    this.allocationtpfService
      .getRolPromotorDocUsuario(request.usuario, request.idemppaisnegcue, request.tipoperiodo, request.usuarioperfil)
      .subscribe(res => {
        if (res && Array.isArray(res)) {
          // Limpiar el FormArray y el array de botonesGuardar
          this.getRolesFormArray().clear();
          this.botonesGuardar = [];

          this.docusuario = res[0].docusuario;
          this.nombrespromotor = res[0].nombres;
          this.usuarioredtde = res[0].usuarioredtde;
          this.usuarioportal = res[0].usuarioportal;
          res.forEach((role, index) => {
            this.getRolesFormArray().push(this.createRoleFormGroup(role, index));  // Añadir un FormGroup para cada objeto
            this.botonesGuardar.push(false); // Inicialmente el botón está deshabilitado
          });
          this.listaRolesAbd = [...this.getRolesFormArray().value];
          console.log('res getroles', this.listaRolesAbd);

          this.listaRolesAbd.forEach(item => {
            item.fechainicio = new Date(item.fechainicio);
            item.fechafin = new Date(item.fechafin);
          });
        }
      });
  }

  parseDate(dateString: string | undefined): Date | null {
    console.log('dateString', dateString)
    if (!dateString) {
      return null; // O puedes devolver 'new Date()' si prefieres la fecha actual por defecto.
    }

    const [day, month, year] = dateString.split('/').map(Number);

    if (isNaN(day) || isNaN(month) || isNaN(year)) {
      return null; // Si alguno de los valores no es un número válido, devolvemos 'null'
    }

    return new Date(year, month - 1, day); // mes en JavaScript es 0-indexado
  }

  getPdv() {
    this.allocationtpfService.getPdv(this.idemppaisnegcue).subscribe(res => {
      if (res !== null) {
        console.log('GET PDV res', res)
        this.puntoVentaList = res;
        console.log('GET PDV', this.puntoVentaList)
      }
    })
  }

  getEstadoPromotor() {
    this.allocationtpfService.getTipoEstado(this.idemppaisnegcue).subscribe(res => {
      if (res !== null) {
        console.log('GET EST PROMOTOR res', res)
        this.estadoPromotorList = res;
        console.log('GET EST PROMOTOR', this.estadoPromotorList)
      }
    })
  }

  getFuncionalidad() {
    this.allocationtpfService.getTipoFuncionalidad(this.idemppaisnegcue).subscribe(res => {
      if (res !== null) {
        this.funcionalidadList = res;
        console.log('GET FUNCIONALIDAD', this.funcionalidadList)
      }
    })
  }

  getTipoLicencia() { //combobox Motivo
    this.allocationtpfService.getTipoLicencia(this.idemppaisnegcue).subscribe(res => {
      if (res !== null) {
        this.tipoLicenciaList = res;
        console.log('GET TIPO LICENCIA', this.tipoLicenciaList)
      }
    })
  }

  getTipoTrabajo() {
    this.allocationtpfService.getTipoTrabajo(this.idemppaisnegcue).subscribe(res => {
      if (res !== null) {
        this.tipoTrabajoList = res;
        console.log('GET TIPO TRABAJO', this.tipoTrabajoList)
      }
    })
  }

  addRole() {
    const newRoleIndex = this.getRolesFormArray().length; // Obtén el índice del nuevo formulario
    const roleFormGroup = this.createRoleFormGroup({
      idrol: 0,
      docusuario: this.data.allocationData ? this.data.allocationData.docusuario : '',
      nombres: null,
      idpdv: undefined as number | undefined,
      nombrepdv: null,
      fechainicio: null,
      fechafin: null,
      usuarioredtde: null,
      usuarioportal: null,
      idtipolicencia: undefined as number | undefined,
      observacionlicencia: null,
      idtipoestado: undefined as number | undefined,
      idtipotrabajo: undefined as number | undefined,
      idtipofuncionalidad: undefined as number | undefined,
      referente: null,
      gestante: null,
      fechacarnetsanidad: null,
      idemppaisnegcue: this.idemppaisnegcue,
      fechacese: null,
      estado: 1,
    }, newRoleIndex); // Pasa el índice correcto a createRoleFormGroup

    this.getRolesFormArray().push(roleFormGroup);
    this.botonesGuardar.push(false); // Inicialmente el botón está deshabilitado
  }

  changePdv(index: number) {
    const roleFormGroup = this.getRolesFormArray().at(index) as FormGroup;
    const selectedIdPdv = roleFormGroup.get('idpdv')?.value;
    const selectedPdv = this.puntoVentaList.find(pdv => pdv.idpdv === selectedIdPdv);

    if (selectedPdv) {
      roleFormGroup.get('nombrepdv')?.setValue(selectedPdv.nombrepdv);
    } else {
      roleFormGroup.get('nombrepdv')?.setValue('No seleccionado');
    }
  }

  removeRole(index: number) {
    // Remueve el formulario del FormArray para actualizar la vista
    this.getRolesFormArray().removeAt(index);
  }

  validateData(data: any[], errorMessages: string[]): boolean {
    const dateOverlap = (startDate1: Date, endDate1: Date, startDate2: Date, endDate2: Date): boolean => {
      return (startDate1 <= endDate2) && (startDate2 <= endDate1);
    };

    const formatDate = (date: Date): string => {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    const adjustToMidnight = (date: Date): Date => {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    };

    const docusuarioMap = new Map<string, any[]>();
    const currentYear = new Date().getFullYear();

    // Usamos un Set para evitar duplicados de mensajes
    const uniqueErrorMessages = new Set<string>();

    for (let item of data) {
      // Validar que fechainicio, fechafin y idpdv sean obligatorios
      if (!item.fechainicio) {
        uniqueErrorMessages.add(`La fecha de inicio es obligatoria`);
      }
      if (!item.fechafin) {
        uniqueErrorMessages.add(`La fecha de fin es obligatoria`);
      }
      if (!item.idpdv) {
        uniqueErrorMessages.add(`El campo punto de venta es obligatorio`);
      }

      // Convertir fechas a objetos Date y verificar que no sean nulos
      const fechainicio = item.fechainicio ? adjustToMidnight(new Date(item.fechainicio)) : null;
      const fechafin = item.fechafin ? adjustToMidnight(new Date(item.fechafin)) : null;

      if (fechainicio) {
        const day = fechainicio.getDate();
        const month = fechainicio.getMonth() + 1;
        const year = fechainicio.getFullYear();

        if (day <= 0 || day > 31) {
          uniqueErrorMessages.add(`El día de la fecha inicio (${formatDate(fechainicio)}) es inválido`);
        }

        if (month !== this.numMes) {
          uniqueErrorMessages.add(`El mes de la fecha inicio (${formatDate(fechainicio)}) debe ser el mes: ${this.meses[this.numMes - 1]}`);
        }

        if (year !== currentYear) {
          uniqueErrorMessages.add(`El año de la fecha inicio (${formatDate(fechainicio)}) debe ser el año actual: ${year}`);
        }
      }

      if (fechafin) {
        const day = fechafin.getDate();
        const month = fechafin.getMonth() + 1;
        const year = fechafin.getFullYear();

        if (day <= 0 || day > 31) {
          uniqueErrorMessages.add(`El día de la fecha fin (${formatDate(fechafin)}) es inválido`);
        }

        if (month !== this.numMes) {
          uniqueErrorMessages.add(`El mes de la fecha fin (${formatDate(fechafin)}) debe ser el mes: ${this.meses[this.numMes - 1]}`);
        }

        if (year !== currentYear) {
          uniqueErrorMessages.add(`El año de la fecha fin (${formatDate(fechafin)}) debe ser el año actual: ${year}`);
        }
      }

      // Validar que fechafin no sea menor que fechainicio
      if (fechainicio && fechafin && fechafin < fechainicio) {
        uniqueErrorMessages.add(`La fecha fin (${formatDate(fechafin)}) no puede ser menor que la fecha inicio (${formatDate(fechainicio)})`);
      }

      if (!docusuarioMap.has(item.docusuario)) {
        docusuarioMap.set(item.docusuario, []);
      }
      const entries = docusuarioMap.get(item.docusuario)!;

      for (let entry of entries) {
        // Aseguramos que las fechas no son nulas antes de pasarlas a la función de solapamiento
        if (entry.fechainicio && entry.fechafin && fechainicio && fechafin) {
          const entryStart = adjustToMidnight(new Date(entry.fechainicio));
          const entryEnd = adjustToMidnight(new Date(entry.fechafin));
          if (dateOverlap(entryStart, entryEnd, fechainicio, fechafin)) {
            uniqueErrorMessages.add(`Hay fechas solapadas para: ${formatDate(fechainicio)} - ${formatDate(fechafin)}`);
          }
        }
      }
      entries.push(item);
    }

    // Transferir mensajes de error únicos al array de errorMessages
    errorMessages.push(...uniqueErrorMessages);

    return uniqueErrorMessages.size === 0;
  }

  saveAllocation() {
    const rolesData = this.editForm.value.roles;  // Obtener todos los datos de los roles
    //this.updateRolesList();

    console.log('rolesDataT: ', rolesData)

    rolesData.forEach((item: any) => {
      item.fechainicio = item.fechainicio === null ? null : new Date(item.fechainicio);
      item.fechafin = item.fechafin === null ? null : new Date(item.fechafin);
      item.usuarioportal = this.usuarioportal;
      item.usuarioredtde = this.usuarioredtde;
    });

    const errorMessages: string[] = [];
    const isValid = this.validateData(rolesData, errorMessages);

    if (!isValid) {
      this.displayErrors(errorMessages);
      return;
    } else {
      console.log(this.listaRolesAbd);
    }

    //si  coincide idrol que actualice
    this.listaRolesAbd.forEach(role => {
      const updatedRole = rolesData.find((r: any) => r.idrol === role.idrol);

      if (updatedRole) {
        // Si se encuentra el idrol, actualiza los campos
        Object.assign(role, updatedRole);
      } else {
        // Si no se encuentra el idrol, actualiza el estado a 0
        role.estado = 0;
      }
    });

    console.log('Datos del formulario:', rolesData);
    console.log('Datos Totales:', this.listaRolesAbd);

    rolesData.forEach((newRole: any) => {
      if (newRole.idrol === 0) {
        this.listaRolesAbd.push(newRole);
      }
    });

    console.log('Datos Totales FINAL:', this.listaRolesAbd);

    const request: Allocationtpf[] = this.listaRolesAbd;

    request.forEach((item: any) => {
      item.fechainicio = this.formatDateSave(item.fechainicio);
      item.fechafin = this.formatDateSave(item.fechafin);
      item.usuariomodificacion = this.usuario;
      item.idtipolicencia = item.idtipolicencia === "" ? null : item.idtipolicencia;
      item.idtipoestado = item.idtipoestado === "" ? null : item.idtipoestado;
      item.idtipotrabajo = item.idtipotrabajo === "" ? null : item.idtipotrabajo;
      item.idtipofuncionalidad = item.idtipofuncionalidad === "" ? null : item.idtipofuncionalidad;
      item.gestante = item.gestante === "" ? null : item.gestante;
      item.observacionlicencia = item.observacionlicencia === "" ? null : item.observacionlicencia;
      item.referente = item.referente === "" ? null : item.referente;
      item.usuarioportal = item.usuarioportal === "" ? null : item.usuarioportal;
      item.usuarioredtde = item.usuarioredtde === "" ? null : item.usuarioredtde;
    });

    console.log('request saveallocation:', request);

    this.allocationtpfService.putRoles(request).subscribe(res => {
      if (res) {
        console.log('res GUARDAR', res);

        // Crear una lista de mensajes con íconos
        const messagesWithIcons = res.map((item: any) => {
          const icon = item.success
            ? '<i class="bi bi-check-circle" style="color: green;"></i>'
            : '<i class="bi bi-x-circle" style="color: red;"></i>';
          return `${icon} ${item.message}`; // Combina el ícono con el mensaje
        });

        this.displayMessages(messagesWithIcons);
        this.onNoClick();
      }
    })
  }

  formatDateSave(date: Date): string {
    if (!date) {
      console.error('La fecha proporcionada es nula o indefinida.');
      return '';
    }

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    // ${hours}:${minutes}:${seconds}
    return `${year}-${month}-${day}`;
  }

  displayMessages(messages: string[]) {
    messages.forEach(message => console.error(message));

    // Crear una lista HTML de mensajes con íconos
    const htmlMsgList = messages.map(message => `<p>${message}</p>`).join('');

    Swal.fire({
      title: "Mensajes",
      html: htmlMsgList,
      confirmButtonText: "OK"
    });
  }

  displayErrors(errorMessages: string[]) {
    errorMessages.forEach(message => console.error(message));

    // Crear una lista HTML de mensajes de error
    const htmlErrorList = errorMessages.map(message => `<li>${message}</li>`).join('');
    const errorMessageHtml = `<ul>${htmlErrorList}</ul>`;

    Swal.fire({
      icon: "error",
      title: "Errores",
      html: errorMessageHtml,
      confirmButtonText: "OK"
    });
  }

  saveOneRole(idrol: number, i: number, accordionButton: HTMLButtonElement) {
    // Obtén el objeto roleData del arreglo de formularios
    const roleData = this.editForm.value.roles[i];

    // Transforma las fechas y añade las propiedades necesarias
    roleData.fechainicio = roleData.fechainicio === null ? null : new Date(roleData.fechainicio);
    roleData.fechafin = roleData.fechafin === null ? null : new Date(roleData.fechafin);
    roleData.usuarioportal = this.usuarioportal;
    roleData.usuarioredtde = this.usuarioredtde;

    // Coloca roleData en un arreglo
    const rolesData = [roleData];

    const errorMessages: string[] = [];
    const isValid = this.validateData(rolesData, errorMessages);

    if (!isValid) {
      this.displayErrors(errorMessages);
      return;
    }

    console.log('rolesData saveallocation:', rolesData);

    // Formatea las fechas y otros campos en rolesData
    const request: Allocation[] = rolesData.map(item => ({
      ...item,
      fechainicio: this.formatDateSave(item.fechainicio),
      fechafin: this.formatDateSave(item.fechafin),
      usuariomodificacion: this.usuario,
      idtipolicencia: item.idtipolicencia === "" ? null : item.idtipolicencia,
      idtipoestado: item.idtipoestado === "" ? null : item.idtipoestado,
      idtipotrabajo: item.idtipotrabajo === "" ? null : item.idtipotrabajo,
      idtipofuncionalidad: item.idtipofuncionalidad === "" ? null : item.idtipofuncionalidad,
      gestante: item.gestante === "" ? null : item.gestante,
      observacionlicencia: item.observacionlicencia === "" ? null : item.observacionlicencia,
      referente: item.referente === "" ? null : item.referente,
      usuarioportal: item.usuarioportal === "" ? null : item.usuarioportal,
      usuarioredtde: item.usuarioredtde === "" ? null : item.usuarioredtde
    }));

    console.log('request saveallocation:', request);

    this.allocationtpfService.putRoles(request).subscribe(res => {
      if (res) {
        console.log('res GUARDAR', res);

        // Crear una lista de mensajes con íconos
        const messagesWithIcons = res.map((item: any) => {
          const icon = item.success
            ? '<i class="bi bi-check-circle" style="color: green;"></i>'
            : '<i class="bi bi-x-circle" style="color: red;"></i>';
          return `${icon} ${item.message}`; // Combina el ícono con el mensaje
        });

        this.displayMessages(messagesWithIcons);

        // Cerrar el acordeón
        if (accordionButton.getAttribute('aria-expanded') === 'true') {
          accordionButton.click(); // Cierra el acordeón
        }

        // Deshabilitar el botón después de guardar
        this.botonesGuardar[i] = false;

        this.getRoles();
      }
    })
  }

  removeOneRole(index: number) {

    // Obtener el FormGroup en el índice deseado
    const roleFormGroup = this.getRolesFormArray().at(index) as FormGroup;

    // Acceder al control específico en el FormGroup
    const idrolControl = roleFormGroup.get('idrol');

    // Obtener el valor del control
    const idrolValue = idrolControl?.value;


    // Remueve el formulario del FormArray para actualizar la vista
    if (idrolValue === 0) {
      this.getRolesFormArray().removeAt(index);
    } else {
      //api eliminar rol
      // Obtén el objeto roleData del arreglo de formularios
      const roleData = this.editForm.value.roles[index];

      // Transforma las fechas y añade las propiedades necesarias
      roleData.fechainicio = roleData.fechainicio === null ? null : new Date(roleData.fechainicio);
      roleData.fechafin = roleData.fechafin === null ? null : new Date(roleData.fechafin);
      roleData.usuarioportal = this.usuarioportal;
      roleData.usuarioredtde = this.usuarioredtde;

      // Coloca roleData en un arreglo
      const rolesData = [roleData];

      const errorMessages: string[] = [];
      const isValid = this.validateData(rolesData, errorMessages);

      if (!isValid) {
        this.displayErrors(errorMessages);
        return;
      }

      console.log('rolesData saveallocation:', rolesData);

      // Formatea las fechas y otros campos en rolesData
      const request: Allocation[] = rolesData.map(item => ({
        ...item,
        fechainicio: this.formatDateSave(item.fechainicio),
        fechafin: this.formatDateSave(item.fechafin),
        usuariomodificacion: this.usuario,
        idtipolicencia: item.idtipolicencia === "" ? null : item.idtipolicencia,
        idtipoestado: item.idtipoestado === "" ? null : item.idtipoestado,
        idtipotrabajo: item.idtipotrabajo === "" ? null : item.idtipotrabajo,
        idtipofuncionalidad: item.idtipofuncionalidad === "" ? null : item.idtipofuncionalidad,
        gestante: item.gestante === "" ? null : item.gestante,
        observacionlicencia: item.observacionlicencia === "" ? null : item.observacionlicencia,
        referente: item.referente === "" ? null : item.referente,
        usuarioportal: item.usuarioportal === "" ? null : item.usuarioportal,
        usuarioredtde: item.usuarioredtde === "" ? null : item.usuarioredtde,
        estado: 0
      }));

      console.log('request saveallocation:', request);

      this.allocationtpfService.putRoles(request).subscribe(res => {
        if (res) {
          console.log('res GUARDAR', res);

          // Crear una lista de mensajes con íconos
          const messagesWithIcons = res.map((item: any) => {
            const icon = item.success
              ? '<i class="bi bi-check-circle" style="color: green;"></i>'
              : '<i class="bi bi-x-circle" style="color: red;"></i>';
              //Para borrar el form de manera visual
              if(item.success){
                this.getRolesFormArray().removeAt(index);
                console.log('Se borró el registro')
              } else {
                console.log('No se borró el registro')
              }
            return `${icon} ${item.message}`; // Combina el ícono con el mensaje
          });

          this.displayMessages(messagesWithIcons);

          this.getRoles();
        }
      })
    }

  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
