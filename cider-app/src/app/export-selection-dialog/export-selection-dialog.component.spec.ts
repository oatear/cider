import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportSelectionDialogComponent } from './export-selection-dialog.component';

describe('ExportSelectionDialogComponent', () => {
  let component: ExportSelectionDialogComponent;
  let fixture: ComponentFixture<ExportSelectionDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportSelectionDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ExportSelectionDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
