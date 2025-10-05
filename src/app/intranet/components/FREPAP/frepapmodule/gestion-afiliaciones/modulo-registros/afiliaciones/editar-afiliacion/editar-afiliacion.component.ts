import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AfiliacionesService } from '../../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';
import Swal from 'sweetalert2';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { NgSelectModule } from '@ng-select/ng-select';

type UbigeoItem = { codubicacion: string; region?: string; provincia?: string; distrito?: string };

@Component({
  selector: 'app-editar-afiliacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatDatepickerModule, MatNativeDateModule,MatFormFieldModule, MatButtonModule, NgSelectModule],
  templateUrl: './editar-afiliacion.component.html',
  styleUrls: ['./editar-afiliacion.component.css']
})
export class EditarAfiliacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditarAfiliacionComponent>);
  private svc = inject(AfiliacionesService);
  private sanitizer= inject(DomSanitizer);
  fileFoto: File|null = null;
  fileFicha: File|null = null;
  fileHv: File|null = null;
  fileCopia: File|null = null;

  form!: FormGroup;
  loading = true;

  // catálogos mínimos para mostrar — si quieres selects, puedes armar como en Registrar
  regiones: { id: string; nombre: string }[] = [];
  provincias: { id: string; nombre: string }[] = [];
  distritos: { id: string; nombre: string }[] = [];
  // Cache para filtrar rápido
private byRR = new Map<string, UbigeoItem[]>();   // RR -> items
private byRRPP = new Map<string, UbigeoItem[]>(); // RRPP -> items

// Reutiliza los catálogos como en Registrar
sexosList = [
  { id: 'M', nombre: 'Masculino', code: 'M', display: 'Masculino' },
  { id: 'F', nombre: 'Femenino',  code: 'F', display: 'Femenino'  },
];
tiposDocumento: Array<{ idtipodocumento: any; nombretipodocumento: string }> = [];
estadosCiviles: Array<{ idestadocivil: any; nombreestadocivil: string }> = [];

  idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue')) || 0;
  usuariomodificacion  = localStorage.getItem('user') || ''; // 👈 del LS


  constructor(
    @Inject(MAT_DIALOG_DATA)
    public data: { idafiliacion: number; ubigeos: UbigeoItem[] }
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      // mismos nombres que usarás luego para editar
      numficha: [null],
      fechaafiliacion: [null],
      nombres: [null],
      apellidopaterno: [null],
      apellidomaterno: [null],
      idtipodocumento: [null],
      docafiliado: [null],
      fechanacimiento: [null],
      edadafiliado: [null],
      sexo: [null],
      idestadocivil: [null],
      lugarnacimiento: [null],

      rr: [null],
      pp: [null],
      dd: [null],
      avenida: [null],
      numero: [null],
      urbanizacion: [null],

      telefono: [null],
      correo: [null],
      observacion: [null],
      estado: [null],
      estado_text: [null],

      // archivos luego…
      fotoimg: [null],
      fichaafiliacionpdf: [null],
      hojadevidapdf: [null],
      copiadocumentopdf: [null],
      usuariomodificacion: this.usuariomodificacion ,

    });

    // inicializa catálogos rápidos
    this.initUbigeoCatalogs(this.data.ubigeos);

    // Llamarlas en ngOnInit, antes o después de this.cargar():
      this.getListarTipoDocumentos();
      this.getListarEstadosCiviles();

      // inicializa catálogos/caches
this.setupUbigeos(this.data.ubigeos);

// Cambios en RR → recalcular PP y limpiar DD
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

    // carga desde el back
    this.cargar();
  }

  // // 🔹 Función reusable
  // getSafePdf(field: 'fichaafiliacionpdf' | 'hojadevidapdf'): SafeResourceUrl | null {
  //   const rawValue = this.form.value[field];
  //   if (!rawValue) return null;
  
  //   // quitar el encabezado si lo tiene
  //   const base64 = rawValue.replace(/^data:application\/pdf;base64,/, '');
  //   const byteCharacters = atob(base64);
  //   const byteNumbers = new Array(byteCharacters.length);
  
  //   for (let i = 0; i < byteCharacters.length; i++) {
  //     byteNumbers[i] = byteCharacters.charCodeAt(i);
  //   }
  
  //   const byteArray = new Uint8Array(byteNumbers);
  //   const blob = new Blob([byteArray], { type: 'application/pdf' });
  //   const url = URL.createObjectURL(blob);
  
  //   return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  // }
  
  getSafePdf(field: 'fichaafiliacionpdf' | 'hojadevidapdf' | 'copiadocumentopdf'): SafeResourceUrl | null {
  const rawValue = this.form.value[field];
  if (!rawValue) return null;

  const base64 = rawValue.replace(/^data:application\/pdf;base64,/, '');
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  const blob = new Blob([byteArray], { type: 'application/pdf' });
  const url = URL.createObjectURL(blob);
  return this.sanitizer.bypassSecurityTrustResourceUrl(url);
}


  private initUbigeoCatalogs(list: UbigeoItem[]) {
    const rrSet = new Map<string, string>();
    const ppSet = new Map<string, string>();
    const ddSet = new Map<string, string>();

    for (const it of list) {
      const rr = it.codubicacion?.substring(0, 2);
      const pp = it.codubicacion?.substring(0, 4);
      const dd = it.codubicacion?.substring(0, 6);
      if (rr && !rrSet.has(rr)) rrSet.set(rr, it.region ?? `Región ${rr}`);
      if (pp && !ppSet.has(pp)) ppSet.set(pp, it.provincia ?? `Prov ${pp}`);
      if (dd && !ddSet.has(dd)) ddSet.set(dd, it.distrito ?? `Dist ${dd}`);
    }

    this.regiones = Array.from(rrSet, ([id, nombre]) => ({ id, nombre })).sort((a,b)=>a.nombre.localeCompare(b.nombre));
    this.provincias = Array.from(ppSet, ([id, nombre]) => ({ id, nombre })).sort((a,b)=>a.nombre.localeCompare(b.nombre));
    this.distritos = Array.from(ddSet, ([id, nombre]) => ({ id, nombre })).sort((a,b)=>a.nombre.localeCompare(b.nombre));
  }

  private cargar() {
    this.loading = true;
    this.svc.getById(this.data.idafiliacion).subscribe({
      next: (dto) => {
        console.log('getById', dto);
        // mapear DTO -> form
        const rr = dto.codubicacion?.substring(0,2) ?? null;
        const pp = dto.codubicacion?.substring(0,4) ?? null;
        const dd = dto.codubicacion?.substring(0,6) ?? null;

        this.form.patchValue({
          numficha: dto.numficha ?? null,
          fechaafiliacion: dto.fechaafiliacion ? new Date(dto.fechaafiliacion) : null,
          nombres: dto.nombres ?? null,
          apellidopaterno: dto.apellidopaterno ?? null,
          apellidomaterno: dto.apellidomaterno ?? null,
          idtipodocumento: dto.idtipodocumento ?? null,
          docafiliado: dto.docafiliado ?? null,
          fechanacimiento: dto.fechanacimiento ? new Date(dto.fechanacimiento) : null,
          edadafiliado: dto.edadafiliado ?? null,
          sexo: dto.sexo ?? null,
          idestadocivil: dto.idestadocivil ?? null,
          lugarnacimiento: dto.lugarnacimiento ?? null,

          rr, pp, dd,
          avenida: (dto as any).avenida ?? null,
          numero: (dto as any).numero ?? null,
          urbanizacion: (dto as any).urbanizacion ?? null,

          telefono: (dto as any).telefono ?? (dto as any).celular ?? null,
          correo: dto.correo ?? null,
          observacion: dto.observacion ?? (dto as any).observacionficha ?? null,
          estado: dto.estado ?? null,
          estado_text: (dto as any).estado_text ?? (dto.estado === 1 ? 'ACTIVO' : 'INACTIVO'),

          fotoimg: dto.fotoimg ?? null,
          fichaafiliacionpdf: dto.fichaafiliacionpdf ?? null,
          hojadevidapdf: dto.hojadevidapdf ?? null,
          copiadocumentopdf: (dto as any).copiadocumentopdf ?? (dto as any).copiadocumento ?? null

        });
      },
      error: (err) => {
        console.error('Error getById', err);
        this.dialogRef.close();
      },
      complete: () => this.loading = false
    });
  }


  // >>> llama al back
  async guardar() {
    const id = this.data.idafiliacion;
    const model = this.form.getRawValue();

    console.log('usuariomodificacion', this.form.value.usuariomodificacion);

    const fd = this.svc.buildUpdateFormData(model, {
      foto:  this.fileFoto,
      ficha: this.fileFicha,
      hv:    this.fileHv,
      copia: this.fileCopia
    });


    console.log('fd', fd);
    this.loading = true;
    this.svc.update(id, fd).subscribe({
      next: (res) => {
        if (!res.ok) {
          Swal.fire('Error', res.error || 'No se pudo actualizar.', 'error');
          return;
        }
        Swal.fire('OK', 'Afiliación actualizada.', 'success');
        this.dialogRef.close(true);   // notifica al padre para refrescar
      },
      error: (err) => {
        console.error(err);
        Swal.fire('Error', err?.error?.message || 'Fallo al actualizar', 'error');
      },
      complete: () => this.loading = false
    });
  }

  // ====== validación y captura de archivos (idéntico a Registrar) ======
  onFilePick(kind: 'foto'|'ficha'|'hv'|'copia', ev: Event) {
    const input = ev.target as HTMLInputElement;
    const f = input?.files && input.files.length ? input.files[0] : null;
    if (!f) return;

    let ok = true, msg = '';
    if (kind === 'foto') {
      const types = ['image/png','image/jpeg','image/jpg','image/webp'];
      if (!types.includes(f.type)) { ok = false; msg = 'Solo imágenes (PNG/JPG/WEBP).'; }
      if (f.size > 200*1024)       { ok = false; msg = 'La foto supera 200 KB.'; }
    } else {
      if (f.type !== 'application/pdf') { ok = false; msg = 'Solo PDF.'; }
      if (f.size > 2*1024*1024)         { ok = false; msg = 'El PDF supera 2 MB.'; }
    }
    if (!ok) { Swal.fire('Archivo inválido', msg, 'warning'); input.value = ''; return; }

    if (kind === 'foto')  this.fileFoto = f;
    if (kind === 'ficha') this.fileFicha = f;
    if (kind === 'hv')    this.fileHv = f;
    if (kind === 'copia') this.fileCopia = f;

    input.value = ''; // permitir re-seleccionar el mismo archivo
  }

  removeFile(kind: 'foto'|'ficha'|'hv'|'copia') {
    if (kind === 'foto')  this.fileFoto = null;
    if (kind === 'ficha') this.fileFicha = null;
    if (kind === 'hv')    this.fileHv = null;
    if (kind === 'copia') this.fileCopia = null;
  }


  private dataUrlToBlobUrl(dataUrl: string) {
  const [meta, b64] = dataUrl.split(',');
  const mime = (meta.match(/data:(.*?);base64/) || [])[1] || 'application/octet-stream';
  const bin = atob(b64);
  const len = bin.length;
  const u8 = new Uint8Array(len);
  for (let i = 0; i < len; i++) u8[i] = bin.charCodeAt(i);
  const blob = new Blob([u8], { type: mime });
  const url = URL.createObjectURL(blob);
  return { blob, url };
}

openDataUrlInNewTab(dataUrl?: string) {
  if (!dataUrl) return;
  const { url } = this.dataUrlToBlobUrl(dataUrl);
  window.open(url, '_blank');                // ✅ ya no es data:, es blob:
  setTimeout(() => URL.revokeObjectURL(url), 60_000); // liberar memoria luego
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




  cerrar() { this.dialogRef.close(); }


  today = new Date();



getListarTipoDocumentos() {
  this.svc.listarTipoDocumentos(this.idemppaisnegcue).subscribe({
    next: (data) => {
      this.tiposDocumento = data.map((it: any) => ({
        idtipodocumento: it.idtipodocumento,
        nombretipodocumento: `(${it.abreviatura}) ${it.nombretipodocumento}`
      }));
    }
  });
}

getListarEstadosCiviles() {
  this.svc.listarEstadosCiviles(this.idemppaisnegcue).subscribe({
    next: (data) => this.estadosCiviles = data
  });
}

private setupUbigeos(list: UbigeoItem[]) {
  const clean = (list || []).filter(x => x?.codubicacion?.trim()?.length >= 2);
  const rrSeen = new Map<string, string>();

  for (const it of clean) {
    const rr = it.codubicacion.substring(0, 2);
    const rrpp = it.codubicacion.substring(0, 4);

    if (!this.byRR.has(rr)) this.byRR.set(rr, []);
    this.byRR.get(rr)!.push(it);

    if (!this.byRRPP.has(rrpp)) this.byRRPP.set(rrpp, []);
    this.byRRPP.get(rrpp)!.push(it);

    if (!rrSeen.has(rr)) rrSeen.set(rr, it.region?.trim() || `Región ${rr}`);
  }

  this.regiones = Array.from(rrSeen.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a,b)=>a.nombre.localeCompare(b.nombre));
}

private buildProvincias(rr: string) {
  const provSeen = new Map<string, string>(); // RRPP -> nombre
  const items = this.byRR.get(rr) || [];
  for (const it of items) {
    const rrpp = it.codubicacion.substring(0, 4);
    if (!provSeen.has(rrpp)) provSeen.set(rrpp, it.provincia?.trim() || `Prov ${rrpp}`);
  }
  return Array.from(provSeen.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a,b)=>a.nombre.localeCompare(b.nombre));
}

private buildDistritos(rrpp: string) {
  const distSeen = new Map<string, string>(); // RRPPDD -> nombre
  const items = this.byRRPP.get(rrpp) || [];
  for (const it of items) {
    const id = it.codubicacion.substring(0, 6);
    if (!distSeen.has(id)) distSeen.set(id, it.distrito?.trim() || `Dist ${id}`);
  }
  return Array.from(distSeen.entries())
    .map(([id, nombre]) => ({ id, nombre }))
    .sort((a,b)=>a.nombre.localeCompare(b.nombre));
}


}
