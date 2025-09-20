import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { AfiliacionesService } from '../../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';

type UbigeoItem = { codubicacion: string; region?: string; provincia?: string; distrito?: string };

@Component({
  selector: 'app-editar-afiliacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatInputModule, MatDatepickerModule, MatNativeDateModule],
  templateUrl: './editar-afiliacion.component.html',
  styleUrls: ['./editar-afiliacion.component.css']
})
export class EditarAfiliacionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<EditarAfiliacionComponent>);
  private svc = inject(AfiliacionesService);

  form!: FormGroup;
  loading = true;

  // catálogos mínimos para mostrar — si quieres selects, puedes armar como en Registrar
  regiones: { id: string; nombre: string }[] = [];
  provincias: { id: string; nombre: string }[] = [];
  distritos: { id: string; nombre: string }[] = [];

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
    });

    // inicializa catálogos rápidos
    this.initUbigeoCatalogs(this.data.ubigeos);

    // carga desde el back
    this.cargar();
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
          hojadevidapdf: dto.hojadevidapdf ?? null
        });
      },
      error: (err) => {
        console.error('Error getById', err);
        this.dialogRef.close();
      },
      complete: () => this.loading = false
    });
  }

  cerrar() { this.dialogRef.close(); }
}
