import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-auth-layout',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './auth-layout.component.html',
  styleUrl: './auth-layout.component.css'
})
export class AuthLayoutComponent implements OnInit{
  idempresa: any; // Suponiendo que obtienes este valor del localStorage

  constructor() { }

  ngOnInit(): void {
    // Aquí obtienes el valor de idempresa del localStorage
    this.idempresa = Number(localStorage.getItem('idempresa'));
    console.log('empresita',this.idempresa);
    
  }

  getImagePath(idempresa: number): string {
    this.idempresa = idempresa;
    switch (idempresa) {
      case 2:
        return 'assets/img/Tawa/logo_tawa.png';
      case 1:
        return 'assets/img/frepap/frep.jpg';
      case 3:
        return 'assets/img/Limtek/logo_limtek.png';
      default:
        return ''; // Puedes proporcionar una ruta predeterminada si no se encuentra ninguna coincidencia
    }
  }
}
