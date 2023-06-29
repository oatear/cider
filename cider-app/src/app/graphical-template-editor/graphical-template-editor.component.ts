import { Component, ElementRef, HostListener, Input, OnInit, QueryList, ViewChildren } from '@angular/core';
import { CardTemplate } from '../data-services/types/card-template.type';
import { MoveableManagerInterface, Renderer } from 'ngx-moveable';

@Component({
  selector: 'app-graphical-template-editor',
  templateUrl: './graphical-template-editor.component.html',
  styleUrls: ['./graphical-template-editor.component.scss']
})
export class GraphicalTemplateEditorComponent implements OnInit {
  
  @ViewChildren('elementRef') elementRefs: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  @ViewChildren('cardRef') cardRefs: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  @Input() template: CardTemplate = {} as CardTemplate;
  card: Element;
  elements: Element[] = [];
  target: any;
  elementGuidelines: any[] = [];
  scale: number = 0.3;
  keepRatio: boolean = false;

  readonly DimensionViewable = {
    name: "dimensionViewable",
    props: [],
    events: [],
    render(moveable: MoveableManagerInterface<any, any>, React: Renderer) {
        const rect = moveable.getRect();
        return React.createElement("div", {
            key: "dimension-viewer",
            className: "moveable-dimension",
            style: {
                position: "absolute",
                left: `${rect.width / 2}px`,
                top: `${rect.height + 20}px`,
                background: "#4af",
                borderRadius: "2px",
                padding: "2px 4px",
                color: "white",
                fontSize: "13px",
                whiteSpace: "nowrap",
                fontWeight: "bold",
                willChange: "transform",
                transform: `translate(-50%, 0px)`
            }
        }, [
            "\n            ",
            Math.round(rect.offsetWidth),
            " x ",
            Math.round(rect.offsetHeight),
            "\n        "
        ]);
    }
  } as const;

  constructor() {
    this.card = {
      className: 'card',
      top: 0,
      left: 0,
      width: 825,
      height: 1125
    };
  }

  ngOnInit(): void {

  }

  explodeTemplate() {
  }

  toHtml() {
    console.log('to html', this.card, this.elements, this.template?.html);
  }

  changeScale(change: number) {
    this.scale *= change;
    if (this.scale < 0.13) {
      this.scale = Math.pow(0.6, 4);
    }
  }

  createNewElement() {
    this.elements.push( {
      className: 'element-' + this.elements.length,
      top: 0,
      left: 0,
      width: 300,
      height: 300
    });
  }

  @HostListener("window:keydown", ['$event'])
  onKeyDown(event:KeyboardEvent) {
    if (event.key === 'Shift') {
      this.keepRatio = true;
    }
    // console.log(`Keydown ${event.key}`);
  }

  @HostListener("window:keyup", ['$event'])
  onKeyUp(event:KeyboardEvent) {
    if (event.key === 'Shift') {
      this.keepRatio = false;
    }
    // console.log(`Keyup ${event.key}`);
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
    // e.target.style.transform = e.transform;
    e.target.style.left = e.left + 'px';
    e.target.style.top = e.top + 'px';
    // e.target.style.top = e.translate[1] + 'px';
    // e.target.style.left = e.translate[0] + 'px';
    // console.log('onDrag', e);
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
