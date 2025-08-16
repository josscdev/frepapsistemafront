import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosEntelComponent } from './usuarios-entel.component';

describe('UsuariosEntelComponent', () => {
  let component: UsuariosEntelComponent;
  let fixture: ComponentFixture<UsuariosEntelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosEntelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsuariosEntelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
