import { Component, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Inject } from '@angular/core';
import { AfiliacionesService } from '../../../../../../../services/frepapmodule/moduloregistro/afiliaciones.service';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-ver-documentacion',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
  ],
  templateUrl: './ver-documentacion.component.html',
  styleUrl: './ver-documentacion.component.css'
})
export class VerDocumentacionComponent implements OnInit {
  pdfUrl: SafeResourceUrl | null = null;
  loading = true;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { id: number },
    private dialogRef: MatDialogRef<VerDocumentacionComponent>,
    private afiliacionesService: AfiliacionesService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.cargarPDF();
  }

  cargarPDF() {
    this.loading = true;
    this.afiliacionesService.getDocumentacionById(this.data.id).subscribe({
      next: (res) => {
        if (res && res.fichaafiliacionpdf) {
          // El backend ya envía el prefijo data:application/pdf;base64,
          this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(res.fichaafiliacionpdf);
        } else {
          console.warn('No se encontró el PDF en la respuesta');
        }        
        this.loading = false;
      },
      error: (err) => {
        console.error('Error al cargar PDF:', err);
        this.loading = false;
      }
    });
  }

  cerrar() {
    this.dialogRef.close();
  }
}
