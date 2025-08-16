import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelostpfComponent } from './modelostpf.component';

describe('ModelostpfComponent', () => {
  let component: ModelostpfComponent;
  let fixture: ComponentFixture<ModelostpfComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModelostpfComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ModelostpfComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
