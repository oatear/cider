import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { CardTemplate } from "../data-services/types/card-template.type";
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import TemplateDefaults, { CardTheme, TemplateDesign } from '../shared/defaults/template-defaults';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-template-generator',
  templateUrl: './template-generator.component.html',
  styleUrl: './template-generator.component.scss'
})
export class TemplateGeneratorComponent implements OnInit {
  deckId: number = 0;
  zoomLevel: number = 0.30;
  previewZoom: number = 0.40;
  sizeCards: any[] = [];
  layoutCards: any[] = [];
  themeCards: any[] = [];
  selectedSize: any = undefined;
  selectedLayout: any = undefined;
  selectedTheme: any = undefined;
  templateName: string = '';

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    public templatesService: CardTemplatesService,
  ) {
      this.route.paramMap.subscribe(params => {
        const deckIdString = params.get('deckId') || '';
        this.deckId = parseInt(deckIdString, 10);
      })
  }

  ngOnInit() {
    this.sizeCards = TemplateDefaults.getSizeCards(TemplateDefaults.DEFAULT_THEME);
  }

  public selectedSizeChange(event: any) {
    this.layoutCards = TemplateDefaults.getLayoutCards(event.value.key, TemplateDefaults.DEFAULT_THEME);
    this.selectedLayout = undefined;
    this.selectedTheme = undefined;
  }

  public selectedLayoutChange(event: any) {
    this.selectedTheme = undefined;
    this.refreshThemeCards();
  }

  public selectedThemeChange(event: any) {
    this.templateName = `${this.selectedSize.key}-${this.selectedLayout.key}-${Math.random().toString(36).substr(2, 9)}`;
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
      this.router.navigateByUrl(`/decks/${this.deckId}/templates/${template.id}`);
    });
  }

  public refreshThemeCards(dummyElement?: any) {
    this.selectedTheme = undefined;
    // clean up existing theme card attributes from memory
    if (this.themeCards) {
      this.themeCards.filter(themeCard => themeCard.design.theme != TemplateDefaults.DEFAULT_THEME)
        .forEach(themeCard => TemplateDefaults.cleanUp(themeCard.design.theme));
    }
    this.themeCards = TemplateDefaults.getThemeCards(this.selectedSize.key, this.selectedLayout.key, TemplateDefaults.DEFAULT_THEME);

    if (dummyElement) {
      // fixes an issue where clicking the refresh button will make it take focus,
      // afterward, you need to click on the cards twice: 
      // first click blurs/unfocuses the refresh button, second click selects the card
      dummyElement.focus();
    }
  }

}
