import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { ReportestpfService } from '../../../../../services/entel-tpf/reportestpf/reportestpf.service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bienteltpf',
  standalone: true,
  imports: [  CommonModule,
      FormsModule,
      ReactiveFormsModule],
  templateUrl: './bienteltpf.component.html',
  styleUrl: './bienteltpf.component.css'
})
export class BienteltpfComponent implements OnInit {
  usuario: string = '';
  idemppaisnegcue: number;
  reportes: any[] = []; // Lista de reportes obtenida del servicio
  embeddedUrl: SafeResourceUrl | null = null; // URL del reporte seleccionado

  constructor(
    private fb: UntypedFormBuilder,
    private reportestpfService: ReportestpfService,
    private sanitizer: DomSanitizer
  ) { 
    this.usuario = localStorage.getItem('user') || '';
    console.log('usuario reporte', this.usuario);

    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
    console.log('idemppaisnegcue reportes', this.idemppaisnegcue);

    // Llamada al servicio para obtener los reportes
    this.reportestpfService.getReportesTPF(this.usuario, this.idemppaisnegcue).subscribe(res => {
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
