import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteSidebarComponent } from './site-sidebar.component';

describe('SiteSidebarComponent', () => {
  let component: SiteSidebarComponent;
  let fixture: ComponentFixture<SiteSidebarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SiteSidebarComponent]
    });
    fixture = TestBed.createComponent(SiteSidebarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
