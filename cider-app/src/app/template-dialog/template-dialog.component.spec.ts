import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TemplateDialogComponent } from './template-dialog.component';

describe('TemplateDialogComponent', () => {
  let component: TemplateDialogComponent;
  let fixture: ComponentFixture<TemplateDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TemplateDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TemplateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
