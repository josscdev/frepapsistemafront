import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BienteltpfComponent } from './bienteltpf.component';

describe('BienteltpfComponent', () => {
  let component: BienteltpfComponent;
  let fixture: ComponentFixture<BienteltpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BienteltpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BienteltpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
