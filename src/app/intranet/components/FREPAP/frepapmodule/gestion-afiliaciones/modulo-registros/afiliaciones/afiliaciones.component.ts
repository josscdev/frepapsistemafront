import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DistritoOption, FiltroAfiliacion, ListarAfiliacion, ListarOpcionUbigeo, ProvinciaOption, RegionOption } from './models/afiliacion';
import { AfiliacionesService } from '../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';

type Id = string;
type Doc = 'DNI' | 'CE' | 'PAS';

@Component({
  selector: 'app-afiliaciones',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './afiliaciones.component.html',
  styleUrl: './afiliaciones.component.css'
})


export class AfiliacionesComponent implements OnInit {


  // filtros UI
  fRegion: string | null = null;    // RR
  fProvincia: string | null = null; // PP
  fDistrito: string | null = null;  // DD
  fQ = '';

  // catálogos derivados de la data
  regiones: RegionOption[] = [];
  provincias: ProvinciaOption[] = [];
  distritos: DistritoOption[] = [];

  // dataset completo de la función única (si la usas)
  ubigeoData: ListarOpcionUbigeo[] = [];


  // datos
  lista: ListarAfiliacion[] = [];
  listaFiltrada: ListarAfiliacion[] = [];

  // puedes setear esto según tu sesión
  perfil: 'ADMIN' | 'USUARIO' = 'ADMIN';
  usuario: string = 'admin';
  idemppaisnegcue = 1;
  pais = 1;

  // modal (placeholders, si ya tienes lógica reemplaza)
  showModal = false;
  readOnly = false;
  editId: number | null = null;
  model: any = {};
  tiposDoc = ['DNI', 'CE', 'PAS'];

  constructor(private svc: AfiliacionesService) { }

  ngOnInit(): void {
    this.buscar(); // carga inicial
    this.listarUbigeo();
  }

  // Llama al API
  listarUbigeo(): void {
    this.svc.listarUbigeo(this.idemppaisnegcue, this.pais).subscribe(data => {
      this.ubigeoData = data;

      // construir regiones únicas
      this.regiones = Array.from(
        new Map(data.map(x => [x.rr, x.region])).entries()
      ).map(([codigo, nombre]) => ({ codigo, nombre }));

      // inicia sin selección (null => “Todos”)
      this.fRegion = null;
      this.fProvincia = null;
      this.fDistrito = null;

      // con región null no hay provincias/distritos filtradas todavía
      this.provincias = [];
      this.distritos = [];
    });
  }

  // Llama al API
  buscar(): void {
    const filtro: FiltroAfiliacion = {
      region: this.fRegion,       // null => Todos (RR)
      provincia: this.fProvincia, // null => Todos (PP)
      distrito: this.fDistrito,   // null => Todos (DD)
      perfil: this.perfil, // si es ADMIN, muestra todo, si es otro perfil, muestra solo su data segun this.usuario
      usuario: this.usuario,
    };

    this.svc.listarAfiliaciones(filtro).subscribe({
      next: (data) => {
        this.lista = data ?? [];
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

  // Si filtras en front además, usa null-checks:
  applyFilter(): void {
    const q = (this.fQ || '').trim().toLowerCase();
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
        (this.fRegion == null || r === this.fRegion) &&
        (this.fProvincia == null || p === this.fProvincia) &&
        (this.fDistrito == null || d === this.fDistrito);

      return matchesText && matchesUbigeo;
    });
  }

  onRegionChange(): void {
    // reset dependientes
    this.fProvincia = null;
    this.fDistrito = null;

    // rebuild provincias según RR
    this.provincias = this.buildProvincias(this.fRegion);

    // **vaciar** lista de distritos
    this.distritos = [];
  }

  onProvinciaChange(): void {
    // reset distrito
    this.fDistrito = null;

    // rebuild distritos según RR+PP
    this.distritos = this.buildDistritos(this.fRegion, this.fProvincia);
  }

  // helpers
  private buildProvincias(rr: string | null) {
    if (!rr) return [];
    const m = new Map<string, string>();
    for (const x of this.ubigeoData) if (x.rr === rr) if (!m.has(x.pp)) m.set(x.pp, x.subregion);
    return Array.from(m, ([codigo, nombre]) => ({ codigo, nombre }));
  }
  private buildDistritos(rr: string | null, pp: string | null) {
    if (!rr || !pp) return [];
    const m = new Map<string, string>();
    for (const x of this.ubigeoData) if (x.rr === rr && x.pp === pp) if (!m.has(x.dd)) m.set(x.dd, x.localidad);
    return Array.from(m, ([codigo, nombre]) => ({ codigo, nombre }));
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
