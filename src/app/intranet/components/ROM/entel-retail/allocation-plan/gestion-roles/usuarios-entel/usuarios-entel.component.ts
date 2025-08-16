import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import * as XLSX from 'xlsx';
import { AllocationService } from '../../../../../../services/entel-retail/allocation-plan/allocation.service';
import Swal from 'sweetalert2';
import { MatDialog } from '@angular/material/dialog';
import { EditarUsuariosEntelComponent } from './editar-usuarios-entel/editar-usuarios-entel.component';


@Component({
  selector: 'app-usuarios-entel',
  standalone: true,
  imports: [  CommonModule,
      MatPaginatorModule,
      ReactiveFormsModule,
      FormsModule],
  templateUrl: './usuarios-entel.component.html',
  styleUrl: './usuarios-entel.component.css'
})
export class UsuariosEntelComponent {
  readonly dialog = inject(MatDialog);
  perfil: string = "";
  searchTerm: string = ''; // Término de búsqueda vinculado al input
  pageSize = 20
  desde: number = 0;
  hasta: number = 20;
  mes: string = '';
  data: any[] = [];
  dataUsuarios: any[] = [];
  usuario: string;
  usuariosEntel: any[] = []; // Variable para almacenar los usuarios
  idemppaisnegcue: number;
  fileName: string = '';
  errorMessage: any;
  today = new Date();
  numeroMes: number = 0;
  menuString: any;
  
  constructor(
    private fb: UntypedFormBuilder,
    private router: Router,
     private allocationService: AllocationService,
  ) {
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue') || 0);
    this.usuario = (localStorage.getItem('user') || '');
    this.menuString = (localStorage.getItem('menu') || '');

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

    this.getUsuarioEntel(this.idemppaisnegcue);

  }

  ngOnInit(): void {

  }


    openEdit(usuario: any): void {
      const dialogRefedit = this.dialog.open(EditarUsuariosEntelComponent, {
        data: { titulo: 'Editar Usuario Entel', usuarioEntelData: usuario},
        height: '50%',
        width: '60%'
      });
      dialogRefedit.afterClosed().subscribe(result => {
        console.log('The dialog was closed');
        //console.log('epriodo edit fin', this.periodo)
        this.getUsuarioEntel(this.idemppaisnegcue);
      });
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


  
  downloadExcel() {
    const link = document.createElement('a');
    link.href = 'assets/documents/excel/formatoUsuariosEntelRombi.xlsx';
    link.download = 'formatoUsuariosEntelRombi.xlsx';
    link.click();
  }


  
    onFileChange(event: any) {
      const input = event.target as HTMLInputElement;
      if (!input.files || input.files.length !== 1) throw new Error('No se puede usar múltiples archivos');
  
      const file = input.files[0];
      this.fileName = file.name; // Guardamos el nombre del archivo seleccionado
      const reader = new FileReader();
  
      reader.onload = (e: any) => {
        const bstr: string = e.target.result;
        const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary' });
  
        const wsname: string = wb.SheetNames[0];
        const ws: XLSX.WorkSheet = wb.Sheets[wsname];
  
        const data = XLSX.utils.sheet_to_json(ws, { header: 1 });
  
        if (data.length === 0) {
          throw new Error('La hoja está vacía');
        }
  
        const headers: string[] = data[0] as string[];
  
        this.data = data.slice(1).map((row: any) => {
          const obj: any = {};
          headers.forEach((header: string, index: number) => {
            obj[header] = row[index] !== undefined ? row[index].toString() : null;
          });
          return obj;
        }).filter(row => Object.values(row).some(value => value !== null));
  
        // Parse dates and validate
        this.dataUsuarios = this.data.map(item => ({
          docusuario: item['DNI'] ? item['DNI'].toString() : '',
          usuarioredtde: item['USUARIO_RED_TDE'] ? item['USUARIO_RED_TDE'].toString() : '',
          usuarioportal: item['USUARIO_PORTAL'] ? item['USUARIO_PORTAL'].toString() : '',
          correocorp: item['CORREO_CORP'] ? item['CORREO_CORP'].toString() : '',
          celular: item['CELULAR'] ? item['CELULAR'].toString() : '',
          idemppaisnegcue: this.idemppaisnegcue,
          estado: 1,
          usuariocreacion: this.usuario
        }));
  
        console.log(this.dataUsuarios);
        const errorMessages: string[] = [];
        const isValid = this.validateData(this.dataUsuarios, errorMessages);
  
        if (!isValid) {
          this.displayErrors(errorMessages);
          // Restablecer el nombre del archivo si hay errores
          this.fileName = '';
        } else {
  
          console.log(this.data);
          console.log(this.dataUsuarios);
        }
  
        // Reset the input value to allow re-selection of the same file
        input.value = '';


      };
  
      reader.readAsBinaryString(file);
    }

      displayErrors(errorMessages: string[]) {
        errorMessages.forEach(message => console.error(message));
    
        // Crear una lista HTML de mensajes de error
        const htmlErrorList = errorMessages.map(message => `<li>${message}</li>`).join('');
        const errorMessageHtml = `<ul>${htmlErrorList}</ul>`;
    
        Swal.fire({
          icon: "error",
          title: "Errores",
          html: errorMessageHtml,
          confirmButtonText: "OK"
        });
      }

      validateData(dataUsuarios: any[], errorMessages: string[]): boolean {
        let isValid = true;
      
        dataUsuarios.forEach((usuario, index) => {
          if (typeof usuario.docusuario !== 'string' || usuario.docusuario.trim() === '') {
            errorMessages.push(`Usuario ${index + 1}: El DNI no es válido.`);
            isValid = false;
          }
      
          if (typeof usuario.usuarioredtde !== 'string' || usuario.usuarioredtde.trim() === '') {
            errorMessages.push(`Usuario ${index + 1}: El usuario de red TDE no es válido.`);
            isValid = false;
          }
      
          if (typeof usuario.usuarioportal !== 'string' || usuario.usuarioportal.trim() === '') {
            errorMessages.push(`Usuario ${index + 1}: El usuario del portal no es válido.`);
            isValid = false;
          }
      
          if (typeof usuario.correocorp !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(usuario.correocorp)) {
            errorMessages.push(`Usuario ${index + 1}: El correo corporativo no es válido.`);
            isValid = false;
          }
      
          if (typeof usuario.celular !== 'string' || !/^\d{9}$/.test(usuario.celular)) {
            errorMessages.push(`Usuario ${index + 1}: El celular debe tener 9 dígitos.`);
            isValid = false;
          }
        });
      
        return isValid;
      }

      
        cambiarpagina(e: PageEvent) {
          //console.log(e, 'first');
          this.desde = e.pageIndex * e.pageSize;
          this.hasta = this.desde + e.pageSize;
        }
      

    getUsuarioEntel(idemppaisnegcue: number) {
        this.allocationService.getUsuarioEntel(idemppaisnegcue).subscribe(
            res => {
                console.log('Usuarios Entel:', res);
                
                if (Array.isArray(res) && res.length > 0) {
                    this.usuariosEntel = res; // Almacenar los datos en la variable
                } else {
                    this.usuariosEntel = []; // Si no hay datos, limpiar la lista
                    Swal.fire({
                        icon: 'info',
                        title: 'Usuarios Entel',
                        text: 'No se encontraron usuarios.',
                        confirmButtonText: 'OK'
                    });
                }
            },
            error => {
                console.error('Error al obtener usuarios:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al obtener los usuarios.',
                    confirmButtonText: 'OK'
                });
            }
        );
    }

  
    
    guardarUsuarioEntel() {
      console.log('guardarROL: ', this.dataUsuarios);
      this.allocationService.postUsuarioEntel(this.dataUsuarios).subscribe(res => {
          console.log('RES ROLES:', res);
          
          if (res.length > 0) {
              Swal.fire({
                  icon: 'success',
                  title: 'Usuarios Entel',
                  text: res[0].message, // Accede al primer elemento del array
                  confirmButtonText: 'OK'
              }).then(() => {
                  this.getUsuarioEntel(this.idemppaisnegcue);
              });
          }
      });
      this.getUsuarioEntel(this.idemppaisnegcue);
  }

  eliminarUsuarioEntel(usuario: any): void {
    console.log('Eliminar usuario:', usuario);
    if (!usuario || !usuario.idusuarioentel) {
        console.error('Usuario inválido para eliminación', usuario);
        return;
    }
    
    usuario.usuariomodificacion = this.usuario;
    
    this.allocationService.deleteUsuarioEntel(usuario.idusuarioentel, this.usuario).subscribe(res => {
        console.log('RES ELIMINAR:', res);
        
        Swal.fire({
            icon: res.success ? 'success' : 'error',
            title: 'Usuarios Entel',
            text: res.message,
            confirmButtonText: 'OK'
        }).then(() => {
            this.getUsuarioEntel(this.idemppaisnegcue);
        });
    }
    )
  }


  
  
}
