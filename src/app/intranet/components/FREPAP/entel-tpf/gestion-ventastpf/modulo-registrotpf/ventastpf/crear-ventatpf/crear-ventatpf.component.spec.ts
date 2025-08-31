import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrearVentatpfComponent } from './crear-ventatpf.component';

describe('CrearVentatpfComponent', () => {
  let component: CrearVentatpfComponent;
  let fixture: ComponentFixture<CrearVentatpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CrearVentatpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CrearVentatpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
