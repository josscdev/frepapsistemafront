import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditarAllocationComponent } from './editar-allocation.component';

describe('EditarAllocationComponent', () => {
  let component: EditarAllocationComponent;
  let fixture: ComponentFixture<EditarAllocationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarAllocationComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditarAllocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
