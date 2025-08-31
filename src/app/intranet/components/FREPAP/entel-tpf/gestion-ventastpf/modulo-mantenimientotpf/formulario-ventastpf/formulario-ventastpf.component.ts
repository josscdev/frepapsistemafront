import { CommonModule } from '@angular/common';
import { Component, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { ModelostpfComponent } from './modelostpf/modelostpf.component';
import { AccesoriostpfComponent } from './accesoriostpf/accesoriostpf.component';
import { AccesoriotpfService } from '../../../../../../services/entel-tpf/mantenimientos/accesoriotpf.service';
import { ModelotpfService } from '../../../../../../services/entel-tpf/mantenimientos/modelotpf.service';

@Component({
  selector: 'app-formulario-ventastpf',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatPaginatorModule,
    ModelostpfComponent,
    AccesoriostpfComponent
  ],
  templateUrl: './formulario-ventastpf.component.html',
  styleUrl: './formulario-ventastpf.component.css'
})
export class FormularioVentastpfComponent {
  @ViewChild(ModelostpfComponent) modelostpfComponent!: ModelostpfComponent;
  @ViewChild(AccesoriostpfComponent) accesoriostpfComponent!: AccesoriostpfComponent;

  tipo: string = '';
  activeButton: string | null = null;

  titleColor: string = 'text-black'; // Color predeterminado

  usuario: string | null = null;

  idemppaisnegcue: number = 0;

  constructor(
    private fb: UntypedFormBuilder,
    private accesorioService: AccesoriotpfService,
    private modeloService: ModelotpfService,
    private paginatorIntl: MatPaginatorIntl
  ) {
    // this.manegementForm = this.createFormTurn();
    this.paginatorIntl.itemsPerPageLabel = "Registros por página: ";
    this.usuario = localStorage.getItem('user');
    this.idemppaisnegcue = Number(localStorage.getItem('idemppaisnegcue'));
  }

  ngOnInit(): void { }

  setActiveButton(buttonType: string) {
    // this.limpiarFormulario();

    this.activeButton = buttonType;
    if (buttonType === 'modelos') {
      this.tipo = 'Modelos';
      setTimeout(() => {
        if (this.modelostpfComponent) {
          console.log('Entra Modelos');
          this.modelostpfComponent.getModeloRomWeb(this.idemppaisnegcue);
        }
      }, 0); // Retraso mínimo para permitir la inicialización del componente
      //this.getModeloRomWeb();
      this.titleColor = 'text-modelo'; // Color del título para "modelos"
    } else if (buttonType === 'accesorios') {
      this.tipo = 'Accesorios';
      setTimeout(() => {
        if (this.accesoriostpfComponent) {
          console.log('Entra Accesorios');
          this.accesoriostpfComponent.getAccesorioRomWeb(this.idemppaisnegcue);
        }
      }, 0); // Retraso mínimo para permitir la inicialización del componente
      // this.getAccesorioRomWeb();
      this.titleColor = 'text-accesorio'; // Color del título para "accesorios"
    }
  }
}
