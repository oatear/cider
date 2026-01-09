import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EntityTableComponent } from './entity-table.component';

describe('EntityTableComponent', () => {
  let component: EntityTableComponent<any, any>;
  let fixture: ComponentFixture<EntityTableComponent<any, any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EntityTableComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EntityTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
