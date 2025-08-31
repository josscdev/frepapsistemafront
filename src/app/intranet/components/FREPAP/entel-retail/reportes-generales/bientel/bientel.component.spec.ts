import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BientelComponent } from './bientel.component';

describe('BientelComponent', () => {
  let component: BientelComponent;
  let fixture: ComponentFixture<BientelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BientelComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BientelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
