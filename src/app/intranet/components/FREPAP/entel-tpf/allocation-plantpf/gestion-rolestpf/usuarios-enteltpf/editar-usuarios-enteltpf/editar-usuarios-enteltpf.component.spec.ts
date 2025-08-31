import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarUsuariosEnteltpfComponent } from './editar-usuarios-enteltpf.component';

describe('EditarUsuariosEnteltpfComponent', () => {
  let component: EditarUsuariosEnteltpfComponent;
  let fixture: ComponentFixture<EditarUsuariosEnteltpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarUsuariosEnteltpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarUsuariosEnteltpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
