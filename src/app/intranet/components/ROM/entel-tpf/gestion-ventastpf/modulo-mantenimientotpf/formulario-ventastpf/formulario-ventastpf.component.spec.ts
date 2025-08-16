import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormularioVentastpfComponent } from './formulario-ventastpf.component';

describe('FormularioVentastpfComponent', () => {
  let component: FormularioVentastpfComponent;
  let fixture: ComponentFixture<FormularioVentastpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormularioVentastpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FormularioVentastpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
