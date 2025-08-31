import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AllocationtpfComponent } from './allocationtpf.component';

describe('AllocationtpfComponent', () => {
  let component: AllocationtpfComponent;
  let fixture: ComponentFixture<AllocationtpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AllocationtpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AllocationtpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
