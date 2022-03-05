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

  constructor(public cardsService: CardsService) { }

  ngOnInit(): void {
    this.cardsService.getAll().then(cards => {
      this.cards = cards;
    });
  }

}
