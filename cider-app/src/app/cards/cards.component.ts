import { Component, OnInit } from '@angular/core';
import { CardsService } from '../data-services/services/cards.service';

@Component({
  selector: 'app-cards',
  templateUrl: './cards.component.html',
  styleUrls: ['./cards.component.scss']
})
export class CardsComponent implements OnInit {

  constructor(public cardsService: CardsService) { }

  ngOnInit(): void {
  }

}
