import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GraphicalTemplateEditorComponent } from './graphical-template-editor.component';

describe('GraphicalTemplateEditorComponent', () => {
  let component: GraphicalTemplateEditorComponent;
  let fixture: ComponentFixture<GraphicalTemplateEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ GraphicalTemplateEditorComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(GraphicalTemplateEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
