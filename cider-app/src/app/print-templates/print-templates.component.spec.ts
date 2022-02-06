import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrintTemplatesComponent } from './print-templates.component';

describe('PrintTemplatesComponent', () => {
  let component: PrintTemplatesComponent;
  let fixture: ComponentFixture<PrintTemplatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PrintTemplatesComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PrintTemplatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
