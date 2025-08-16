import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { SafeResourceUrl, DomSanitizer } from '@angular/platform-browser';
import { ReporteswinretService } from '../../../../../services/rom/win-retail/reporteswinret/reporteswinret.service';

@Component({
  selector: 'app-biwinret',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './biwinret.component.html',
  styleUrl: './biwinret.component.css'
})
export class BiwinretComponent {
  usuario: string = '';
    idemppaisnegcue: number;
    reportes: any[] = []; // Lista de reportes obtenida del servicio
    embeddedUrl: SafeResourceUrl | null = null; // URL del reporte seleccionado
  
    constructor(
      private fb: UntypedFormBuilder,
      private reportesService: ReporteswinretService,
      private sanitizer: DomSanitizer
    ) { 
      this.usuario = localStorage.getItem('user') || '';
      console.log('usuario reporte', this.usuario);
  
      this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
      console.log('idemppaisnegcue reportes', this.idemppaisnegcue);
  
      // Llamada al servicio para obtener los reportes
      this.reportesService.getReportesWINRET(this.usuario, this.idemppaisnegcue).subscribe(res => {
        console.log('lista reportes', res);
        this.reportes = res; // Asignamos la lista de reportes al arreglo
      });
    }
  
    ngOnInit() {}
  
    // Método para cambiar el reporte en el iframe
    onReporteChange(event: Event) {
      const target = event.target as HTMLSelectElement; // Asegurar que sea un select
      const url = target.value;
  
      if (url) {
        this.embeddedUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      } else {
        this.embeddedUrl = null; // Limpiar el iframe si no hay selección
      }
    }
}
