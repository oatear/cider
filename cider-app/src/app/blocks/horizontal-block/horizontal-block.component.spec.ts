import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalBlockComponent } from './horizontal-block.component';

describe('HorizontalBlockComponent', () => {
  let component: HorizontalBlockComponent;
  let fixture: ComponentFixture<HorizontalBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [HorizontalBlockComponent]
    });
    fixture = TestBed.createComponent(HorizontalBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
