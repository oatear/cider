import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityDialogComponent } from './entity-dialog.component';

describe('EntityDialogComponent', () => {
  let component: EntityDialogComponent;
  let fixture: ComponentFixture<EntityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EntityDialogComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
