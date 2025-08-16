import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfirmacionBundletpfComponent } from './confirmacion-bundletpf.component';

describe('ConfirmacionBundletpfComponent', () => {
  let component: ConfirmacionBundletpfComponent;
  let fixture: ComponentFixture<ConfirmacionBundletpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmacionBundletpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ConfirmacionBundletpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
