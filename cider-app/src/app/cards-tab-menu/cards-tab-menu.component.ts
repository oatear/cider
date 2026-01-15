import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { DecksService } from '../data-services/services/decks.service';
import { Deck } from '../data-services/types/deck.type';

@Component({
    selector: 'app-cards-tab-menu',
    templateUrl: './cards-tab-menu.component.html',
    styleUrls: ['./cards-tab-menu.component.scss'],
    standalone: false
})
export class CardsTabMenuComponent implements OnInit {

  selectedDeck$: Observable<Deck | undefined>;
  items: MenuItem[] = [];

  constructor(private decksService : DecksService) { 
    this.selectedDeck$ = this.decksService.getSelectedDeck();

  }

  ngOnInit(): void {
    this.selectedDeck$.subscribe({
      next: (selectedDeck) => {
        this.items = [
          {label: 'Listing', icon: 'pi pi-fw pi-list', routerLink: [`/decks/${selectedDeck?.id}/cards/listing`]},
          {label: 'Thumbnails', icon: 'pi pi-fw pi-th-large', routerLink: [`/decks/${selectedDeck?.id}/cards/thumbnails`]},
          {label: 'Attributes', icon: 'pi pi-fw pi-caret-up', routerLink: [`/decks/${selectedDeck?.id}/cards/attributes`]}
        ];
      }
    });
  }

}
