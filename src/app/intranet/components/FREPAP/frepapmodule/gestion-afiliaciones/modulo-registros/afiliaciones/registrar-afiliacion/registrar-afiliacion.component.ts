import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, Inject, Optional } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, NgControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatNativeDateModule, provideNativeDateAdapter } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NgSelectModule } from '@ng-select/ng-select';
import { AfiliacionesService } from '../../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';
import { AfiliacionCreateDto, ListarEstadoCivil, ListarTipoDocumento } from '../models/afiliacion';
import Swal from 'sweetalert2';

type Opcion = { id: string; nombre: string; code: string; display: string };
type UbigeoItem = {
  codubicacion: string;  // "RRPPDD"
  region?: string;
  provincia?: string;
  distrito?: string;
};

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
  selector: 'app-registrar-afiliacion',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    NgSelectModule
  ],
  providers: [
    provideNativeDateAdapter(),
    { provide: MAT_DATE_LOCALE, useValue: 'es-ES' },
    { provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS },
  ],
  templateUrl: './registrar-afiliacion.component.html',
  styleUrl: './registrar-afiliacion.component.css'
})
export class RegistrarAfiliacionComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<RegistrarAfiliacionComponent>);
  private afiliacionesSrv = inject(AfiliacionesService);

  form!: FormGroup;

  // Catálogos (rellenos desde this.data.ubigeos)
  regiones: Opcion[] = [];
  provincias: Opcion[] = [];
  distritos: Opcion[] = [];

  // Otros catálogos de ejemplo
  tipoDocumentoList = [
    { id: 'DNI', nombre: 'DNI' },
    { id: 'CE', nombre: 'Carné Extranjería' },
    { id: 'PAS', nombre: 'Pasaporte' },
  ];

  today = new Date();
  isBlockSave = false;
  isButtonDisabled = false;

  // Cache para filtrar rápido
  private byRR = new Map<string, UbigeoItem[]>();        // RR -> items
  private byRRPP = new Map<string, UbigeoItem[]>();      // RRPP -> items

  // Listar Estados Civiles
  estadosCiviles: ListarEstadoCivil[] = [];

  // Listar Tipos Documentos
  tiposDocumento: ListarTipoDocumento[] = [];

  idemppaisnegcue: number = 0;
  usuario: string = '';

  sexosList: Opcion[] = [];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { ubigeos: UbigeoItem[] }) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue')) || 0;
    this.usuario = localStorage.getItem('user') || '';
    this.getListarEstadosCiviles();
    this.getListarTipoDocumentos();
    this.getListarSexos();
  }

  ngOnInit(): void {
    this.form = this.fb.group({
      numficha: ['', Validators.required],
      fechaafiliacion: [this.today, Validators.required],
      nombres: ['', Validators.required],
      apellidopaterno: ['', Validators.required],
      apellidomaterno: ['', Validators.required],

      idtipodocumento: [null, Validators.required],
      docafiliado: ['', Validators.required],

      fechanacimiento: [null],
      edadafiliado: [0],
      sexo: [null],
      idestadocivil: [null],
      lugarnacimiento: [''],

      // RR/PP/DD solo guardamos códigos
      rr: [null],      // "RR"
      pp: [null],      // "RRPP"
      dd: [null],      // "RRPPDD"

      avenida: [''],
      numero: [''],
      urbanizacion: [''],

      // 🌟 Archivos
      foto: [null],               // File | null
      fichaafiliacionfile: [null],// PDF
      hojadevida: [null],         // PDF
      copiadocumento: [null],     // PDF

      estado_text: ['ACTIVO', Validators.required],

      telefono: [''],
      correo: [''],
      observacion: [''],

      // 🔎 Trazabilidad (solo visual, no se guardan)
      usuario_creacion: [{ value: '', disabled: true }],
      fecha_creacion: [{ value: '', disabled: true }],
      usuario_modificacion: [{ value: '', disabled: true }],
      fecha_modificacion: [{ value: '', disabled: true }],
      usuario_anulacion: [{ value: '', disabled: true }],
      fecha_anulacion: [{ value: '', disabled: true }],
    });

    this.form.get('sexo')?.valueChanges.subscribe((sexo: string | null) => {
      this.form.patchValue({ sexo: sexo }, { emitEvent: false });
    });

    console.log(this.data?.ubigeos);
    // Cargar catálogos a partir de los ubigeos recibidos
    this.setupUbigeos(this.data?.ubigeos ?? []);

    // Cambios en RR → recalcular PP
    this.form.get('rr')?.valueChanges.subscribe((rr: string | null) => {
      this.form.patchValue({ pp: null, dd: null }, { emitEvent: false });
      this.provincias = rr ? this.buildProvincias(rr) : [];
      this.distritos = [];
    });

    // Cambios en PP → recalcular DD
    this.form.get('pp')?.valueChanges.subscribe((rrpp: string | null) => {
      this.form.patchValue({ dd: null }, { emitEvent: false });
      this.distritos = rrpp ? this.buildDistritos(rrpp) : [];
    });

    // 👉 Suscripción al cambio de fecha de nacimiento para calcular edad
    this.form.get('fechanacimiento')?.valueChanges.subscribe((d: Date | null) => {
      const edad = d ? this.calcEdad(d) : 0;
      this.form.get('edadafiliado')?.setValue(edad, { emitEvent: false });
    });
  }

  getListarSexos() {
    this.sexosList = [
      {
        id: 'M',
        nombre: 'Masculino',
        code: 'M',
        display: 'Masculino'
      },
      {
        id: 'F',
        nombre: 'Femenino',
        code: 'F',
        display: 'Femenino'
      }
    ]
  }

  transformToUpperCase(event: Event, campo: string): void {
    const input = event.target as HTMLInputElement;
    const start = input.selectionStart || 0;
    const end = input.selectionEnd || 0;

    const valor = input.value.toUpperCase();
    input.value = valor;
    input.setSelectionRange(start, end);

    this.form.get(campo)?.setValue(valor, { emitEvent: false });
  }

  getListarTipoDocumentos() {
    this.afiliacionesSrv.listarTipoDocumentos(this.idemppaisnegcue).subscribe({
      next: (data: ListarTipoDocumento[]) => {
        data = data.map((item: ListarTipoDocumento) => {
          return {
            idtipodocumento: item.idtipodocumento,
            nombretipodocumento: '(' + item.abreviatura + ') ' + item.nombretipodocumento,
            abreviatura: item.abreviatura,
            idemppaisnegcue: item.idemppaisnegcue,
            estado: item.estado
          }
        })
        this.tiposDocumento = data;
      },
      error: (err) => {
        console.error('Error al cargar tipos de documento', err);
      }
    });
  }

  getListarEstadosCiviles() {
    this.afiliacionesSrv.listarEstadosCiviles(this.idemppaisnegcue).subscribe({
      next: (data) => {
        this.estadosCiviles = data;
      },
      error: (err) => {
        console.error('Error al cargar estados civiles', err);
      }
    });
  }

  private buildPayloadFromForm(): AfiliacionCreateDto {
    const v = this.form.getRawValue();

    const rr: string | null = v.rr || null;
    const pp: string | null = v.pp || null;
    const dd: string | null = v.dd || null;

    const payload: AfiliacionCreateDto = {
      numficha: v.numficha?.toString()?.trim() || null,
      fechaafiliacion: this.formatDateYYYYMMDD(v.fechaafiliacion),

      nombres: (v.nombres || '').toString().trim(),
      apellidopaterno: (v.apellidopaterno || '').toString().trim(),
      apellidomaterno: v.apellidomaterno?.toString()?.trim() || null,

      idtipodocumento: v.idtipodocumento,
      docafiliado: v.docafiliado?.toString()?.trim() || null,

      fechanacimiento: this.formatDateYYYYMMDD(v.fechanacimiento),
      edadafiliado: Number(v.edadafiliado ?? 0),
      sexo: v.sexo,
      idestadocivil: v.idestadocivil,
      lugarnacimiento: v.lugarnacimiento?.toString()?.trim() || null,

      rr, pp, dd,
      ubigeo: dd || pp || rr || null, // prioriza el más específico

      avenida: v.avenida?.toString()?.trim() || null,
      numero: v.numero?.toString()?.trim() || null,
      urbanizacion: v.urbanizacion?.toString()?.trim() || null,

      telefono: v.telefono?.toString()?.trim() || null,
      correo: (v.correo || '').toString().trim(),

      estado_text: v.estado_text,
      estado: v.estado_text === 'ACTIVO' ? 1 : 0,
      observacion: v.observacion?.toString()?.trim() || null,

      usuario_creacion: this.usuario,

      archivosMeta: {
        foto: this.safeFileMeta(v.foto),
        fichaafiliacionfile: this.safeFileMeta(v.fichaafiliacionfile),
        hojadevida: this.safeFileMeta(v.hojadevida),
        copiadocumento: this.safeFileMeta(v.copiadocumento),
      }
    };

    return payload;
  }

  // async guardarAfiliacion(): Promise<void> {
  //   this.isBlockSave = true;

  //   if (this.form.invalid) {
  //     this.markAllAsTouched();
  //     this.isBlockSave = false;
  //     Swal.fire('Error', 'Por favor, complete todos los campos obligatorios.', 'error');
  //     return;
  //   }

  //   console.log(this.form.value);

  //   try {
  //     const model = this.buildPayloadFromForm();
  //     const raw = this.form.getRawValue();

  //     const resp = await this.afiliacionesSrv.registrarAfiliacion(model, {
  //       foto: raw.foto,
  //       fichaafiliacionfile: raw.fichaafiliacionfile,
  //       hojadevida: raw.hojadevida,
  //       copiadocumento: raw.copiadocumento
  //     });
  //     console.log('OK', resp);

  //     // éxito: cierra y devuelve respuesta del back (o el modelo)
  //     this.dialogRef.close(resp ?? model);

  //   } catch (err: any) {
  //     console.error('Error al registrar afiliación:', err);
  //     alert(err?.error?.message || 'Hubo un error al registrar. Intente nuevamente.');
  //     this.isBlockSave = false;
  //     return;
  //   }
  // }
  async guardarAfiliacion(): Promise<void> {
    if (this.isBlockSave) return;
    this.isBlockSave = true;

    if (this.form.invalid) {
      this.markAllAsTouched();
      this.isBlockSave = false;
      await Swal.fire('Campos incompletos', 'Completa los obligatorios.', 'warning');
      return;
    }

    try {
      const model = this.buildPayloadFromForm();
      const raw = this.form.getRawValue();

      const resp = await this.afiliacionesSrv.registrarAfiliacion(model, {
        foto: raw.foto,
        fichaafiliacionfile: raw.fichaafiliacionfile,
        hojadevida: raw.hojadevida,
        copiadocumento: raw.copiadocumento
      });

      // ⚙️ interpretar respuesta del backend
      if (resp?.ok === false) {
        await Swal.fire({
          icon: 'warning',
          title: 'No se pudo registrar',
          text: resp.message || 'Verifica los datos, ya existe un registro similar.'
        });
        return;
      }

      // ✅ éxito
      await Swal.fire({
        icon: 'success',
        title: 'Afiliación registrada',
        text: resp.message || 'Registro exitoso.',
        showConfirmButton: false,
        timer: 1400
      });

      this.dialogRef.close(resp);
    } catch (err: any) {
      const msg =
        err?.error?.message ||
        err?.message ||
        'Hubo un error inesperado al registrar.';
      await Swal.fire({ icon: 'error', title: 'Error', text: msg });
    } finally {
      this.isBlockSave = false;
    }
  }


  // ===== Ubigeos =====
  private setupUbigeos(list: UbigeoItem[]) {
    const clean = (list || []).filter(x => x?.codubicacion?.trim()?.length >= 2);

    const rrSeen = new Map<string, string>();

    for (const it of clean) {
      const rr = it.codubicacion.substring(0, 2);   // región
      const rrpp = it.codubicacion.substring(0, 4); // provincia

      if (!this.byRR.has(rr)) this.byRR.set(rr, []);
      this.byRR.get(rr)!.push(it);

      if (!this.byRRPP.has(rrpp)) this.byRRPP.set(rrpp, []);
      this.byRRPP.get(rrpp)!.push(it);

      if (!rrSeen.has(rr)) rrSeen.set(rr, it.region?.trim() || `Región ${rr}`);
    }

    this.regiones = Array.from(rrSeen.entries()).map(([rr, nombre]) => ({
      id: rr,
      nombre,
      code: rr,
      display: `${nombre} (${rr})`
    }));
  }

  private buildProvincias(rr: string): Opcion[] {
    const provSeen = new Map<string, string>(); // RRPP -> nombre
    const items = this.byRR.get(rr) || [];
    for (const it of items) {
      const rrpp = it.codubicacion.substring(0, 4);
      if (!provSeen.has(rrpp)) provSeen.set(rrpp, it.provincia?.trim() || `Prov ${rrpp}`);
    }
    return Array.from(provSeen.entries())
      .map(([rrpp, nombre]) => ({
        id: rrpp,
        nombre,
        code: rrpp,
        display: `${nombre} (${rrpp})`
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }

  private buildDistritos(rrpp: string): Opcion[] {
    const distSeen = new Map<string, string>(); // RRPPDD -> nombre
    const items = this.byRRPP.get(rrpp) || [];
    for (const it of items) {
      const rrppdd = it.codubicacion.substring(0, 6);
      if (!distSeen.has(rrppdd)) distSeen.set(rrppdd, it.distrito?.trim() || `Dist ${rrppdd}`);
    }
    return Array.from(distSeen.entries())
      .map(([rrppdd, nombre]) => ({
        id: rrppdd,
        nombre,
        code: rrppdd,
        display: `${nombre} (${rrppdd})`
      }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }


  onFileSelect(
    controlName: 'foto' | 'fichaafiliacionfile' | 'hojadevida' | 'copiadocumento',
    ev: Event
  ) {
    const input = ev.target as HTMLInputElement;
    const file = input?.files && input.files.length ? input.files[0] : null;
    if (!file) return;

    // 🔹 Definir tipos y tamaños permitidos
    let validTypes: string[] = [];
    let maxSizeBytes = 0;

    if (controlName === 'foto') {
      validTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
      maxSizeBytes = 200 * 1024; // 200 KB
    } else {
      validTypes = ['application/pdf'];
      maxSizeBytes = 2 * 1024 * 1024; // 2 MB
    }

    // 🔹 Validar tipo
    if (!validTypes.includes(file.type)) {
      alert(controlName === 'foto' ? 'Solo imágenes (PNG/JPG/WEBP).' : 'Solo PDF.');
      input.value = ''; // reset
      return;
    }

    // 🔹 Validar tamaño
    if (file.size > maxSizeBytes) {
      const sizeText = controlName === 'foto' ? '200 KB' : '2 MB';
      alert(`El archivo supera el límite de ${sizeText}.`);
      input.value = '';
      return;
    }

    // 🔹 Guardar en el FormControl
    this.form.get(controlName)?.setValue(file);
    this.form.get(controlName)?.markAsDirty();

    // 🔹 Resetear el input para permitir volver a elegir la misma foto después
    input.value = '';
  }

  removeFile(controlName: 'foto' | 'fichaafiliacionfile' | 'hojadevida' | 'copiadocumento') {
    this.form.get(controlName)?.setValue(null);
    this.form.get(controlName)?.markAsDirty();
  }

  previewImage(controlName: 'foto') {
    const f = this.form.get(controlName)?.value as File | null;
    if (!f) return;
    const url = URL.createObjectURL(f);
    window.open(url, '_blank'); // abre en nueva pestaña
  }

  // ===== Acciones =====
  onNoClick(): void {
    this.dialogRef.close();
  }

  // ===== Utils =====
  get f() { return this.form.controls; }

  private markAllAsTouched() {
    Object.values(this.form.controls).forEach(c => c.markAsTouched());
  }

  private calcEdad(birth: Date): number {
    const hoy = new Date();
    let e = hoy.getFullYear() - birth.getFullYear();
    const m = hoy.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < birth.getDate())) e--;
    return Math.max(0, e);
  }


  private formatDateYYYYMMDD(d: Date | null): string | null {
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  private safeFileMeta(f?: File | null) {
    return f ? { name: f.name, size: f.size, type: f.type } : undefined;
  }

}
