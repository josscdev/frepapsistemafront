import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionTurnosPDVComponent } from './asignacion-turnos-pdv.component';

describe('AsignacionTurnosPDVComponent', () => {
  let component: AsignacionTurnosPDVComponent;
  let fixture: ComponentFixture<AsignacionTurnosPDVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionTurnosPDVComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignacionTurnosPDVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
