import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVouchertpfComponent } from './editar-vouchertpf.component';

describe('EditarVouchertpfComponent', () => {
  let component: EditarVouchertpfComponent;
  let fixture: ComponentFixture<EditarVouchertpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarVouchertpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarVouchertpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
