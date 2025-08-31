import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignacionHorariosPDVComponent } from './asignacion-horarios-pdv.component';

describe('AsignacionHorariosPDVComponent', () => {
  let component: AsignacionHorariosPDVComponent;
  let fixture: ComponentFixture<AsignacionHorariosPDVComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignacionHorariosPDVComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AsignacionHorariosPDVComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
