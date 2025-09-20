import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DistritoOption, FiltroAfiliacion, FiltroAfiliacionDesactivar, ListarAfiliacion, ListarOpcionUbigeo, ProvinciaOption, RegionOption } from './models/afiliacion';
import { AfiliacionesService } from '../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';
import { RegistrarAfiliacionComponent } from './registrar-afiliacion/registrar-afiliacion.component';
import { MatDialog } from '@angular/material/dialog';

import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';

(pdfMake as any).vfs = pdfFonts.pdfMake.vfs;

import * as XLSX from 'xlsx';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
import { MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { EditarAfiliacionComponent } from './editar-afiliacion/editar-afiliacion.component';

@Component({
  selector: 'app-afiliaciones',
  standalone: true,
  imports: [FormsModule, CommonModule, MatPaginator, MatProgressSpinner],
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
  perfil: string = '';
  usuario: string = '';
  idemppaisnegcue: number = 0;
  pais: number = 0;
  menuString: any;

  // modal (placeholders, si ya tienes lógica reemplaza)
  showModal = false;
  readOnly = false;
  editId: number | null = null;
  model: any = {};
  tiposDoc = ['DNI', 'CE', 'PAS'];

  // Imagen del banner superior (opcional). Coloca aquí tu base64 si lo tienes.
  private BANNER_BASE64: string | null = null; // 'data:image/png;base64,iVBORw0K...'

  // Paginacion
  pageSize = 10; // cantidad por página
  pageIndex = 0;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(private svc: AfiliacionesService, private dialog: MatDialog, private router: Router) {
    this.menuString = (localStorage.getItem('menu') || '');
    this.usuario = (localStorage.getItem('user') || '');
    this.perfil = localStorage.getItem('perfil') || '';
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue')) || 0;
    this.pais = Number(localStorage.getItem('idpais')) || 0;

    let menu;
    if (this.menuString) {
      menu = JSON.parse(this.menuString);
      //console.log('menuu',menu);
      // Obtener la URL completa
      const url = this.router.url;
      console.log(url); // Imprime la URL completa

      let partes = url.split("/");
      // Quitamos la primera parte que es vacía y la parte "main"
      let nuevaUrl = partes.slice(2).join("/");
      console.log('nuevaurl', nuevaUrl);

      this.perfil = this.checkUrl(menu, nuevaUrl);
      // localStorage.setItem('PerfilVentas', this.perfil);
      console.log('Perfil es?', this.perfil);

    } else {
      // Manejar el caso en el que no hay menú en el localStorage
      menu = '';
    }
  }

  ngOnInit(): void {
    this.buscar(); // carga inicial
    this.listarUbigeo();

    this.actualizarLista();

    this.convertUrlToBase64('assets/img/frepap/frep_sinfondo.png').then(base64 => {
      this.BANNER_BASE64 = base64;
    });
  }

  actualizarLista(): void {
    const start = this.pageIndex * this.pageSize;
    const end = start + this.pageSize;
    this.listaFiltrada = this.lista.slice(start, end);
  }

  onPageChange(event: any): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.actualizarLista();
  }

  trackById(index: number, item: any): number {
    return item.idafiliacion;
  }

  checkUrl(menu: any, requestedPath: string): string {
    //console.log('DEBE ENTRAR checkAuthorization');
    //console.log('menu', menu);
    console.log('requestedPath', requestedPath);

    if (!menu || !Array.isArray(menu)) {
      return 'No hay menu'; // No hay menú o no es un array válido
    }

    // Recorrer los módulos en el menú
    for (const modulo of menu) {
      // Verificar si la ruta del módulo coincide
      if (modulo.rutamodulo && modulo.rutamodulo === requestedPath) {
        console.log('nombreperfilmodulo', modulo.nombreperfilmodulo);
        console.log('modulo.rutamodulo', modulo.rutamodulo);

        return modulo.nombreperfilmodulo; // La ruta solicitada está presente en el menú
      }


      //console.log('modulo.submodules', modulo.submodules);
      // Si hay submódulos, recorrerlos
      if (modulo.submodules && Array.isArray(modulo.submodules)) {
        for (const submodulo of modulo.submodules) {
          // Verificar si la ruta del submódulo coincide
          if (submodulo.rutasubmodulo && submodulo.rutasubmodulo === requestedPath) {
            console.log('nombreperfilsubmodulo', submodulo.nombreperfilsubmodulo);
            console.log('submodulo.rutasubmodulo', submodulo.rutasubmodulo);

            return submodulo.nombreperfilsubmodulo; // La ruta solicitada está presente en el menú
          }

          // Si hay ítems, recorrerlos
          if (submodulo.items && Array.isArray(submodulo.items)) {
            for (const item of submodulo.items) {
              // Verificar si la ruta del ítem coincide
              if (item.rutaitemmodulo && item.rutaitemmodulo === requestedPath) {
                console.log('nombreperfilitemmodulo', item.nombreperfilitemmodulo);
                console.log('item.rutaitemmodulo', item.rutaitemmodulo);

                return item.nombreperfilitemmodulo; // La ruta solicitada está presente en el menú
              }
            }
          }
        }
      }
    }

    return 'No esta en el menú'; // La ruta solicitada no está en el menú
  }

  // Exportar en excel
  exportarExcel(): void {
    // 🔹 Mapea los datos de la tabla con los encabezados visibles
    const data = this.lista.map((item: ListarAfiliacion) => ({
      'FICHA': item.numficha,
      'TIPO DOC': item.abreviatura,
      '# DOC.': item.docafiliado,
      'NOMBRES': item.nombres,
      'APELLIDO PATERNO': item.apellidopaterno,
      'APELLIDO MATERNO': item.apellidomaterno,
      'FECHA NACIMIENTO': this.fecha(item.fechanacimiento),
      'EDAD': item.edadafiliado,
      'ESTADO CIVIL': item.nombreestadocivil,
      'SEXO': item.sexo,
      'LUGAR NACIMIENTO': item.lugarnacimiento,
      'UBIGEO': item.codubicacion,
      'REGION': item.region,
      'PROVINCIA': item.subregion,
      'DISTRITO': item.localidad,
      'AVENIDA': item.avenida,
      'NUMERO': item.numero,
      'URBANIZACION': item.urbanizacion,
      'CELULAR': item.celular,
      'CORREO': item.correo,
      'OBSERVACION FICHA': item.observacionficha,
      'FECHA AFILIACION': this.fecha(item.fechaafiliacion),
      'ESTADO': item.estado_text,
      'USUARIO CREACION': item.usuariocreacion,
      'FECHA CREACION': this.fecha(item.fechacreacion),
      'USUARIO MODIFICACION': item.usuariomodificacion,
      'FECHA MODIFICACION': this.fecha(item.fechamodificacion),
      'USUARIO ANULACION': item.usuarioanulacion,
      'FECHA ANULACION': this.fecha(item.fechaanulacion),
    }));

    // 🔹 Crea la hoja de Excel a partir de los datos
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);

    // 🔹 Crea un libro de Excel y añade la hoja
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Afiliados');

    // 🔹 Genera el archivo y lo descarga automáticamente
    const fileName = `afiliados_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(wb, fileName);
  }

  // Llama al API
  loadingUbigeo = false;

  listarUbigeo(): void {
    this.loadingUbigeo = true;
    this.svc.listarUbigeo(this.idemppaisnegcue, this.pais).subscribe({
      next: data => {
        this.ubigeoData = data;

        // construir regiones únicas
        this.regiones = Array.from(
          new Map(data.map(x => [x.rr, x.region])).entries()
        ).map(([codigo, nombre]) => ({ codigo, nombre }));

        // inicia sin selección
        this.fRegion = null;
        this.fProvincia = null;
        this.fDistrito = null;

        this.provincias = [];
        this.distritos = [];
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        this.loadingUbigeo = false; // 🔹 detener spinner
      }
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
        console.log(this.lista);
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
        this.buscar();
        // refrescar lista / notificar éxito
      }
    });
  }

editar(a: ListarAfiliacion): void {
  this.dialog.open(EditarAfiliacionComponent, {
    width: '900px',
    autoFocus: false,
    panelClass: 'dlg-afiliacion',
    data: {
      idafiliacion: a.idafiliacion,
      ubigeos: this.ubigeoData.map(u => ({
        codubicacion: u.codubicacion,
        region: u.region,
        provincia: u.subregion,
        distrito: u.localidad
      }))
    }
  }).afterClosed().subscribe(res => {
    if (res) {
      // Si luego editas y guardas, aquí puedes refrescar la lista
      this.buscar();
    }
  });
}
  
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

  async imprimir(a: ListarAfiliacion) {
    // Mapea aquí tus campos reales
    console.log('Imprimir', a);

    const M = {
      numficha: this.safe(a.numficha),
      apPaterno: this.safe((a as any).apellidopaterno),
      apMaterno: this.safe((a as any).apellidomaterno),
      nombres: this.safe((a as any).nombres),
      dni: this.safe((a as any).docafiliado),
      fecNac: this.fecha((a as any).fechanacimiento),
      estado: this.safe((a as any).nombreestadocivil),
      sexo: this.safe((a as any).sexo),
      lugarNac: this.safe((a as any).lugarnacimiento),
      region: this.safe((a as any).region),
      subregion: this.safe((a as any).subregion),
      localidad: this.safe((a as any).localidad),
      avenida: this.safe((a as any).avenida),
      numero: this.safe((a as any).numero),
      urb: this.safe((a as any).urbanizacion),
      telefono: this.safe((a as any).celular),
      correo: this.safe((a as any).correo),
      fechaAfi: this.fecha(a.fechaafiliacion),
      fotoBase64: a.fotoimg || await this.convertUrlToBase64('assets/img/frepap/pdfafiliado/fotoimg.png')
    };

    // etiqueta arriba + caja uniforme
    const label = (t: string) => ({ text: t.toUpperCase(), bold: true, fontSize: 9, margin: [2, 0, 0, 3] });
    const box = (t: string, h = 24) => ({
      table: { widths: ['*'], body: [[{ text: t, margin: [8, 3, 8, 3], fontSize: 10, height: h }]] },
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
            {
              text: `FICHA N° ${M.numficha || '..........'}`,
              alignment: 'left',
              margin: [0, 0, 0, 10],
              bold: true
            },
            {
              table: {
                widths: [90],
                heights: [110],
                body: [[
                  {
                    image: M.fotoBase64 || null,
                    fit: [90, 110], // ajusta al tamaño del recuadro
                    alignment: 'center',
                    margin: [0, 0, 0, 0]
                  }
                ]]
              },
              layout: {
                hLineWidth: () => 1,
                vLineWidth: () => 1,
                hLineColor: () => '#000',
                vLineColor: () => '#000',
              }
            }
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
        row(['Región', 'Provincia', 'Distrito'], [M.region, M.subregion, M.localidad], [170, 170, 170], 26),

        // AVENIDA / NÚMERO
        row(['Avenida/Calle/Jirón', 'Número'], [M.avenida, M.numero], ['*', 120], 26),

        // URBANIZACIÓN / TELÉFONO
        row(['Urbanización/Sector/Caserío', 'Teléfono'], [M.urb, M.telefono], ['*', 160], 26),

        // CORREO
        row(['Correo Electrónico'], [M.correo], ['*'], 26),

        { text: ' ', margin: [0, 8, 0, 0] },
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

  eliminar(idafiliacion: number) {
    const request: FiltroAfiliacionDesactivar = {
      idafiliacion: idafiliacion,
      usuarioanulacion: this.usuario
    };

    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción desactivará la afiliación.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, desactivar',
      cancelButtonText: 'No, cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        // Solo si el usuario confirma
        this.svc.postDesactivarAfiliacion(request).subscribe({
          next: (res) => {
            if (res.success) {
              Swal.fire({
                icon: 'success',
                title: 'Desactivado',
                text: res.message
              });
              this.buscar();
            } else {
              Swal.fire({
                icon: 'error',
                title: 'Error',
                text: res.message || 'No se pudo desactivar la afiliación'
              });
            }
          },
          error: (err) => {
            console.error(err);
            Swal.fire({
              icon: 'error',
              title: 'Error en el servidor',
              text: 'Ocurrió un problema al procesar la solicitud.'
            });
          }
        });
      } else if (result.dismiss === Swal.DismissReason.cancel) {
        // Usuario canceló
        Swal.fire({
          icon: 'info',
          title: 'Cancelado',
          text: 'La afiliación no fue desactivada.'
        });
      }
    });
  }


}
