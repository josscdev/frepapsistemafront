import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DistritoOption, FiltroAfiliacion, ListarAfiliacion, ListarOpcionUbigeo, ProvinciaOption, RegionOption } from './models/afiliacion';
import { AfiliacionesService } from '../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';
import { RegistrarAfiliacionComponent } from './registrar-afiliacion/registrar-afiliacion.component';
import { MatDialog } from '@angular/material/dialog';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;


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

  constructor(private svc: AfiliacionesService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.buscar(); // carga inicial
    this.listarUbigeo();

    this.convertUrlToBase64('assets/img/frepap/frep_sinfondo.png').then(base64 => {
      this.BANNER_BASE64 = base64;
    });
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
          a.subregion ?? '',
          a.localidad ?? '',
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
  // registrar(): void { this.showModal = true; this.readOnly = false; this.editId = null; this.model = {}; }
  editar(a: ListarAfiliacion): void { this.showModal = true; this.readOnly = false; this.editId = a.idafiliacion; this.model = { ...a }; }
  eliminar(a: ListarAfiliacion): void { console.log('eliminar', a); }
  ver(a: ListarAfiliacion): void { this.showModal = true; this.readOnly = true; this.model = { ...a }; }
  cerrar(): void { this.showModal = false; }
  guardar(): void { /* TODO: persistir */ this.cerrar(); }

  registrar(): void {
    this.dialog.open(RegistrarAfiliacionComponent, {
      width: '900px',
      autoFocus: false,
      panelClass: 'dlg-afiliacion',
      data: {
        ubigeos: this.ubigeoData.map(u => ({
          codubicacion: u.codubicacion || u.codubicacion,   // asegúrate de 6 dígitos
          region: u.region || u.region,
          provincia: u.subregion || u.subregion,
          distrito: u.localidad || u.localidad
        }))
      } // <<< PASAMOS UBIGEOS AQUÍ
    }).afterClosed().subscribe(res => {
      if (res) {
        console.log('Afiliación registrada:', res);
        // refrescar lista / notificar éxito
      }
    });
  }

  // Imagen del banner superior (opcional). Coloca aquí tu base64 si lo tienes.
  private BANNER_BASE64: string | null = null; // 'data:image/png;base64,iVBORw0K...'

  async convertUrlToBase64(url: string): Promise<string> {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private safe(v: any) { return (v ?? v === 0) ? String(v) : ''; }
  private fecha(d?: string | Date | null) {
    if (!d) return '';
    const t = new Date(d);
    return `${String(t.getDate()).padStart(2, '0')}/${String(t.getMonth() + 1).padStart(2, '0')}/${t.getFullYear()}`;
  }

  imprimir(a: ListarAfiliacion) {
    // Mapea aquí tus campos reales
    const M = {
      numficha: this.safe(a.numficha),
      apPaterno: this.safe((a as any).apellidopaterno ?? (a as any).apellidoPaterno),
      apMaterno: this.safe((a as any).apellidomaterno ?? (a as any).apellidoMaterno),
      nombres: this.safe((a as any).nombres ?? (a as any).nombre),
      dni: this.safe((a as any).dni ?? (a as any).docusuario),
      fecNac: this.fecha((a as any).fechaNacimiento),
      estado: this.safe((a as any).estadoCivil),
      sexo: this.safe((a as any).sexo),
      lugarNac: this.safe((a as any).lugarNacimiento),
      region: this.safe((a as any).departamento ?? (a as any).region),
      provincia: this.safe((a as any).provincia),
      distrito: this.safe((a as any).distrito),
      avenida: this.safe((a as any).direccionVia ?? (a as any).avenida ?? (a as any).calle),
      numero: this.safe((a as any).numero),
      urb: this.safe((a as any).urbanizacion ?? (a as any).sector),
      telefono: this.safe((a as any).telefono ?? (a as any).celular),
      correo: this.safe((a as any).correo ?? (a as any).email),
      fechaAfi: this.fecha(a.fechaafiliacion),
      fotoBase64: (a as any).fotoBase64 as string | undefined
    };

    // etiqueta arriba + caja uniforme
    const label = (t: string) => ({ text: t.toUpperCase(), bold: true, fontSize: 9, margin: [2, 0, 0, 3] });
    const box = (t: string, h = 24) => ({
      table: { widths: ['*'], body: [[{ text: t, margin: [8, 6, 8, 6], fontSize: 10, height: h }]] },
      layout: {
        hLineColor: () => '#000', vLineColor: () => '#000',
        hLineWidth: () => 1, vLineWidth: () => 1
      }
    });
    const row = (labels: string[], values: string[], widths: (number | string)[], h = 24) => ({
      table: {
        widths,
        body: [labels.map(l => label(l)), values.map(v => box(v, h))]
      },
      layout: 'noBorders',
      margin: [0, 2, 0, 8]
    });

    const headerBlock = {
      columns: [
        {
          width: 390,
          table: {
            widths: ['*'],
            body: [[
              {
                stack: [
                  { text: 'FRENTE POPULAR AGRÍCOLA FIA DEL PERÚ - FREPAP', alignment: 'center', bold: true, fontSize: 10, margin: [0, 0, 0, 2] },
                  { text: 'PP000363', alignment: 'center', fontSize: 10 },
                  this.BANNER_BASE64
                    ? { image: this.BANNER_BASE64, fit: [180, 80], alignment: 'center', margin: [0, 4, 0, 8] }
                    : { text: 'LOGO', alignment: 'center', bold: true, fontSize: 12, margin: [0, 20, 0, 8] }
                ]
              }
            ]]
          },
          layout: {
            hLineColor: () => '#000',
            vLineColor: () => '#000',
            hLineWidth: () => 1,
            vLineWidth: () => 1,
          }
        },
        { width: 20, text: '' },
        {
          width: 100,
          stack: [
            { text: `FICHA N° ${M.numficha || '..........'}`, alignment: 'left', margin: [0, 0, 0, 10], bold: true },
            { canvas: [{ type: 'rect', x: 0, y: 0, w: 90, h: 110, r: 12, lineWidth: 1 }], width: 90, height: 110 },
            M.fotoBase64 ? { image: M.fotoBase64, width: 116, height: 136, margin: [2, 2, 0, 0] } : { text: '' }
          ]
        }
      ]
    };

    const doc: any = {
      pageSize: 'A4',
      pageMargins: [36, 26, 36, 120],
      content: [
        headerBlock,

        { text: 'Alcance de la organización política: Nacional (X) Regional ( ) Región: ___________', margin: [0, 12, 0, 6], fontSize: 8 },

        { text: `FECHA DE AFILIACIÓN ${M.fechaAfi || '___ / ___ / ____'}`, bold: true, margin: [0, 0, 0, 6], fontSize: 8 },

        {
          text: 'Por medio del presente manifiesto mi decisión de AFILIARME a la organización política, mediante el cual me comprometo a cumplir con su estatuto y demás normas internas. En fe de lo cual firmo el presente documento.',
          fontSize: 8, margin: [0, 0, 0, 14]
        },

        { text: 'DATOS PERSONALES', bold: true, margin: [0, 2, 0, 6] },

        // APELLIDOS / NOMBRES (tres columnas iguales)
        row(['Apellido Paterno', 'Apellido Materno', 'Nombres'], [M.apPaterno, M.apMaterno, M.nombres], ['*', '*', '*'], 26),

        // DNI / FECHA NAC / ESTADO CIVIL / SEXO (anchos fijos p/que cuadre)
        row(['DNI', 'Fecha de Nacimiento', 'Estado Civil', 'Sexo'], [M.dni, M.fecNac, M.estado, M.sexo], [110, 150, 150, 80], 26),

        // LUGAR DE NACIMIENTO
        row(['Lugar de Nacimiento'], [M.lugarNac], ['*'], 26),

        { text: 'DOMICILIO ACTUAL', bold: true, margin: [0, 6, 0, 6] },

        // REGION / PROVINCIA / DISTRITO
        row(['Región', 'Provincia', 'Distrito'], [M.region, M.provincia, M.distrito], [170, 170, 170], 26),

        // AVENIDA / NÚMERO
        row(['Avenida', 'Número'], [M.avenida, M.numero], ['*', 120], 26),

        // URBANIZACIÓN / TELÉFONO
        row(['Urbanización', 'Teléfono'], [M.urb, M.telefono], ['*', 160], 26),

        // CORREO
        row(['Correo Electrónico'], [M.correo], ['*'], 26),

        { text: ' ', margin: [0, 8, 0, 0] },
        // --- Firma + Huella (bloque estable, no se parte) ---
        // --- Firma + Huella (ajustado para caber en la misma página) ---
        // {
        //   unbreakable: true,
        //   margin: [0, 20, 0, 0],  // menos margen arriba
        //   table: {
        //     widths: ['*', 100],   // más compacto
        //     body: [
        //       [
        //         {
        //           canvas: [
        //             { type: 'line', x1: 0, y1: 0, x2: 160, y2: 0, lineWidth: 1 }
        //           ]
        //         },
        //         {
        //           canvas: [
        //             { type: 'rect', x: 0, y: 0, w: 70, h: 70, r: 8, lineWidth: 1 }
        //           ],
        //           alignment: 'center'
        //         }
        //       ],
        //       [
        //         { text: 'FIRMA DEL AFILIADO', alignment: 'center', margin: [0, 6, 0, 0], fontSize: 8 },
        //         { text: 'HUELLA DIGITAL', alignment: 'center', margin: [0, 6, 0, 0], fontSize: 8 }
        //       ]
        //     ]
        //   },
        //   layout: 'noBorders'
        // },
      ],

      footer: () => ({
        margin: [36, 0, 36, 40],
        table: {
          widths: ['*', 160],
          body: [
            [
              {
                stack: [
                  {
                    canvas: [
                      { type: 'line', x1: 0, y1: 0, x2: 220, y2: 0, lineWidth: 1 } // 👈 línea larga
                    ],
                    margin: [0, 50, 0, 2]
                  },
                  { text: 'FIRMA DEL AFILIADO', alignment: 'center', fontSize: 9 }
                ],
                alignment: 'center'
              },
              {
                stack: [
                  {
                    canvas: [
                      { type: 'rect', x: 0, y: 0, w: 90, h: 90, r: 8, lineWidth: 1 }
                    ],
                    margin: [-30, -30, 0, 2]
                  },
                  { text: 'HUELLA DIGITAL', alignment: 'center', fontSize: 9 }
                ],
                alignment: 'center'
              }
            ]
          ]
        },
        layout: 'noBorders'
      }),

      defaultStyle: { font: 'Roboto', fontSize: 10 }
    };

    pdfMake.createPdf(doc).open(); // o .download('FichaAfiliacion.pdf')
  }

  trackById(_i: number, a: ListarAfiliacion) { return a.idafiliacion; }
}
