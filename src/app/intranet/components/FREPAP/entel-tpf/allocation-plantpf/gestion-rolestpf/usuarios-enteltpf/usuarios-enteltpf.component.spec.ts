import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuariosEnteltpfComponent } from './usuarios-enteltpf.component';

describe('UsuariosEnteltpfComponent', () => {
  let component: UsuariosEnteltpfComponent;
  let fixture: ComponentFixture<UsuariosEnteltpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsuariosEnteltpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(UsuariosEnteltpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
