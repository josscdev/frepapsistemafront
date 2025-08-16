import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FirmaBundleComponent } from './firma-bundle.component';

describe('FirmaBundleComponent', () => {
  let component: FirmaBundleComponent;
  let fixture: ComponentFixture<FirmaBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FirmaBundleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FirmaBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
