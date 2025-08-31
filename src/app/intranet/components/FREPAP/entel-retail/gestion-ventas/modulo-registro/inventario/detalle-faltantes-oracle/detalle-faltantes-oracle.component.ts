import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';

@Component({
  selector: 'app-detalle-faltantes-oracle',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule, FormsModule],
  templateUrl: './detalle-faltantes-oracle.component.html',
  styleUrl: './detalle-faltantes-oracle.component.css'
})
export class DetalleFaltantesOracleComponent {

}
