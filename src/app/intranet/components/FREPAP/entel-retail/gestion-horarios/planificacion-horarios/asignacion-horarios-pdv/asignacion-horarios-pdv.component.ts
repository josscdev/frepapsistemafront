import { Component, OnInit, signal, WritableSignal } from '@angular/core';
import { SupervisorPDV } from '../../../../../../models/planificacion-horarios/supervisorPDV';
import { AsignarTurnosService } from '../../../../../../services/entel-retail/planificacion-horarios/asignar-turnos.service';
import { UsuarioSupervisor } from '../../../../../../models/planificacion-horarios/usuarioSupervisor';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AsignarHorariosService } from '../../../../../../services/entel-retail/planificacion-horarios/asignar-horarios.service';
import {
  DiasSemana,
  RangoSemana,
} from '../../../../../../models/planificacion-horarios/rangoSemana';
import { PromotorPDVResponse } from '../../../../../../models/planificacion-horarios/promotorPDVResponse';
import { TurnosAsignadosPDVRequest } from '../../../../../../models/planificacion-horarios/turnosAsignadosPDVRequest';
import { HorarioPlanificadoRequest, ListaPromotoresHorarios, ValidarPromotoresHorarios } from '../../../../../../models/planificacion-horarios/horarioPlanificadoRequest';
import { HorarioPlanificadoPromotorRequest } from '../../../../../../models/planificacion-horarios/horarioPlanificadoPromotorRequest';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Supervisor } from '../../../../../../models/planificacion-horarios/supervisor';
import { Jefe } from '../../../../../../models/planificacion-horarios/jefe';
import { Router } from '@angular/router';

@Component({
  selector: 'app-asignacion-horarios-pdv',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './asignacion-horarios-pdv.component.html',
  styleUrl: './asignacion-horarios-pdv.component.css',
})
export class AsignacionHorariosPDVComponent implements OnInit {
  usuarioSupervisor: UsuarioSupervisor = new UsuarioSupervisor();
  listSupervisorPDV: SupervisorPDV[] = [];
  listRangoSemana: RangoSemana[] = [];
  diasSemana: RangoSemana = new RangoSemana();
  supervisorPDV: SupervisorPDV = new SupervisorPDV();
  turnosAsignadosPDVRequest: TurnosAsignadosPDVRequest =
    new TurnosAsignadosPDVRequest();

  listDiasSemana: DiasSemana[] = []; // Cabeceras superiores
  promotorList: PromotorPDVResponse[] = [];
  listTurnosSupervisorPDVHorarios: any[] = [];
  listHorario: any[][] = [];
  columnas: number = 0;
  filas: number = 0;
  datosHorarioPlanificado: any[] = [];
  pdvFiltro: number = 0;
  rangoFiltro: string = '';
  horarioPlanificadoPromotorRequestArray: HorarioPlanificadoPromotorRequest[] =
    [];
  horarioPlanificadoPromotorRequest: HorarioPlanificadoPromotorRequest =
    new HorarioPlanificadoPromotorRequest();

  mostrarElemento: boolean = false;
  fechaHoyString: string = '';

  coincidencias: boolean[][] = [];

  listSupervisor: Supervisor[] = [];
  listJefe: Jefe[] = [];
  perfil: string = "";
  verTurnos: boolean = false;

  menuString: any;

  isLoadingSave: boolean = false;

  lValidarHorarioPlanificado: WritableSignal<ValidarPromotoresHorarios[]> = signal([]);
  lPromotoresHorarios: WritableSignal<ListaPromotoresHorarios[]> = signal([]);

  sUsuarioSuper: WritableSignal<string> = signal('');
  sUser: WritableSignal<string> = signal('');
  sLunes: WritableSignal<string> = signal('');
  sDomingo: WritableSignal<string> = signal('');
  lRangoDias: WritableSignal<string[]> = signal([]);

  isDisabled: boolean = true;

  constructor(
    private asignarTurnosService: AsignarTurnosService,
    private asignarHorariosService: AsignarHorariosService,
    private router: Router
  ) {

    localStorage.setItem('idpdv', '');
    localStorage.setItem('puntoventa', '');

    this.sUser.set(localStorage.getItem('user') || '');

    this.menuString = (localStorage.getItem('menu') || '');
    let menu;
    if (this.menuString) {
      menu = JSON.parse(this.menuString);
      //console.log('menuu', menu);
      // Obtener la URL completa
      const url = this.router.url;
      //console.log(url); // Imprime la URL completa

      let partes = url.split("/");
      // Quitamos la primera parte que es vacía y la parte "main"
      let nuevaUrl = partes.slice(2).join("/");
      //console.log('nuevaurl', nuevaUrl);

      this.perfil = this.checkUrl(menu, nuevaUrl);
      console.log('Perfil es?', this.perfil);

      this.usuarioSupervisor.usuario = this.perfil === 'ADMIN' ?
        (localStorage.getItem('dnisupervisor') || '') :
        (localStorage.getItem('user') || '');

      //console.log('usuarioSupervisor', this.usuarioSupervisor.usuario);

    } else {
      // Manejar el caso en el que no hay menú en el localStorage
      menu = '';
    }
  }

  toggleVisibilidad() {
    this.mostrarElemento = true;
  }

  exportexcel() {
    const usuarioSuper: UsuarioSupervisor = new UsuarioSupervisor();
    if (this.perfil === 'ADMIN' || this.perfil === 'JV' || this.perfil === 'SG') {
      const dnisupervisor = localStorage.getItem('dnisupervisor');
      usuarioSuper.usuario = dnisupervisor || '';
    } else {
      usuarioSuper.usuario = this.usuarioSupervisor.usuario!;
    }

    let promiseSemanaActual = lastValueFrom(
      this.asignarHorariosService.ReportGetSemanaActual(usuarioSuper)
    );
    let promiseSemanaAnterior = lastValueFrom(
      this.asignarHorariosService.ReportGetSemanaAnterior(usuarioSuper)
    );

    Promise.all([promiseSemanaActual, promiseSemanaAnterior])
      .then((values: any[]) => {
        //console.log('listReportGetSemanaActual', values[0]);
        //console.log('listReportGetSemanaAnterior', values[1]);

        const data1 = values[0];
        const data2 = values[1];

        const ws1: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data1);
        const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data2);

        const wb: XLSX.WorkBook = XLSX.utils.book_new();

        /** Añadir las hojas de cálculo al libro de trabajo **/
        XLSX.utils.book_append_sheet(wb, ws1, 'Semana Actual');
        XLSX.utils.book_append_sheet(wb, ws2, 'Semana Anterior');

        let fileName = `HorarioPlanificado_${usuarioSuper.usuario}.xlsx`;

        /** Guardar en un archivo **/
        XLSX.writeFile(wb, fileName);
      })
      .catch((error) => {
        console.error('Error:', error);
      });
  }

  descargarExcel() {
    const link = document.createElement('a');
    link.href = 'assets/documents/excel/formatoHorarioEntel.xlsx';
    link.download = 'formatoHorarioEntel.xlsx';
    link.click();
  }

  ngOnInit(): void {
    //this.getSupervisorPDV();
    this.getRangoSemana();
    // //console.log('rangoFiltro1', this.rangoFiltro);
    //Obtener fecha Hoy para inicializar la lista de dias
    const fechaHoy = new Date();
    this.fechaHoyString =
      fechaHoy.getFullYear().toString() +
      '-' +
      (fechaHoy.getMonth() + 1).toString() +
      '-' +
      fechaHoy.getDate().toString();
    //console.log(this.rangoFiltro);
    this.diasSemana.lunes = this.fechaHoyString;
    this.diasSemana.domingo = this.fechaHoyString;
    this.getDiasSemana();
    // //console.log('vacoppop', this.listRangoSemana);
    // //console.log('rangoFiltro2', this.rangoFiltro);

    //PERMISOS

    switch (this.perfil) {
      case 'ADMIN':
        this.getJefes();
        this.verTurnos = true;
        this.isDisabled = true;
        break;
      case 'JV':
        this.getSupervisores();
        this.verTurnos = true;
        this.isDisabled = true;
        break;
      case 'SG':
        const usuariosupervisor = localStorage.getItem('user');
        localStorage.setItem('dnisupervisor', usuariosupervisor || '');
        this.getSupervisorPDV();
        break;
      default:
        break;
    }
  }

  checkUrl(menu: any, requestedPath: string): string {
    ////console.log('DEBE ENTRAR checkAuthorization');
    ////console.log('menu', menu);
    //console.log('requestedPath', requestedPath);

    if (!menu || !Array.isArray(menu)) {
      return 'No hay menu'; // No hay menú o no es un array válido
    }

    // Recorrer los módulos en el menú
    for (const modulo of menu) {
      // Verificar si la ruta del módulo coincide
      if (modulo.rutamodulo && modulo.rutamodulo === requestedPath) {
        //console.log('nombreperfilmodulo', modulo.nombreperfilmodulo);
        //console.log('modulo.rutamodulo', modulo.rutamodulo);

        return modulo.nombreperfilmodulo; // La ruta solicitada está presente en el menú
      }


      ////console.log('modulo.submodules', modulo.submodules);
      // Si hay submódulos, recorrerlos
      if (modulo.submodules && Array.isArray(modulo.submodules)) {
        for (const submodulo of modulo.submodules) {
          // Verificar si la ruta del submódulo coincide
          if (submodulo.rutasubmodulo && submodulo.rutasubmodulo === requestedPath) {
            //console.log('nombreperfilsubmodulo', submodulo.nombreperfilsubmodulo);
            //console.log('submodulo.rutasubmodulo', submodulo.rutasubmodulo);

            return submodulo.nombreperfilsubmodulo; // La ruta solicitada está presente en el menú
          }

          // Si hay ítems, recorrerlos
          if (submodulo.items && Array.isArray(submodulo.items)) {
            for (const item of submodulo.items) {
              // Verificar si la ruta del ítem coincide
              if (item.rutaitemmodulo && item.rutaitemmodulo === requestedPath) {
                //console.log('nombreperfilitemmodulo', item.nombreperfilitemmodulo);
                //console.log('item.rutaitemmodulo', item.rutaitemmodulo);

                return item.nombreperfilitemmodulo; // La ruta solicitada está presente en el menú
              }
            }
          }
        }
      }
    }

    return 'No esta en el menú'; // La ruta solicitada no está en el menú
  }

  filtrar() {
    this.toggleVisibilidad();
    //console.log('pdvFiltro', this.pdvFiltro);
    //console.log('rangoFiltro', this.rangoFiltro);

    if (this.pdvFiltro === 0) {
      //console.log('Seleccione PDV');
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'warning',
        title: '<b>Seleccione PDV</b>',
        showCloseButton: true,
        text: 'Debe seleccionar Punto de Venta!',
        //background: "#F7F7F9",
        //color: "#fff",
      });
      return; // Detener la ejecución de la función
    }

    if (this.rangoFiltro.indexOf(',') === -1) {
      //console.log('Seleccione Rango');
      const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
          toast.onmouseenter = Swal.stopTimer;
          toast.onmouseleave = Swal.resumeTimer;
        },
      });
      Toast.fire({
        icon: 'warning',
        title: '<b>Seleccione Rango</b>',
        showCloseButton: true,
        text: 'Debe seleccionar Rango Semanal!',
        //background: "#F7F7F9",
        //color: "#fff",
      });
      return; // Detener la ejecución de la función
    }

    this.datosHorarioPlanificado = [];
    //console.log('datosHorarioPlanificado1:', this.datosHorarioPlanificado);

    const puntoventa = this.listSupervisorPDV.find(
      (item) => item.idpuntoventarol === Number(this.pdvFiltro)
    )?.puntoventa;
    localStorage.setItem('idpdv', String(this.pdvFiltro));
    localStorage.setItem('puntoventa', puntoventa!);

    //console.log('Rango seleccionado:', this.rangoFiltro);
    const [fechaInicio, fechaFin] = this.rangoFiltro.split(',');
    //console.log([fechaInicio, fechaFin]);
    this.diasSemana.lunes = fechaInicio;
    this.diasSemana.domingo = fechaFin;
    //console.log(this.diasSemana);

    this.getDiasSemana();
    this.getPromotorSupervisorPDV();
    this.getTurnosSupervisorPDVHorarios();
  }

  getSupervisorPDV() {
    //if (this.usuarioSupervisor.usuario !== null) {}
    const usuarioSuper: UsuarioSupervisor = new UsuarioSupervisor();
    if (this.perfil === 'ADMIN' || this.perfil === 'JV') {
      const dnisupervisor = localStorage.getItem('dnisupervisor');
      usuarioSuper.usuario = dnisupervisor || '';
    } else {
      usuarioSuper.usuario = this.usuarioSupervisor.usuario!;
    }

    const request = {
      dnisupervisor: usuarioSuper.usuario,
      idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')),
    };

    this.listSupervisorPDV = [];
    this.asignarTurnosService
      .getSupervisorPDV(request)
      .subscribe((res) => {
        //console.log(res);
        this.listSupervisorPDV = res;
      });

  }

  getRangoSemana() {
    if (this.perfil !== "" || this.perfil !== null) {
      this.asignarHorariosService.getRangoSemana(this.perfil).subscribe((res) => {
        this.listRangoSemana = res;
        //console.log('listRangoSemana', this.listRangoSemana);
      });
    }
  }

  getDiasSemana() {
    this.asignarHorariosService
      .getDiasSemana(this.diasSemana)
      .subscribe((res) => {
        //console.log(res);
        this.listDiasSemana = res;
      });
  }

  getPromotorSupervisorPDV() {
    if (this.perfil === 'ADMIN' || this.perfil === 'JV') {
      const dnisupervisor = localStorage.getItem('dnisupervisor');
      this.supervisorPDV.dnisupervisor = dnisupervisor || '';
    } else {
      this.supervisorPDV.dnisupervisor = this.usuarioSupervisor.usuario!;
    }
    this.supervisorPDV.idpuntoventarol = Number(localStorage.getItem('idpdv')!);

    const fechasSeparadas = this.rangoFiltro.split(',');
    const fechaInicio = fechasSeparadas[0];
    const fechaFin = fechasSeparadas[1];

    this.supervisorPDV.fechainicio = fechaInicio;
    this.supervisorPDV.fechafin = fechaFin;

    this.supervisorPDV.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue')!);

    //console.log('this.supervisorPDV', this.supervisorPDV);

    this.asignarHorariosService
      .getPromotorSupervisorPDV(this.supervisorPDV)
      .subscribe((res) => {
        this.promotorList = res;
        //console.log('this.promotorList', this.promotorList);
        this.datosHorarioPlanificado = [];
        this.listHorario = [];

        for (let i = 0; i < this.promotorList.length; i++) {
          const innerArray = [];
          for (let j = 0; j < this.listDiasSemana.length; j++) {
            innerArray.push({
              horario: '', // Valor inicial del select
              fila: i, // Coordenada de fila
              columna: j, // Coordenada de columna
              activarcbo: 0, // si el campo debe estar deshabilitado
              estado: 0,
              variable: false
            });
          }
          this.listHorario.push(innerArray);
        }

        this.coincidencias = [];
        for (let i = 0; i < this.promotorList.length; i++) {
          this.coincidencias[i] = [];
          for (let j = 0; j < this.listDiasSemana.length; j++) {
            this.coincidencias[i][j] = false; // Inicialmente, todas las opciones están ocultas
          }
        }

        //Obtener Horario Planificado
        this.getHorarioPlanificado();
      });
  }

  getTurnosSupervisorPDVHorarios() {
    const idpdv = localStorage.getItem('idpdv');
    if (idpdv !== null) {
      if (this.perfil === 'ADMIN' || this.perfil === 'JV') {
        const dnisupervisor = localStorage.getItem('dnisupervisor');
        this.turnosAsignadosPDVRequest.usuario = dnisupervisor || '';
      } else {
        this.turnosAsignadosPDVRequest.usuario = this.usuarioSupervisor.usuario!;
      }
      this.turnosAsignadosPDVRequest.idpdv = Number(idpdv);
      this.turnosAsignadosPDVRequest.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue')!);
      //console.log(this.turnosAsignadosPDVRequest);

      this.asignarHorariosService
        .getTurnosSupervisorPDVHorarios(this.turnosAsignadosPDVRequest)
        .subscribe((res) => {
          //console.log(res);
          this.listTurnosSupervisorPDVHorarios = res;
        });
    }
  }

  guardarHorarios() {
    const usuarioSuper: UsuarioSupervisor = new UsuarioSupervisor();
    if (this.perfil === 'ADMIN' || this.perfil === 'JV') {
      const dnisupervisor = localStorage.getItem('dnisupervisor');
      usuarioSuper.usuario = dnisupervisor || '';
    } else {
      usuarioSuper.usuario = this.usuarioSupervisor.usuario!;
    }

    Swal.fire({
      title: 'Esta seguro que desea guardar?',
      text: "Se guardará los cambios realizados en el horario planificado y no podrá deshacerlos!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, guardar!',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        const arregloFinal: any[] = []; // Arreglo para almacenar todos los objetos

        // Iterar sobre los promotores
        this.promotorList.forEach((promotor, indexPromotor) => {
          // Iterar sobre los días de la semana
          const promotorPorDia: any[] = [];
          this.listDiasSemana.forEach((dia, indexDia) => {
            // Obtener el horario del promotor para el día actual
            const horario = this.listHorario[indexPromotor][indexDia];
            //console.log('como bota?',this.listHorario[indexPromotor][indexDia]);

            // Crear un objeto para el horario actual
            const objetoHorario = {
              dnipromotor: promotor.dnipromotor || '',
              dnisupervisor: usuarioSuper.usuario,
              nombrepromotor: promotor.nombrepromotor || '',
              apellidopaternopromotor: promotor.apellidopaternopromotor || '',
              apellidomaternopromotor: promotor.apellidomaternopromotor || '',
              idpdv: Number(localStorage.getItem('idpdv')) || 0,
              puntoventa: localStorage.getItem('puntoventa') || '',
              fecha: dia.fecha || '',
              horario: horario.horario.replace(/\s/g, '') || '00:00-00:00',
              descripcion: horario.horario.split(',')[0] || '',
              horarioentrada: horario.horario.split(',')[1] || '',
              horariosalida: horario.horario.split(',')[2] || '',
              usuario_creacion: this.usuarioSupervisor.usuario || '',
              activarcbo: 1,
              idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')) || 0,
              estado: 1
            };

            // Agregar el objeto al arreglo de promotorPorDia
            promotorPorDia.push(objetoHorario);
          });

          // Agregar el arreglo de promotorPorDia al arregloFinal
          arregloFinal.push(promotorPorDia);
        });

        // Mostrar en consola el arreglo final
        //console.log('Arreglo final:', arregloFinal);
        let arrayRequest: HorarioPlanificadoRequest[] = arregloFinal;

        console.log(arrayRequest);
        Swal.fire({
          html: '<div style="text-align:center;"><img src="https://i.imgur.com/7c4Iqrl.gif" style="max-width: 100%; height: auto; width:350px" /> </br> <p>Guardando Datos...</p></div>',
          timerProgressBar: true,
          backdrop: `
        rgba(0,0,123,0.4)
        left top
        no-repeat
      `,
          didOpen: () => {
            Swal.showLoading();
          },
          willClose: () => {
            // Clear the timer if the Swal is closed
            clearInterval(timerInterval);
          },
          allowOutsideClick: false,
        });

        let timerInterval: any;

        this.asignarHorariosService
          .postHorarioPlanificado(arrayRequest)
          .subscribe((res) => {
            //console.log(res);
            if (res.mensaje === 'OK') {
              // Close the Swal when the response is received
              Swal.close();

              // Handle your logic after receiving the response
              this.getHorarioPlanificado();
              // let data:any=this.getHorarioPlanificado();
              // //console.log('dataaa para cerrar swal',data)
              //console.log('Arreglo final:', 'entro?');
            } else {
              Swal.close();
              //console.log('Error: Los datos no se han guardado');
              const Toast = Swal.mixin({
                toast: true,
                position: 'bottom-end',
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                  toast.onmouseenter = Swal.stopTimer;
                  toast.onmouseleave = Swal.resumeTimer;
                },
              });
              Toast.fire({
                icon: 'error',
                title: 'Los datos no se han guardado',
              });
            }
          });
      }
    });
  }

  onRangoSemanaChange(event: any): void {
    const [fechaInicio, fechaFin] = this.rangoFiltro.split(',');
    this.sLunes.set(fechaInicio);
    this.sDomingo.set(fechaFin);

    this.isDisabled = false;

    const rangodias = {
      lunes: fechaInicio,
      domingo: fechaFin,
    }

    this.asignarHorariosService
      .getDiasSemana(rangodias)
      .subscribe((res) => {
        const data = res.map((item: any) => item.fecha);
        this.lRangoDias.set(data);
      });
  }

  async leerExcel(event: any): Promise<void> {
    try {
      this.isLoadingSave = true;
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length !== 1) {
        throw new Error('No se puede usar múltiples archivos');
      }

      const file = input.files[0];
      const fileContent = await this.readFileAsync(file);

      const wb: XLSX.WorkBook = XLSX.read(fileContent, { type: 'binary' });
      const wsname: string = wb.SheetNames[0];
      const ws: XLSX.WorkSheet = wb.Sheets[wsname];

      const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
      if (data.length === 0) {
        throw new Error('La hoja está vacía');
      }

      const headers: string[] = data[0] as string[];
      const parsedData = data.slice(1)
        .map((row: any) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index] !== undefined ? row[index].toString() : null;
          });
          return obj;
        })
        .filter(row => Object.values(row).some(value => value !== null));

      const usuario = (localStorage.getItem('dnisupervisor') || '');

      this.sUsuarioSuper.set(usuario);

      const listaObjetosHorario = parsedData.map(item => {
        const dnipromotor = item['dnipromotor']?.trim() || '';
        const puntoventa = item['puntoventa']?.trim() || '';
        const fecha = this.parseDate(item['fecha']);
        const horarioentrada = item['horarioentrada']?.trim() || '00:00';
        const horariosalida = item['horariosalida']?.trim() || '00:00';
        const usuario_creacion = this.sUser()?.trim() || '';
        const dnisupervisor = this.sUsuarioSuper()?.trim() || '';
        const idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue')) || 0;

        // Validar que no haya atributos vacíos
        if (!dnipromotor || !puntoventa || !fecha || !horarioentrada || !horariosalida || !usuario_creacion || !dnisupervisor) {
          Swal.fire({
            icon: 'error',
            title: 'Error al leer el archivo',
            text: 'Hay datos vacíos en el archivo. Revise la información.',
          });
          throw new Error;
        }

        return { dnipromotor, puntoventa, fecha, horarioentrada, horariosalida, usuario_creacion, dnisupervisor, idemppaisnegcue };
      });

      console.log('listaObjetosHorario', listaObjetosHorario);

      // 🔹 VALIDACIONES 🔹
      // que no se repitan horario segun promotor y pdv
      // que el mes y año sean los mismos
      // que valide que tenga todos los dias segun el rango de fechas (combobox rangosemanal)
      this.validarHorarios(listaObjetosHorario);  // Llamamos a una función que agrupa las validaciones

      // 🔹 Si hay errores, NO llega hasta aquí 🔹

      this.lValidarHorarioPlanificado.set(listaObjetosHorario);

      console.log('LISTA HORARIOS sin campos vacios', this.lValidarHorarioPlanificado());

      await this.validarHorarioPlanificadoExcel();

      // // Reset input and loading state
      // input.value = '';
      // this.isLoadingSave = false;

    } catch (error) {
      console.error('Error processing Excel file:', error);
      this.isLoadingSave = false;
      throw error;
    } finally {
      // Restablecer el estado independientemente de si hay error o no
      const input = event.target as HTMLInputElement;
      input.value = '';
      this.isLoadingSave = false;
    }
  }

  private validarHorarios(listaObjetosHorario: any[]) {

    const [yearLunes, monthLunes, dayLunes] = this.sLunes().split('-').map(Number);
    const [yearDomingo, monthDomingo, dayDomingo] = this.sDomingo().split('-').map(Number);

    const fechaInicio = new Date(yearLunes, monthLunes - 1, dayLunes);
    const fechaFin = new Date(yearDomingo, monthDomingo - 1, dayDomingo);

    const diasSemana = new Set(this.lRangoDias());

    // 🔹 1. Validar duplicados en el rango
    const duplicadosEnRango: Record<string, string[]> = {};

    listaObjetosHorario.forEach(item => {
      const clave = `${item.dnipromotor}-${item.puntoventa}`;
      const fecha = new Date(item.fecha);

      if (fecha >= fechaInicio && fecha <= fechaFin) {
        if (!duplicadosEnRango[clave]) {
          duplicadosEnRango[clave] = [];
        }

        const fechaStr = item.fecha.toISOString().split('T')[0];

        if (duplicadosEnRango[clave].includes(fechaStr)) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: `El promotor ${item.dnipromotor} tiene horario duplicado el ${fechaStr} en el punto de venta ${item.puntoventa}`,
          });
          throw new Error;
        } else {
          duplicadosEnRango[clave].push(fechaStr);
        }
      }
    });

    // // 🔹 2. Verificar que todas las fechas sean del mismo mes y año
    // const fechasPorPromotorYPV: Record<string, { meses: Set<number>, años: Set<number> }> = {};

    // listaObjetosHorario.forEach(item => {
    //   const clave = `${item.dnipromotor}-${item.puntoventa}`;
    //   const fecha = new Date(item.fecha);
    //   const mes = fecha.getMonth();
    //   const año = fecha.getFullYear();

    //   if (!fechasPorPromotorYPV[clave]) {
    //     fechasPorPromotorYPV[clave] = { meses: new Set(), años: new Set() };
    //   }

    //   fechasPorPromotorYPV[clave].meses.add(mes);
    //   fechasPorPromotorYPV[clave].años.add(año);
    // });

    // Object.entries(fechasPorPromotorYPV).forEach(([clave, datos]) => {
    //   if (datos.meses.size > 1 || datos.años.size > 1) {
    //     Swal.fire({
    //       icon: 'error',
    //       title: 'Error',
    //       text: `El promotor ${clave} tiene fechas de diferentes meses o años.`,
    //     });
    //     throw new Error;
    //   }
    // });

    // 🔹 3. Verificar que cada promotor tenga registros en todos los días del 24 al 30 de marzo
    const diasFaltantesPorPromotor: Record<string, string[]> = {};

    listaObjetosHorario.forEach(item => {
      const clave = `${item.dnipromotor}-${item.puntoventa}`;
      const fechaStr = item.fecha.toISOString().split('T')[0];

      if (!diasFaltantesPorPromotor[clave]) {
        diasFaltantesPorPromotor[clave] = [];
      }

      diasFaltantesPorPromotor[clave].push(fechaStr);
    });

    Object.entries(diasFaltantesPorPromotor).forEach(([clave, fechas]) => {
      const fechasSet = new Set(fechas);
      const diasFaltantes = [...diasSemana].filter(dia => !fechasSet.has(dia));

      if (diasFaltantes.length > 0) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: `El promotor ${clave} no tiene registros para los días: ${diasFaltantes.join(', ')}.`,
        });
        throw new Error;
      }
    });
  }

  parseDate(dateStr: string | null): Date | null {
    if (!dateStr) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Algun campo de fecha está vacío.', 
      })
      console.error('Invalid date string:', dateStr);
      return null;
    }
    const [day, month, year] = dateStr.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Helper method to read file as binary string
  private readFileAsync(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => resolve(e.target.result);
      reader.onerror = (e) => reject(e);
      reader.readAsBinaryString(file);
    });
  }

  async validarHorarioPlanificadoExcel(): Promise<void> {
    try {
      const response = await firstValueFrom(this.asignarHorariosService.ValidarHorarioPlanificado(this.lValidarHorarioPlanificado()))
      //console.log('response:', response);

      // Si hay al menos un estado='error' en la lista, muestra todos los errores
      const errorMessages = response
        .filter((item: any) => item.estado === 'error')
        .map((item: any) => item.mensaje);

      if (errorMessages.length > 0) {
        this.displayErrors(errorMessages);
      } else {

        // Si no hay errores, entonces se hará push en lPromotoresHorarios
        const validItems = response.map((item: any) => {
          const { estado, mensaje, ...rest } = item; // Exclude 'estado'

          // Transform the date to the format YYYY-MM-DD
          if (rest.fecha) {
            const date = new Date(rest.fecha);
            const formattedDate = date.toISOString().split('T')[0]; // Extracts YYYY-MM-DD
            rest.fecha = formattedDate;
          }

          return rest;
        });

        this.lPromotoresHorarios.set(validItems);
        console.log('LISTA HORARIOS Validada:', this.lPromotoresHorarios());

        Swal.fire({
          icon: 'success',
          title: 'Los datos se han validado correctamente. Ahora guardelos!',
          showConfirmButton: false,
          timer: 2000,
        });
      }

    } catch (error) {
      throw error;
    } finally {
      console.log('validarHorarioPlanificado finally');
    }
  }

  displayErrors(errorMessages: string[]) {
    errorMessages.forEach(message => console.error(message));

    // Create an HTML list of error messages
    const htmlErrorList = errorMessages.map(message => `<li>${message}</li>`).join('');
    const errorMessageHtml = `<ul>${htmlErrorList}</ul>`;

    Swal.fire({
      icon: "error",
      title: "Errores",
      html: errorMessageHtml,
      confirmButtonText: "OK"
    });
  }

  async guardarHorariosExcel(): Promise<void> {
    try {
      Swal.fire({
        title: 'Cargando...',
        text: 'Por favor, espere mientras se procesan los horarios.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      // Agrupar por dnipromotor
      const groupedByDnipromotor = this.lPromotoresHorarios().reduce((acc, item) => {
        const key = item.dnipromotor;
        if (!(key in acc)) {
          (acc as { [key: string]: any[] })[key] = [];
        }
        (acc as { [key: string]: any[] })[key].push(item);
        return acc;
      }, {} as Record<string, any[]>);

      // Convertir el objeto agrupado en una lista de listas
      const groupedList = Object.values(groupedByDnipromotor);

      console.log('LISTA de LISTAS:', groupedList);

      const responseH = await firstValueFrom(this.asignarHorariosService.postHorarioPlanificado(groupedList));

      console.log('RESPONSE Servicio POST HORARIOS:', responseH);

      // ✅ Si todo sale bien, cerrar el modal de carga y mostrar éxito
      Swal.fire({
        icon: 'success',
        title: 'Horarios guardados',
        text: 'Los horarios han sido registrados exitosamente.',
      });

    } catch (error) {
      console.error('🚨 Error en guardarHorariosExcel:', error);

      // ❌ Si hay error, cerrar el Swal de carga y mostrar error
      Swal.fire({
        icon: 'error',
        title: 'Hubo un problema',
        text: 'No se pudo conectar con el servidor. Intente nuevamente más tarde.',
      });

    }
  }

  getHorarioPlanificado() {
    this.horarioPlanificadoPromotorRequestArray = [];

    //console.log('rangoFiltro:', this.rangoFiltro);

    const fechasSeparadas = this.rangoFiltro.split(',');

    const fechaInicio = fechasSeparadas[0];
    const fechaFin = fechasSeparadas[1];

    //console.log('fechaInicio:', fechaInicio);
    //console.log('fechaFin:', fechaFin);
    this.promotorList.forEach((promotor, i) => {
      this.horarioPlanificadoPromotorRequest = {
        inicio: fechaInicio,
        fin: fechaFin,
        idpdv: Number(localStorage.getItem('idpdv')),
        dnipromotor: promotor.dnipromotor,
        idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')),
      };

      //console.log('listDiasSemana:', this.listDiasSemana);
      //console.log('horarioPlanificadoPromotorRequest1:', this.horarioPlanificadoPromotorRequest);

      this.horarioPlanificadoPromotorRequestArray?.push(
        this.horarioPlanificadoPromotorRequest
      );

      this.horarioPlanificadoPromotorRequest = {};

      //console.log('horarioPlanificadoPromotorRequest2:', this.horarioPlanificadoPromotorRequest);
    });

    let timerInterval: any;

    Swal.fire({
      html: '<div style="text-align:center;"><img src="https://i.imgur.com/7c4Iqrl.gif" style="max-width: 100%; height: auto; width:350px" /> </br> <p>Cargando Datos...</p></div>',
      timerProgressBar: true,
      backdrop: `
    rgba(0,0,123,0.4)
    left top
    no-repeat
  `,
      didOpen: () => {
        Swal.showLoading();
      },
      willClose: () => {
        clearInterval(timerInterval);
      },
      allowOutsideClick: false, // Evita que se cierre haciendo clic fuera de la alerta
    });

    setTimeout(() => {
      this.asignarHorariosService
        .getHorarioPlanificado(this.horarioPlanificadoPromotorRequestArray)
        .subscribe(
          (res) => {
            if (res !== null) {

              this.datosHorarioPlanificado = res;

              //console.log('this.datosHorarioPlanificado subs', this.datosHorarioPlanificado);

              if (
                this.datosHorarioPlanificado &&
                this.datosHorarioPlanificado.length > 0
              ) {
                this.datosHorarioPlanificado.forEach((horarioPlanificado, index) => {

                  //console.log('horarioPlanificado', index, horarioPlanificado);

                  const fechaIndex = this.listDiasSemana.findIndex(
                    (dia) => dia.fecha === horarioPlanificado.fecha
                  );
                  const promotorIndex =
                    this.promotorList.findIndex(
                      (promotor) =>
                        promotor.dnipromotor === horarioPlanificado.dnipromotor
                    );

                  //console.log('fechaIndex:', index, fechaIndex);
                  //console.log('promotorIndex:', index, promotorIndex);
                  //console.log('activarcbo', index, horarioPlanificado.activarcbo);
                  //console.log('estado', index, horarioPlanificado.estado);

                  if ((fechaIndex !== -1 && promotorIndex !== -1)) {
                    const horario = `${horarioPlanificado.descripcion || ''},${horarioPlanificado.horarioentrada || ''
                      },${horarioPlanificado.horariosalida || ''}`;
                    const rhorario = horario === ',,' ? '' : horario;
                    this.listHorario[promotorIndex][fechaIndex].horario =
                      rhorario;

                    const activarcbo = horarioPlanificado.activarcbo
                    //console.log('activarcbo', activarcbo);

                    // const ractivarcbo = activarcbo === undefined ? 0 : activarcbo;
                    this.listHorario[promotorIndex][fechaIndex].activarcbo =
                      activarcbo

                    const restado = horarioPlanificado.estado
                    //console.log('restado', restado);

                    this.listHorario[promotorIndex][fechaIndex].estado =
                      restado

                    if (horarioPlanificado.activarcbo == 2 && horarioPlanificado.estado == 2) {
                      this.listHorario[promotorIndex][fechaIndex].variable =
                        true
                    }

                  }

                  this.listHorario.forEach(fila => {
                    fila.forEach(elemento => {
                      if (elemento.estado === 0 && elemento.actirvarcbo === 0) {
                        elemento.variable = 1;
                      }
                    });
                  });

                  //cuando el horario ya esta guardado pero no figura en la lista de turnos. Manda booleans
                  for (let i = 0; i < this.listHorario.length; i++) {
                    this.coincidencias[i] = [];
                    for (let j = 0; j < this.listHorario[i].length; j++) {
                      const horarioActual = this.listHorario[i][j].horario;
                      const partesHorario = horarioActual.split(',');
                      const coincidencia = partesHorario.some(
                        (part: any) => part === ''
                      );
                      this.coincidencias[i][j] = coincidencia;
                    }
                  }
                });
                //console.log('listHorario:', this.listHorario);
                //console.log('datosHorarioPlanificado2:',this.datosHorarioPlanificado);
                //console.log('coincidencias', this.coincidencias);
              } else {

                for (let i = 0; i < this.listHorario.length; i++) {
                  this.coincidencias[i] = [];
                  for (let j = 0; j < this.listHorario[i].length; j++) {
                    const horarioActual = this.listHorario[i][j].horario;
                    this.listHorario[i][j].variable = false;
                    const partesHorario = horarioActual.split(',');
                    const coincidencia = partesHorario.some(
                      (part: any) => part === ''
                    );
                    this.coincidencias[i][j] = coincidencia;
                  }
                }
                //console.log('No hay datos disponibles.');
              }
            } else {
              //console.log('La respuesta es nula.');
            }
            // Cerrar la alerta después de 2 segundos
            setTimeout(() => {
              Swal.close();
            }, 2000);
          },
          (error) => {
            console.error('Error al obtener los datos:', error);
            // Cerrar la alerta en caso de error
            setTimeout(() => {
              Swal.close();
            }, 2000);
          }
        );
    }, 2000);
  }

  horarioNoExisteEnLista(horario: string): boolean {
    return !this.listTurnosSupervisorPDVHorarios.some(
      (item) => item.descripcion === horario
    );
  }

  ///*************PERMISOS*************/

  getJefes() {
    const request = {
      idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue'))
    }
    this.asignarTurnosService.getJefes(request).subscribe(res => {
      //console.log('jefes', res)
      if (res != null) {
        this.listJefe = res;
      }
    })
  }

  getSupervisores() {
    let dnijefe: string = "";

    if (this.perfil === 'ADMIN') {
      dnijefe = (localStorage.getItem('dnijefe') || '');
    } else if (this.perfil === 'JV') {
      dnijefe = this.usuarioSupervisor.usuario!;
    }

    const request = {
      idemppaisnegcue: Number(localStorage.getItem('idemppaisnegcue')),
      dnijefe: dnijefe
    }

    this.asignarTurnosService.getSupervisores(request).subscribe(res => {
      //console.log('supervisores', res)
      if (res != null) {
        this.listSupervisor = res;
      }
    })
  }

  ongetJefe(event: any) {
    const dnijefe = (event.target as HTMLSelectElement)?.value;
    localStorage.setItem('dnijefe', dnijefe)
    this.listSupervisor = [];
    this.listSupervisorPDV = [];
    this.datosHorarioPlanificado = [];
    this.promotorList = [];
    this.verTurnos = true;
    this.getSupervisores();
  }

  ongetSupervisor(event: any) {
    const dnisupervisor = (event.target as HTMLSelectElement)?.value;
    localStorage.setItem('dnisupervisor', dnisupervisor);
    this.datosHorarioPlanificado = [];
    this.promotorList = [];
    this.verTurnos = false;
    this.pdvFiltro = 0;
    this.getSupervisorPDV();

  }

}
