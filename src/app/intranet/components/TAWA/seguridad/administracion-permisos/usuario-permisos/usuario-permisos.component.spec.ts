import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioPermisosComponent } from './usuario-permisos.component';

describe('UsuarioPermisosComponent', () => {
  let component: UsuarioPermisosComponent;
  let fixture: ComponentFixture<UsuarioPermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuarioPermisosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsuarioPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
