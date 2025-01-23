import { Component, ElementRef, HostListener, Input, OnChanges, OnInit, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { CardTemplate } from '../data-services/types/card-template.type';
import { MoveableManagerInterface, Renderer } from 'ngx-moveable';
import { Card } from '../data-services/types/card.type';
import { AssetsService } from '../data-services/services/assets.service';
import { CardToHtmlPipe } from '../shared/pipes/template-to-html.pipe';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TreeDragDropService, TreeNode } from 'primeng/api';
import GeneralUtils from '../shared/utils/general-utils';
import { Tree, TreeNodeDropEvent, TreeNodeSelectEvent } from 'primeng/tree';

@Component({
  selector: 'app-graphical-template-editor',
  templateUrl: './graphical-template-editor.component.html',
  styleUrls: ['./graphical-template-editor.component.scss'],
  providers: [TreeDragDropService]
})
export class GraphicalTemplateEditorComponent implements OnInit, OnChanges {
  
  @ViewChildren('elementRef') elementRefs: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  @ViewChildren('cardRef') cardRefs: QueryList<ElementRef> = {} as QueryList<ElementRef>;
  @ViewChildren('treeRef') treeRefs: QueryList<Tree> = {} as QueryList<Tree>;
  @Input() template: CardTemplate = {} as CardTemplate;
  @Input() card: Card = {} as Card;
  assetUrls: any;
  cardElement: Element;
  elements: Element[] = [];
  target: any;
  elementGuidelines: any[] = [];
  scale: number = 0.3;
  keepRatio: boolean = false;
  uuid: string = '0';
  cardHtml?: SafeHtml;
  elementTree: TreeNode[] = [];

  constructor(
    private assetsService: AssetsService,
    private cardToHtmlPipe: CardToHtmlPipe,
    private sanitizer: DomSanitizer) {
    this.cardElement = {
      className: 'card',
      top: 0,
      left: 0,
      width: 825,
      height: 1125
    };
  }

  ngOnInit(): void {
    this.assetsService.getAssetUrls().subscribe(assetUrls => {
      this.assetUrls = assetUrls;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    this.cardHtml = this.cardToHtmlPipe.transform(this.template, this.card, this.assetUrls, this.uuid);
    GeneralUtils.delay(100).then(() => {
      const cardElement = this.cardRefs.first.nativeElement;
      const styleElement = this.getStyleElement(cardElement);
      const elementTree = this.buildTree(cardElement);
      this.elementTree = elementTree.children || [];
      console.log('onChange', this.template, this.card, this.elementTree);
    })
  }

  private getStyleElement(cardElement: any) {
    const children = cardElement.children;
    for(var i = 0; i < children.length; i++) {
      if (children.item(i)?.localName.includes('style')) {
        return children.item(i);
      }
    }
    return undefined;
  }

  buildTree(element: any): TreeNode {
    const label: string = element.localName + ' ' + element.className;
    const elementChildren: HTMLCollection = element.children;
    var nodeChildren: TreeNode[] = [];
    if (elementChildren) {
      for(var i = 0; i < elementChildren.length; i++) {
        if (!elementChildren.item(i)?.localName.includes('style')) {
          nodeChildren.push(this.buildTree(elementChildren.item(i)));
        }
      }
    }
    return {label: label, data: element, children: nodeChildren, expanded: nodeChildren !== undefined,
      draggable: true, droppable: true};
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
    const cardElement = this.cardRefs.first.nativeElement;
    const element = document.createElement('div');
    element.className = 'element-' + cardElement.children.length;
    element.style.top = `0`;
    element.style.left = `0`;
    element.style.width = `300px`;
    element.style.height = `300px`;
    element.style.position = 'absolute';
    element.style.display = 'block';
    element.style.backgroundColor = '#434f61';
    cardElement.appendChild(element);
    this.rebuildTree();
  }

  private rebuildTree() {
    const cardElement = this.cardRefs.first.nativeElement;
    const elementTree = this.buildTree(cardElement);
    this.elementTree = elementTree.children || [];
  }

  @HostListener("window:keydown", ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.keepRatio = true;
    } else if (event.key === 'Delete' && this.target) {
      this.target.remove();
      this.resetTarget();
      this.rebuildTree();
    }
    // console.log(`Keydown ${event.key}`);
  }

  @HostListener("window:keyup", ['$event'])
  onKeyUp(event: KeyboardEvent) {
    if (event.key === 'Shift') {
      this.keepRatio = false;
    }
    // console.log(`Keyup ${event.key}`);
  }

  @HostListener('click', ['$event'])
  onClick(event: PointerEvent) {
    // console.log('click', event, (event.target as any).className);
    const cardRef = this.cardRefs.first.nativeElement;
    const treeRef = this.treeRefs.first.el.nativeElement;
    const className: string = (event.target as any).className;
    if (className.includes('editor-card')) {
      return;
    } else if (treeRef.contains(event.target)) {
      return;
    } else if (!cardRef.contains(event.target)) {
      this.resetTarget();
      return;
    }
    this.setTarget(event?.target);
  }

  onClickLayer(event: TreeNodeSelectEvent) {
    this.setTarget(event.node.data);
  }

  onLayerDrop(event: TreeNodeDropEvent) {
    console.log('layerDrop', event);
    event.dropNode?.data?.appendChild(event.dragNode?.data);
  }

  setTarget(selectedElement: any) {
    // console.log('setTarget', e.target);
    if (this.target === selectedElement) {
      this.resetTarget();
      return;
    }
    this.target = selectedElement;
    var elementGuidelines: any[] = [this.cardRefs?.first?.nativeElement];
    const siblings: HTMLCollection = this.target.parentNode.children;
    const cardRef = this.cardRefs.first.nativeElement;
    for (var i = 0; i < siblings.length; i++) {
      if (selectedElement !== siblings.item(i) 
        && !siblings.item(i)?.localName.includes('style')) {
        elementGuidelines.push(siblings.item(i));
      }
    }
    // console.log('siblings', siblings);
    // siblings.forEach((element: any) => {
    //   elementGuidelines.push(element);
    // });
    // this.elementRefs.forEach(element => {
    //   if (element.nativeElement != selectedElement) {
    //     elementGuidelines.push(element.nativeElement);
    //   }
    // });
    // console.log('elementGuidelines:', elementGuidelines, selectedElement, this.cardRefs?.first);
    console.log('target:', this.target, elementGuidelines);
    this.elementGuidelines = elementGuidelines;
  }

  resetTarget() {
    console.log('resetTarget');
    this.target = undefined;
  }

  onDragStart(e: any) {
    console.log('drag start', e);
    console.log('drag start dimensions: ', e.target.clientWidth, " ", e.target.clientHeight)
    var width = e.target.clientWidth;
    var height = e.target.clientHeight;
    // e.target.style.position = 'absolute';
    e.target.style.position = 'relative';
    e.target.style.display = 'block';
    e.target.style.width = `${width}px`;
    e.target.style.height = `${height}px`;
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
