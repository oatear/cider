import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CardTemplate } from "../data-services/types/card-template.type";
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import TemplateDefaults from '../shared/defaults/template-defaults';

@Component({
  selector: 'app-template-dialog',
  templateUrl: './template-dialog.component.html',
  styleUrl: './template-dialog.component.scss'
})
export class TemplateDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() deckId: number = 0;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  zoomLevel: number = 0.1;
  sizeCards: any[] = [];
  selectedSize: any = undefined;
  layoutCards: any[] = [];
  selectedLayout: any = undefined;
  templateName: string = '';

  constructor(
    public templatesService: CardTemplatesService) {
  }

  ngOnInit() {
    this.sizeCards = TemplateDefaults.getSizeCards();
  }

  public hideDialog() {
    this.selectedSize = undefined;
    this.selectedLayout = undefined;
    this.layoutCards = [];
    this.zoomLevel = 0.1;
    this.visible = false;
    this.visibleChange.emit(false);
  }

  public selectedSizeChange(event: any) {
    this.layoutCards = TemplateDefaults.getLayoutCards(event.value.key);
    this.selectedLayout = undefined;
  }

  public selectedLayoutChange(event: any) {
    this.templateName = event.value.key || '';
  }

  public createTemplate() {
    console.log('Creating template with size:', this.selectedSize, 
      'and layout:', this.selectedLayout, 
      'and deckId:', this.deckId);
    if (!this.selectedLayout) {
      return;
    }
    const cardSize = TemplateDefaults.CARD_SIZES[this.selectedSize.key];
    const layout = TemplateDefaults.CARD_LAYOUTS[this.selectedLayout.key];
    const cardTemplate: CardTemplate = TemplateDefaults.generateCardTemplate(cardSize, layout);
    cardTemplate.deckId = this.deckId;
    cardTemplate.name = this.templateName || cardTemplate.name;
    cardTemplate.description = `Card template using ${this.selectedLayout.key} layout.`;
    this.templatesService.create(cardTemplate, true).then((template: CardTemplate) => {
      this.hideDialog();
    });
  }

}
