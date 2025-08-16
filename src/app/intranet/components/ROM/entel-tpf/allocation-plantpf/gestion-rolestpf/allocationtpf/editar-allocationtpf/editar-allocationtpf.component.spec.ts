import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAllocationtpfComponent } from './editar-allocationtpf.component';

describe('EditarAllocationtpfComponent', () => {
  let component: EditarAllocationtpfComponent;
  let fixture: ComponentFixture<EditarAllocationtpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarAllocationtpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarAllocationtpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
