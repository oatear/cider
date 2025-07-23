import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CardTemplate } from "../data-services/types/card-template.type";
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import TemplateDefaults, { TemplateDesign } from '../shared/defaults/template-defaults';

@Component({
  selector: 'app-template-dialog',
  templateUrl: './template-dialog.component.html',
  styleUrl: './template-dialog.component.scss'
})
export class TemplateDialogComponent implements OnInit {
  @Input() visible: boolean = false;
  @Input() deckId: number = 0;
  @Output() visibleChange: EventEmitter<boolean> = new EventEmitter<boolean>();
  zoomLevel: number = 0.15;
  previewZoom: number = 0.30;
  sizeCards: any[] = [];
  layoutCards: any[] = [];
  themeCards: any[] = [];
  selectedSize: any = undefined;
  selectedLayout: any = undefined;
  selectedTheme: any = undefined;
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
    this.templateName = `${event.value.key}-${Math.random().toString(36).substr(2, 9)}`;
    this.refreshThemeCards();
  }

  public selectedThemeChange(event: any) {
    // do nothing
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
    const design: TemplateDesign = { 
      size: cardSize,
      layout: layout,
      theme: TemplateDefaults.DEFAULT_THEME,
    };
    const cardTemplate: CardTemplate = TemplateDefaults.generateCardTemplate(design);
    cardTemplate.deckId = this.deckId;
    cardTemplate.name = this.templateName || cardTemplate.name;
    cardTemplate.description = `Card template using ${this.selectedLayout.key} layout.`;
    this.templatesService.create(cardTemplate, true).then((template: CardTemplate) => {
      this.hideDialog();
    });
  }

  public refreshThemeCards() {
    // clean up existing theme card attributes from memory
    if (this.themeCards) {
      this.themeCards.forEach(themeCard => TemplateDefaults.cleanUp(themeCard.design.theme));
    }
    this.themeCards = TemplateDefaults.getThemeCards(this.selectedSize.key, this.selectedLayout.key);
  }

}
