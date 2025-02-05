import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DefaultCardBlockComponent } from './default-card-block.component';

describe('DefaultCardBlockComponent', () => {
  let component: DefaultCardBlockComponent;
  let fixture: ComponentFixture<DefaultCardBlockComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DefaultCardBlockComponent]
    });
    fixture = TestBed.createComponent(DefaultCardBlockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
