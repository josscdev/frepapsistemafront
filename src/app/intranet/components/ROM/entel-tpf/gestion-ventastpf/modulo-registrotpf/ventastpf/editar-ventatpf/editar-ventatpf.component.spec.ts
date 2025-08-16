import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVentatpfComponent } from './editar-ventatpf.component';

describe('EditarVentatpfComponent', () => {
  let component: EditarVentatpfComponent;
  let fixture: ComponentFixture<EditarVentatpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarVentatpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarVentatpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
