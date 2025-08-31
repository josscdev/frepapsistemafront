import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

type Id = string;
type Doc = 'DNI' | 'CE' | 'PAS';

interface Afiliado {
  id: Id;
  nroAfili?: string;
  fechaAfiliacion?: string; // yyyy-mm-dd
  nombres: string;
  apPaterno: string;
  apMaterno?: string;
  tipoDocumento: Doc;
  nroDocumento: string;
  fechaNacimiento?: string;
  edad?: number;
  estado?: 'ACTIVO' | 'INACTIVO';

  region?: string;
  provincia?: string;
  distrito?: string;

  correo?: string;
  telefono?: string;
  observacion?: string;
}

@Component({
  selector: 'app-afiliaciones',
  standalone: true,
  imports: [FormsModule,CommonModule],
  templateUrl: './afiliaciones.component.html',
  styleUrl: './afiliaciones.component.css'
})


export class AfiliacionesComponent {

  
  // --- Catálogos simples ---
  tiposDoc: Doc[] = ['DNI','CE','PAS'];
  ubigeo: Record<string, Record<string, string[]>> = {
    'Lima': {
      'Lima': ['Miraflores','San Isidro','Villa El Salvador','Comas'],
      'Huaral': ['Chancay','Aucallama']
    },
    'Cusco': {
      'Cusco': ['Cusco','San Sebastián'],
      'Urubamba': ['Urubamba','Ollantaytambo']
    }
  };
  regiones = Object.keys(this.ubigeo);
  provincias: string[] = [];
  distritos: string[] = [];

  // --- Filtros ---
  fRegion = '';
  fProvincia = '';
  fDistrito = '';
  fQ = '';

  // --- Datos en memoria ---
  afiliados: Afiliado[] = [
    {
      id: crypto.randomUUID(),
      nroAfili: 'A-0001',
      fechaAfiliacion: '2025-08-01',
      nombres: 'Juan',
      apPaterno: 'Pérez',
      apMaterno: 'Gómez',
      tipoDocumento: 'DNI',
      nroDocumento: '12345678',
      region: 'Lima',
      provincia: 'Lima',
      distrito: 'Miraflores',
      estado: 'ACTIVO',
      correo: 'juan@correo.com'
    }
  ];

  // --- Modal / edición ---
  showModal = false;
  readOnly = false;
  editId: Id | null = null;
  model: Afiliado = this.nuevo();

  // --- Helpers ---
  get listaFiltrada(): Afiliado[] {
    return this.afiliados
      .filter(a => !this.fRegion || a.region === this.fRegion)
      .filter(a => !this.fProvincia || a.provincia === this.fProvincia)
      .filter(a => !this.fDistrito || a.distrito === this.fDistrito)
      .filter(a => {
        const q = this.fQ.toLowerCase().trim();
        if (!q) return true;
        return [a.nombres, a.apPaterno, a.apMaterno, a.nroDocumento, a.nroAfili]
          .filter(Boolean)
          .some(v => String(v).toLowerCase().includes(q));
      });
  }

  // --- Acciones de filtros (encadenado) ---
  onRegionChange() {
    this.provincias = this.fRegion ? Object.keys(this.ubigeo[this.fRegion]) : [];
    this.fProvincia = ''; this.fDistrito = '';
    this.distritos = [];
  }
  onProvinciaChange() {
    this.distritos = (this.fRegion && this.fProvincia)
      ? this.ubigeo[this.fRegion][this.fProvincia]
      : [];
    this.fDistrito = '';
  }

  // --- CRUD básico en memoria ---
  registrar() {
    this.readOnly = false;
    this.editId = null;
    this.model = this.nuevo();
    this.showModal = true;
  }

  editar(a: Afiliado) {
    this.readOnly = false;
    this.editId = a.id;
    this.model = JSON.parse(JSON.stringify(a)); // copia simple
    this.showModal = true;
  }

  ver(a: Afiliado) {
    this.editar(a);
    this.readOnly = true;
  }

  eliminar(a: Afiliado) {
    if (!confirm('¿Eliminar el registro?')) return;
    this.afiliados = this.afiliados.filter(x => x.id !== a.id);
  }

  guardar() {
    // edad simple si hay fecha
    if (this.model.fechaNacimiento) {
      this.model.edad = this.calcularEdad(this.model.fechaNacimiento);
    }
    if (this.editId) {
      this.afiliados = this.afiliados.map(x => x.id === this.editId ? { ...this.model, id: this.editId! } : x);
    } else {
      this.afiliados = [{ ...this.model, id: crypto.randomUUID() }, ...this.afiliados];
    }
    this.cerrar();
  }

  cerrar() {
    this.showModal = false;
    this.readOnly = false;
    this.editId = null;
    this.model = this.nuevo();
  }

  // --- Utilidades ---
  private nuevo(): Afiliado {
    return {
      id: '',
      tipoDocumento: 'DNI',
      estado: 'ACTIVO',
      nombres: '',
      apPaterno: '',
      nroDocumento: ''
    };
  }

  private calcularEdad(iso: string): number {
    const d = new Date(iso);
    const t = new Date();
    let e = t.getFullYear() - d.getFullYear();
    const m = t.getMonth() - d.getMonth();
    if (m < 0 || (m === 0 && t.getDate() < d.getDate())) e--;
    return e;
  }
}
