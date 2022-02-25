import { Component, OnInit } from '@angular/core';
import { CardAttributesService } from '../data-services/services/card-attributes.service';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  cards: Card[] = [];
  thumbnailCards: Card[] = [];

  constructor(public cardsService: CardsService,
    public attributesService: CardAttributesService,
    public templatesService: CardTemplatesService) { }

  ngOnInit(): void {
    this.cardsService.getAll().then(cards => {
      const expandedList: Card[] = [];
      cards.forEach(card => {
        for (let i = 0; i < (card.count || 1); i++) {
          expandedList.push(card);
        }
      });
      this.thumbnailCards = expandedList;
      this.cards = cards;
    });
  }

}
