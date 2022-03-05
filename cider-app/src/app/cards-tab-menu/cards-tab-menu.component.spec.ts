import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardsTabMenuComponent } from './cards-tab-menu.component';

describe('CardsTabMenuComponent', () => {
  let component: CardsTabMenuComponent;
  let fixture: ComponentFixture<CardsTabMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardsTabMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardsTabMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
