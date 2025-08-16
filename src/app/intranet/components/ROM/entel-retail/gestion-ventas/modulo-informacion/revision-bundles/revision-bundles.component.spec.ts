import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RevisionBundlesComponent } from './revision-bundles.component';

describe('RevisionBundlesComponent', () => {
  let component: RevisionBundlesComponent;
  let fixture: ComponentFixture<RevisionBundlesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RevisionBundlesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RevisionBundlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
