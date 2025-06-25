import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CardTemplate } from "../data-services/types/card-template.type";
import { Card } from '../data-services/types/card.type';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import TemplateDefaults from '../shared/defaults/template-defaults';

@Component({
  selector: 'app-template-dialog',
  templateUrl: './template-dialog.component.html',
  styleUrl: './template-dialog.component.scss'
})
export class TemplateDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  zoomLevel: number = 0.1;
  sizeCards: any[] = [];
  selectedSize: any = undefined;
  layoutCards: any[] = [];
  selectedLayout: any = undefined;

  constructor(public templatesService: CardTemplatesService) {
  }

  ngOnInit() {
    this.sizeCards = TemplateDefaults.getSizeCards();
    this.selectedSize = undefined;
  }

  public hideDialog() {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  public selectedSizeChange(event: any) {
    console.log('Selected size changed:', event.value);
    this.layoutCards = TemplateDefaults.getLayoutCards(event.value.key);
    this.selectedLayout = undefined;
  }

  public createTemplate() {
    if (!this.selectedLayout) {
      return;
    }
  }

}
