import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FiltroAfiliacion, ListarAfiliacion } from './models/afiliacion';
import { AfiliacionesService } from '../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';

type Id = string;
type Doc = 'DNI' | 'CE' | 'PAS';

@Component({
  selector: 'app-afiliaciones',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './afiliaciones.component.html',
  styleUrl: './afiliaciones.component.css'
})


export class AfiliacionesComponent implements OnInit {

  
  // filtros UI
  fRegion = '';
  fProvincia = '';
  fDistrito = '';
  fQ = '';

  // catálogos derivados de la data
  regiones: string[] = [];
  provincias: string[] = [];
  distritos: string[] = [];

  // datos
  lista: ListarAfiliacion[] = [];
  listaFiltrada: ListarAfiliacion[] = [];

  // puedes setear esto según tu sesión
  perfil: 'ADMIN' | 'USUARIO' = 'ADMIN';
  usuario: string = 'admin';

  // modal (placeholders, si ya tienes lógica reemplaza)
  showModal = false;
  readOnly = false;
  editId: number | null = null;
  model: any = {};
  tiposDoc = ['DNI', 'CE', 'PAS'];

  constructor(private svc: AfiliacionesService) {}

  ngOnInit(): void {
    this.buscar(); // carga inicial
  }

  // Llama al API
  buscar(): void {
    const filtro: FiltroAfiliacion = {
      region: this.nullIfEmpty(this.fRegion),
      provincia: this.nullIfEmpty(this.fProvincia),
      distrito: this.nullIfEmpty(this.fDistrito),
      perfil: this.perfil,
      usuario: this.usuario
    };

    this.svc.listarAfiliaciones(filtro).subscribe({
      next: (data) => {
        this.lista = data ?? [];
        this.rebuildUbigeoCatalogs();
        this.applyFilter();
      },
      error: (err) => {
        console.error('Error al listar afiliaciones:', err);
        this.lista = [];
        this.listaFiltrada = [];
        this.regiones = [];
        this.provincias = [];
        this.distritos = [];
      }
    });
  }

  // Filtro mientras escribe
  applyFilter(): void {
    const q = (this.fQ || '').trim().toLowerCase();

    // Filtrado por texto + por selectores (región/provincia/distrito ya aplican al pedir al backend,
    // pero igual reafirmamos por si cambias el texto sin volver a invocar)
    this.listaFiltrada = this.lista.filter(a => {
      const matchesText =
        q.length === 0 ||
        [
          a.idafiliacion?.toString() ?? '',
          a.numficha ?? '',
          a.docafiliado ?? '',
          a.nombres ?? '',
          a.apellidopaterno ?? '',
          a.apellidomaterno ?? '',
          a.estado_text ?? '',
          a.region ?? '',
          a.provincia ?? '',
          a.distrito ?? '',
          a.usuariocreacion ?? ''
        ].some(v => v.toLowerCase().includes(q));

      const cod = (a.codubicacion ?? '').trim();
      const r = cod.substring(0, 2);
      const p = cod.substring(2, 4);
      const d = cod.substring(4, 6);

      const matchesUbigeo =
        (this.fRegion === '' || r === this.fRegion) &&
        (this.fProvincia === '' || p === this.fProvincia) &&
        (this.fDistrito === '' || d === this.fDistrito);

      return matchesText && matchesUbigeo;
    });
  }

  // Cambios de selects
  onRegionChange(): void {
    this.fProvincia = '';
    this.fDistrito = '';
    this.rebuildProvincias();
    this.distritos = [];
    this.buscar(); // vuelve a pedir con el nuevo filtro
  }

  onProvinciaChange(): void {
    this.fDistrito = '';
    this.rebuildDistritos();
    this.buscar();
  }

  // Construye catálogos (RR, PP, DD) desde la data cargada
  private rebuildUbigeoCatalogs(): void {
    const setR = new Set<string>();
    const setP = new Set<string>();
    const setD = new Set<string>();

    for (const a of this.lista) {
      const cod = (a.codubicacion ?? '').trim();
      if (cod.length >= 6) {
        setR.add(cod.substring(0, 2));
        if (!this.fRegion || cod.substring(0, 2) === this.fRegion) {
          setP.add(cod.substring(2, 4));
          if (!this.fProvincia || cod.substring(2, 4) === this.fProvincia) {
            setD.add(cod.substring(4, 6));
          }
        }
      }
    }

    this.regiones = Array.from(setR).sort();
    // Si ya hay seleccionadas, rearmar dependientes
    this.rebuildProvincias(setP);
    this.rebuildDistritos(setD);
  }

  private rebuildProvincias(prebuilt?: Set<string>): void {
    if (prebuilt) {
      this.provincias = Array.from(prebuilt).sort();
      return;
    }
    const set = new Set<string>();
    for (const a of this.lista) {
      const cod = (a.codubicacion ?? '').trim();
      if (cod.length >= 6 && cod.substring(0, 2) === this.fRegion) {
        set.add(cod.substring(2, 4));
      }
    }
    this.provincias = Array.from(set).sort();
  }

  private rebuildDistritos(prebuilt?: Set<string>): void {
    if (prebuilt) {
      this.distritos = Array.from(prebuilt).sort();
      return;
    }
    const set = new Set<string>();
    for (const a of this.lista) {
      const cod = (a.codubicacion ?? '').trim();
      if (cod.length >= 6 &&
          cod.substring(0, 2) === this.fRegion &&
          cod.substring(2, 4) === this.fProvincia) {
        set.add(cod.substring(4, 6));
      }
    }
    this.distritos = Array.from(set).sort();
  }

  // Utils
  nullIfEmpty(v?: string | null): string | null {
    return v && v.trim() !== '' ? v.trim() : null;
  }

  // Stubs de acciones (completa con tu lógica)
  registrar(): void { this.showModal = true; this.readOnly = false; this.editId = null; this.model = {}; }
  editar(a: ListarAfiliacion): void { this.showModal = true; this.readOnly = false; this.editId = a.idafiliacion; this.model = { ...a }; }
  eliminar(a: ListarAfiliacion): void { console.log('eliminar', a); }
  ver(a: ListarAfiliacion): void { this.showModal = true; this.readOnly = true; this.model = { ...a }; }
  cerrar(): void { this.showModal = false; }
  guardar(): void { /* TODO: persistir */ this.cerrar(); }

  trackById(_i: number, a: ListarAfiliacion) { return a.idafiliacion; }
}
