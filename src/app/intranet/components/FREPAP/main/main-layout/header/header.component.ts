import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PermissionRequest } from '../../../../../models/Auth/permissionsRequest';
import { AuthService } from '../../../../../services/auth/auth.service';
import { MenuService } from '../../../../../services/entel-retail/header/menu.service';
import { RETAIL_AsistenciaBE } from '../../../../../models/rom/seguridad/RETAIL_AsistenciaBE';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
})
export class HeaderComponent {
  modulos: any[] = [];
  userData: any = {};
  permissionRequest: PermissionRequest = new PermissionRequest();
  asistencia: RETAIL_AsistenciaBE | null = null; // Permite null
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private menuService: MenuService
  ) {

    this.getObjectPermissions();
    this.getUserData();
    //this.getMarcacion();

  }

  getObjectPermissions() {
    const idempresa = Number(localStorage.getItem('idempresa'));
    const idpais = Number(localStorage.getItem('idpais'));
    const idnegocio = Number(localStorage.getItem('idnegocio'));
    const idcuenta = Number(localStorage.getItem('idcuenta'));
    const user = localStorage.getItem('user');
    if (
      idempresa !== null &&
      idpais !== null &&
      idnegocio !== null &&
      idcuenta !== null &&
      user !== null
    ) {
      this.permissionRequest.idempresa = idempresa;
      this.permissionRequest.idpais = idpais;
      this.permissionRequest.idnegocio = idnegocio;
      this.permissionRequest.idcuenta = idcuenta;
      this.permissionRequest.user = user;
      this.authService
        .getPermissions(this.permissionRequest)
        .subscribe((res) => {

          // const menu = localStorage.getItem('menu');
          // if (menu !== null) {
          //   localStorage.removeItem('menu');
          // }

          // localStorage.setItem('menu', JSON.stringify(res));

          this.menuService.clearMenu();
          this.menuService.updateMenu(res);

          const menuDataFromLocalStorage = localStorage.getItem('menu');

          if (menuDataFromLocalStorage !== null) {
            const dataFromLocalStorage: any = JSON.parse(
              menuDataFromLocalStorage
            );

            console.log('dataFromLocalStorage', dataFromLocalStorage);

            this.filtrarYOrganizarModulos(dataFromLocalStorage);
            this.modulos = this.filtrarYOrganizarModulos(dataFromLocalStorage);

            console.log('this.modulos', this.modulos);
          } else {
            console.error('El valor de "menu" en el LocalStorage es nulo.');
          }
        });
    }
  }


  getMarcacion(): void {
    this.isLoading = true;  // Inicia la carga

    // Ajusta los valores de strUsuario y dteFecha según corresponda en tu aplicación
     const usuario= localStorage.getItem('user')||'';


    this.authService.getMarcacion(usuario).subscribe(
      (response) => {
        this.isLoading = false;  // Finaliza la carga

        if (response && response.lstData && response.lstData.length > 0) {
          this.isLoading = false;  // Finaliza la carga

          const asistenciaData = response.lstData[0];
          const storedFlag = localStorage.getItem('flagAsistencia');
        
          // Si ya existe algo en localStorage
          if (storedFlag !== null) {
            const currentFlag = JSON.parse(storedFlag);
        
            // Si el valor actual en localStorage es 0 y el nuevo valor es 1, actualiza
            if (currentFlag === 0 && asistenciaData.intFlagAsistencia === 1) {
              localStorage.removeItem('flagAsistencia'); // Eliminar el valor actual
              localStorage.setItem('flagAsistencia', JSON.stringify(asistenciaData.intFlagAsistencia)); // Guardar el nuevo valor
            }
          } else {
            // Si no existe en localStorage y el valor del servicio es 1, lo guarda
            if (asistenciaData.intFlagAsistencia === 1) {
              localStorage.setItem('flagAsistencia', JSON.stringify(asistenciaData.intFlagAsistencia));
            }
          }


          let fechaIngreso = '', horaIngreso = '', horaSalida = '';
          if (asistenciaData.dteFeHoraIngreso) {
            [fechaIngreso, horaIngreso] = asistenciaData.dteFeHoraIngreso.split(' ');
          }

          if (asistenciaData.dteFeHorSalida) {
            horaSalida = asistenciaData.dteFeHorSalida.split(' ')[1] || '';
          }

          this.asistencia = {
            ...asistenciaData,
            dteFechaIngreso: fechaIngreso,
            horaIngreso: horaIngreso,
            horaSalida: horaSalida
          };
        } else {
          this.asistencia = null;
        }
      },
      (error) => {
        console.error('Error fetching marcacion data:', error);
      }
    );
  }

  filtrarYOrganizarModulos(data: any[]): any[] {
    let modulosFiltrados: any[] = [];
    data.forEach((modulo) => {
      const mod: any = {
        nombre: modulo.nombremodulo,
        icono: modulo.iconomodulo,
        ruta: modulo.ruta,
        submodulos: modulo.submodules
          .filter((submodulo: any) => submodulo.idsubmodulo !== 0) // Filtrar submódulos con idsubmodulo diferente de 0
          .map((submodulo: any) => {
            const submod: any = {
              nombre: submodulo.nombresubmodulo,
              icono: submodulo.iconosubmodulo,
              ruta: submodulo.rutasubmodulo,
              items: submodulo.items
                .filter((item: any) => item.iditemmodulo !== 0) // Filtrar items de módulo con iditemmodulo diferente de 0
                .map((item: any) => {
                  return {
                    nombre: item.nombreitemmodulo,
                    icono: item.iconoitemmodulo,
                    ruta: item.rutaitemmodulo,
                  };
                }),
            };
            return submod;
          }),
      };
      modulosFiltrados.push(mod);
    });
    return modulosFiltrados;
  }

  getUserData(): void {
    const user: any = localStorage.getItem('user');
    this.authService.getUserData(user).subscribe({
      next: (response) => {
        console.log('Respuesta del servicio:', response);
        this.userData = response; // Asignar la respuesta a una propiedad del componente

      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
      },
    });
  }
}
