import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdministracionPermisosComponent } from './administracion-permisos.component';

describe('AdministracionPermisosComponent', () => {
  let component: AdministracionPermisosComponent;
  let fixture: ComponentFixture<AdministracionPermisosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdministracionPermisosComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AdministracionPermisosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
