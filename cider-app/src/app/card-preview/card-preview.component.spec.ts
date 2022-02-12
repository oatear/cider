import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardPreviewComponent } from './card-preview.component';

describe('CardPreviewComponent', () => {
  let component: CardPreviewComponent;
  let fixture: ComponentFixture<CardPreviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardPreviewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
