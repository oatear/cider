import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteContentComponent } from './site-content.component';

describe('SiteContentComponent', () => {
  let component: SiteContentComponent;
  let fixture: ComponentFixture<SiteContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteContentComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
