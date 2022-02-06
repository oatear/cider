import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteContentAndMenuComponent } from './site-content-and-menu.component';

describe('SiteContentAndMenuComponent', () => {
  let component: SiteContentAndMenuComponent;
  let fixture: ComponentFixture<SiteContentAndMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SiteContentAndMenuComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SiteContentAndMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
