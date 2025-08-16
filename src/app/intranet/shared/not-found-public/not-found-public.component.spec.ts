import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NotFoundPublicComponent } from './not-found-public.component';

describe('NotFoundPublicComponent', () => {
  let component: NotFoundPublicComponent;
  let fixture: ComponentFixture<NotFoundPublicComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NotFoundPublicComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NotFoundPublicComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
