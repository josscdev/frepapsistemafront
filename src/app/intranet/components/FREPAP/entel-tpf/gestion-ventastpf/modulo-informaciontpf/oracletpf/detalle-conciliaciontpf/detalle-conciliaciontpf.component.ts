import { CommonModule } from '@angular/common';
import { Component, inject, signal, WritableSignal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { OracleDetalleE, OracleDetalleF, OracleDetalleS } from '../models/oracletpf';

@Component({
  selector: 'app-detalle-conciliaciontpf',
  standalone: true,
  imports: [CommonModule, MatDialogModule, ReactiveFormsModule],
  templateUrl: './detalle-conciliaciontpf.component.html',
  styleUrl: './detalle-conciliaciontpf.component.css'
})
export class DetalleConciliaciontpfComponent {
  private readonly _dialogRef = inject(MatDialogRef<DetalleConciliaciontpfComponent>);
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
