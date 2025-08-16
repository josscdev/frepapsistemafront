import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuariosEntelComponent } from './editar-usuarios-entel.component';

describe('EditarUsuariosEntelComponent', () => {
  let component: EditarUsuariosEntelComponent;
  let fixture: ComponentFixture<EditarUsuariosEntelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUsuariosEntelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarUsuariosEntelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
