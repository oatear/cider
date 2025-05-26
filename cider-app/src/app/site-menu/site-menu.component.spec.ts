import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteMenuComponent } from './site-menu.component';

describe('SiteMenuComponent', () => {
  let component: SiteMenuComponent;
  let fixture: ComponentFixture<SiteMenuComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteMenuComponent]
    });
    fixture = TestBed.createComponent(SiteMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
