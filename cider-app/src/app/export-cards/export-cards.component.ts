import { Component, OnInit } from '@angular/core';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-export-cards',
  templateUrl: './export-cards.component.html',
  styleUrls: ['./export-cards.component.scss']
})
export class ExportCardsComponent implements OnInit {
  private static readonly SINGULAR_EXPORT = 'singular-export';
  private static readonly SHEET_EXPORT = 'sheet-export';

  public exportType: string = ExportCardsComponent.SHEET_EXPORT;
  public exportOptions: RadioOption[] = [
    { name: 'Card Sheet', value: ExportCardsComponent.SHEET_EXPORT},
    { name: 'Individual Images', value: ExportCardsComponent.SINGULAR_EXPORT}
  ];
  public paperOptions: PaperType[] = [
    { name: 'US Letter (Landscape)', width: 11, height: 8.5}, 
    { name: 'US Letter (Profile)', width: 8.5, height: 11}, 
    { name: 'A4 (Landscape)', width: 10, height: 8}, 
    { name: 'A4 (Profile)', width: 8, height: 10}, 
    { name: 'Custom', width: 8.5, height: 11}
  ];
  public selectedPaper: PaperType = this.paperOptions[0];
  public paperWidth: number = this.paperOptions[0].width;
  public paperHeight: number = this.paperOptions[0].height;
  public paperMargins: number = 0.5;
  public paperDpi: number = 300;
  public cardMargins: number = 0.05;
  public cards: Card[] = [];


  constructor(cardsService: CardsService, 
    public templatesService: CardTemplatesService) {
      cardsService.getAll().then(cards => this.cards = cards);
  }

  ngOnInit(): void {
  }

  public changePaperType() {
    this.paperWidth = this.selectedPaper.width;
    this.paperHeight = this.selectedPaper.height;
  }

  public export() {

  }

}

interface RadioOption {
  name: string,
  value: string
}

interface PaperType {
  name: string,
  width: number,
  height: number
}
