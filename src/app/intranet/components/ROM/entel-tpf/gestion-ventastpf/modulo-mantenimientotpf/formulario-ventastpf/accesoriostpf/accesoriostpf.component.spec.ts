import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccesoriostpfComponent } from './accesoriostpf.component';

describe('AccesoriostpfComponent', () => {
  let component: AccesoriostpfComponent;
  let fixture: ComponentFixture<AccesoriostpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AccesoriostpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AccesoriostpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
