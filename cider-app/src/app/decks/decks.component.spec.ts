import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DecksComponent } from './decks.component';

describe('DecksComponent', () => {
  let component: DecksComponent;
  let fixture: ComponentFixture<DecksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DecksComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DecksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
