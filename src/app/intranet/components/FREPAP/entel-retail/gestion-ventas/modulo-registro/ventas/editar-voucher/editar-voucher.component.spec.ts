import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarVoucherComponent } from './editar-voucher.component';

describe('EditarVoucherComponent', () => {
  let component: EditarVoucherComponent;
  let fixture: ComponentFixture<EditarVoucherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarVoucherComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarVoucherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
