import { Component, OnInit, ViewChild } from '@angular/core';
import { CardTemplatesService } from '../data-services/services/card-templates.service';
import { CardsService } from '../data-services/services/cards.service';
import { Card } from '../data-services/types/card.type';

@Component({
  selector: 'app-card-thumbnails',
  templateUrl: './card-thumbnails.component.html',
  styleUrls: ['./card-thumbnails.component.scss']
})
export class CardThumbnailsComponent implements OnInit {
  @ViewChild('dv') dv!: DataView;
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
  ];
  filterFields: string = "";
  copyOptions: any[] = [
    { label: 'Singles', value: 'singles' },
    { label: 'Copies', value: 'copies' }
  ];
  copySelected: string = 'copies';



  constructor(public cardsService: CardsService,
    public templatesService: CardTemplatesService) { }

  ngOnInit(): void {
    this.refreshCards();
    this.cardsService.getFields().then(fields => {
      this.filterFields = fields.map(field => field.field).join(',');
    });
  }

  refreshCards() {
    this.cardsService.getAll().then(cards => {
      const expandedList: Card[] = [];
      cards.forEach(card => {
        if (this.copySelected === 'singles') {
          expandedList.push(card);
        } else {
          for (let i = 0; i < (typeof card.count === 'undefined' ? 1 : card.count); i++) {
            expandedList.push(card);
          }
        }
      });
      this.thumbnailCards = expandedList;
    });
  }

  filter(input: any) {
    (this.dv as any).filter(input.target.value, 'contains');
  }

}
