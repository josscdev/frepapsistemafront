import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { ReportestpfService } from '../../../../../services/entel-tpf/reportestpf/reportestpf.service';
import { ReportesService } from '../../../../../services/entel-retail/reportes/reportes.service';

@Component({
  selector: 'app-bientel',
  standalone: true,
  imports: [ CommonModule,
        FormsModule,
        ReactiveFormsModule],
  templateUrl: './bientel.component.html',
  styleUrl: './bientel.component.css'
})
export class BientelComponent implements OnInit{
 usuario: string = '';
  idemppaisnegcue: number;
  reportes: any[] = []; // Lista de reportes obtenida del servicio
  embeddedUrl: SafeResourceUrl | null = null; // URL del reporte seleccionado
  urlSafeExcel: SafeResourceUrl | null = null;
  constructor(
    private fb: UntypedFormBuilder,
    private reportesService: ReportesService,
    public sanitizer: DomSanitizer
  ) { 
    this.usuario = localStorage.getItem('user') || '';
    console.log('usuario reporte', this.usuario);

    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
    console.log('idemppaisnegcue reportes', this.idemppaisnegcue);

    // Llamada al servicio para obtener los reportes
    this.reportesService.getReportes(this.usuario, this.idemppaisnegcue).subscribe(res => {
      console.log('lista reportes', res);
      this.reportes = res; // Asignamos la lista de reportes al arreglo
    });
  }

  ngOnInit() {
    const urlReporte = 'http://20.20.0.36/ReportServer/Pages/ReportViewer.aspx?/ROM/ENTEL/Usuarios&rs:Command=Render';
    this.urlSafeExcel = this.sanitizer.bypassSecurityTrustResourceUrl(urlReporte);
  }

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
  
  descargarExcel() {
    const fechaInicio = '2025-07-01';
    const fechaFin = '2025-07-31';
    const nombreCuenta = 'ROM';
  
    this.reportesService.descargarReporte(fechaInicio, fechaFin, nombreCuenta)
      .subscribe(blob => {
        const blobUrl = window.URL.createObjectURL(blob);
  
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'ReporteRolDiario.xlsx';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
  
        window.URL.revokeObjectURL(blobUrl);
      });
  }
}
