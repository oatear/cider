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
  zoomLevel: number = 0.3;
  zoomOptions: any[] = [
    { label: 's', value: 0.2 },
    { label: 'm', value: 0.3 },
    { label: 'l', value: 0.5 },
    { label: 'xl', value: 0.8 }
  ];
  sideSelected: string = 'fronts';
  sideOptions: any[] = [
    { label: 'Fronts', value: 'fronts' },
    { label: 'Backs', value: 'backs' },
    { label: 'Both', value: 'both' }
  ]


  constructor(public cardsService: CardsService,
    public templatesService: CardTemplatesService) { }

  ngOnInit(): void {
    this.cardsService.getAll().then(cards => {
      const expandedList: Card[] = [];
      cards.forEach(card => {
        for (let i = 0; i < (typeof card.count === 'undefined' ? 1 : card.count); i++) {
          expandedList.push(card);
        }
      });
      this.thumbnailCards = expandedList;
    });
  }

}
