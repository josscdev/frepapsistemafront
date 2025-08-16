import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-start',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './start.component.html',
  styleUrl: './start.component.css',
})
export class StartComponent {

  empresaROM:number = 1;
  empresaTAWA:number = 2;
  empresaLIMTEK:number = 3;

  isLoadingROM: boolean = false;
  isLoadingTAWA: boolean = false;
  isLoadingLIMTEK: boolean = false;

  constructor(private router: Router, private authService: AuthService
    ) {
    localStorage.clear();
  }

  loginRombiROM() {
    this.isLoadingROM = true;
    this.authService.getCompany().subscribe({
      next: (response) => {
        console.log('Respuesta del servicio:', response);

        // Verificar si la respuesta contiene el id de empresa '08'
        const empresaEncontrada = response.find((empresa:any) => empresa.idempresa === this.empresaROM);

        console.log('empresaEncontrada:', empresaEncontrada)

        if (empresaEncontrada) {
          console.log('Empresa ROM encontrada:', empresaEncontrada.idempresa);
          localStorage.setItem('idempresa', empresaEncontrada.idempresa);
          // Navegar a la ruta 'auth'
          this.router.navigate(['auth']);
        } else {
          console.log('Empresa ROM no encontrada en la respuesta.');
          // Manejar el caso en el que el id de empresa '08' no se encuentra en la respuesta
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: "<b>Se produjo un Error Interno</b>",
          showCloseButton: true,
          text: "Error en el Servidor!"
        });

      },
    }).add(() => this.isLoadingROM = false); // Desactivar el spinner;
  }

  loginRombiTAWA() {
    this.isLoadingTAWA = true;
    this.authService.getCompany().subscribe({
      next: (response) => {
        console.log('Respuesta del servicio:', response);

        // Verificar si la respuesta contiene el id de empresa '08'
        const empresaEncontrada = response.find((empresa:any) => empresa.idempresa === this.empresaTAWA);

        if (empresaEncontrada) {
          console.log('Empresa TAWA encontrada:', empresaEncontrada.idempresa);
          localStorage.setItem('idempresa', empresaEncontrada.idempresa);
          // Navegar a la ruta 'auth'
          this.router.navigate(['auth']);
        } else {
          console.log('Empresa TAWA no encontrada en la respuesta.');
          const Toast = Swal.mixin({
            toast: true,
            position: "bottom-end",
            showConfirmButton: false,
            timer: 3000,
            timerProgressBar: true,
            didOpen: (toast) => {
              toast.onmouseenter = Swal.stopTimer;
              toast.onmouseleave = Swal.resumeTimer;
            }
          });
          Toast.fire({
            icon: "error",
            title: "<b>Se produjo un Error Interno</b>",
            showCloseButton: true,
            text: "Error en el Servidor!"
          });

          // Manejar el caso en el que el id de empresa '08' no se encuentra en la respuesta
        }
      },
      error: (error) => {
        console.error('Error al obtener los datos del usuario:', error);
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: "<b>Se produjo un Error Interno</b>",
          showCloseButton: true,
          text: "Error en el Servidor!"
        });

      },
    }).add(() => this.isLoadingTAWA = false); // Desactivar el spinner;
  }

  loginRombiLIMTEK() {
    this.isLoadingLIMTEK = true;
    this.authService.getCompany().subscribe({
      next: (response) => {
        console.log('Respuesta del servicio:', response);

        // Verificar si la respuesta contiene el id de empresa '08'
        const empresaEncontrada = response.find((empresa:any) => empresa.idempresa === this.empresaLIMTEK);

        if (empresaEncontrada) {
          console.log('Empresa Limtek encontrada:', empresaEncontrada.idempresa);
          localStorage.setItem('idempresa', empresaEncontrada.idempresa);
          // Navegar a la ruta 'auth'
          this.router.navigate(['auth']);
        } else {
          console.log('Empresa Limtek no encontrada en la respuesta.');
          // Manejar el caso en el que el id de empresa '08' no se encuentra en la respuesta
        }
      },
      error: (error) => {
        const Toast = Swal.mixin({
          toast: true,
          position: "bottom-end",
          showConfirmButton: false,
          timer: 3000,
          timerProgressBar: true,
          didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
          }
        });
        Toast.fire({
          icon: "error",
          title: "<b>Se produjo un Error Interno</b>",
          showCloseButton: true,
          text: "Error en el Servidor!"
        });

        console.error('Error al obtener los datos del usuario:', error);
      },
    }).add(() => this.isLoadingLIMTEK = false); // Desactivar el spinner;
  }



}
