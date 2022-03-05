import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardAttributesComponent } from './card-attributes.component';

describe('CardAttributesComponent', () => {
  let component: CardAttributesComponent;
  let fixture: ComponentFixture<CardAttributesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardAttributesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardAttributesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
