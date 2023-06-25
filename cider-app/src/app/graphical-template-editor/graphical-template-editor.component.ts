import { Component, ElementRef, OnInit, QueryList, ViewChild, ViewChildren } from '@angular/core';

@Component({
  selector: 'app-graphical-template-editor',
  templateUrl: './graphical-template-editor.component.html',
  styleUrls: ['./graphical-template-editor.component.scss']
})
export class GraphicalTemplateEditorComponent implements OnInit {
  
  @ViewChildren('elementRef') elementRefs: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  @ViewChildren('cardRef') cardRefs: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  card: Element;
  elements: Element[] = [];
  target: any;
  elementGuidelines: any[] = [];

  constructor() {
    this.card = {
      className: 'card',
      top: 0,
      left: 0,
      width: 300,
      height: 400
    };
  }

  ngOnInit(): void {
  }

  createNewElement() {
    this.elements.push( {
      className: 'element-' + this.elements.length,
      top: 0,
      left: 0,
      width: 100,
      height: 100
    });
  }

  setTarget(e: any) {
    console.log('setTarget', e);
    if (this.target === e.target) {
      this.resetTarget();
      return;
    }
    var selectedElement = e.target;
    this.target = selectedElement;
    var elementGuidelines: any[] = [this.cardRefs?.first?.nativeElement];
    this.elementRefs.forEach(element => {
      if (element.nativeElement != selectedElement) {
        elementGuidelines.push(element.nativeElement);
      }
    });
    console.log('elementGuidelines:', elementGuidelines, selectedElement, this.cardRefs?.first);
    this.elementGuidelines = elementGuidelines;
  }

  resetTarget() {
    console.log('resetTarget');
    this.target = undefined;
  }

  onDrag(e: any) {
    e.target.style.transform = e.transform;
    // console.log('onDrag', e);
    // this.elements[0].top = e.translate[1];
    // this.elements[0].left = e.translate[0];
  }
  onResize(e: any) {
    e.target.style.width = `${e.width}px`;
    e.target.style.height = `${e.height}px`;
    e.target.style.transform = e.drag.transform;
  }
  onRotate(e: any) {
    e.target.style.transform = e.drag.transform;
  }
}

interface Element {
    className: string;
    top: number;
    left: number;
    width: number;
    height: number;
}
