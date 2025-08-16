import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionBundleComponent } from './confirmacion-bundle.component';

describe('ConfirmacionBundleComponent', () => {
  let component: ConfirmacionBundleComponent;
  let fixture: ComponentFixture<ConfirmacionBundleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionBundleComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmacionBundleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
