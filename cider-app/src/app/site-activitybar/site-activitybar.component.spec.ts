import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteActivitybarComponent } from './site-activitybar.component';

describe('SiteActivitybarComponent', () => {
  let component: SiteActivitybarComponent;
  let fixture: ComponentFixture<SiteActivitybarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SiteActivitybarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SiteActivitybarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
