import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Observable } from 'rxjs';
import { GamesService } from '../data-services/services/games.service';
import { Game } from '../data-services/types/game.type';

@Component({
  selector: 'app-cards-tab-menu',
  templateUrl: './cards-tab-menu.component.html',
  styleUrls: ['./cards-tab-menu.component.scss']
})
export class CardsTabMenuComponent implements OnInit {

  selectedGame$: Observable<Game | undefined>;
  items: MenuItem[] = [];

  constructor(private gamesService : GamesService) { 
    this.selectedGame$ = this.gamesService.getSelectedGame();

  }

  ngOnInit(): void {
    this.selectedGame$.subscribe({
      next: (selectedGame) => {
        this.items = [
          {label: 'Listing', icon: 'pi pi-fw pi-list', routerLink: [`/games/${selectedGame?.id}/cards/listing`]},
          {label: 'Thumbnails', icon: 'pi pi-fw pi-th-large', routerLink: [`/games/${selectedGame?.id}/cards/thumbnails`]},
          {label: 'Attributes', icon: 'pi pi-fw pi-caret-up', routerLink: [`/games/${selectedGame?.id}/cards/attributes`]}
        ];
      }
    });
  }

}
