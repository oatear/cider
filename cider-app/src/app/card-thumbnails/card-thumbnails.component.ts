import { Component, OnInit } from '@angular/core';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { CardTemplate } from '../data-services/types/card-template.type';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-card-thumbnails',
  templateUrl: './card-thumbnails.component.html',
  styleUrls: ['./card-thumbnails.component.scss']
})
export class CardThumbnailsComponent implements OnInit {
  thumbnailCards: Card[] = [];

  constructor(public cardsService: CardsService,
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
    });
  }

}
