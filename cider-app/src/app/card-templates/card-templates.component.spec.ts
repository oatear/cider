import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardTemplatesComponent } from './card-templates.component';

describe('CardTemplatesComponent', () => {
  let component: CardTemplatesComponent;
  let fixture: ComponentFixture<CardTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
