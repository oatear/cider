import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CardThumbnailsComponent } from './card-thumbnails.component';

describe('CardThumbnailsComponent', () => {
  let component: CardThumbnailsComponent;
  let fixture: ComponentFixture<CardThumbnailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CardThumbnailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CardThumbnailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
