import { Component, inject, signal, WritableSignal } from '@angular/core';
import { OracleService } from '../../../../../../../services/entel-retail/inventario/oracle.service';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { OracleDetalleE, OracleDetalleF, OracleDetalleS } from '../models/oracle';

@Component({
  selector: 'app-detalle-conciliacion',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './detalle-conciliacion.component.html',
  styleUrl: './detalle-conciliacion.component.css'
})
export class DetalleConciliacionComponent {
  private readonly _OracleService = inject(OracleService);
  private readonly _dialogRef = inject(MatDialogRef<DetalleConciliacionComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  // Listas
  lEncontrados: WritableSignal<OracleDetalleE[]> = signal([]);
  lSobrantes: WritableSignal<OracleDetalleS[]> = signal([]);
  lFaltantes: WritableSignal<OracleDetalleF[]> = signal([]);

  constructor() {
    console.log(this.data);
    if(this.data.listaEncontrados) this.lEncontrados.set(this.data.listaEncontrados);
    if(this.data.listaSobrantes) this.lSobrantes.set(this.data.listaSobrantes);
    if(this.data.listaFaltantes) this.lFaltantes.set(this.data.listaFaltantes);
  }

  closeDialog() {
    this._dialogRef.close();
  }
}
