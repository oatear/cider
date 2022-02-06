import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ButtonModule} from 'primeng/button';
import { GamesService } from '../data-services/services/games.service';
import { EntityField, FieldType } from '../data-services/types/entity-field.type';
import { Game } from '../data-services/types/game.type';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {

  cols: EntityField<Game>[];
  games: Game[];
  selectedGame: Game | undefined;

  constructor(private gamesService: GamesService, 
    private router: Router) {
    this.cols = [];
    this.games = [];
    this.selectedGame = undefined;
  }

  ngOnInit(): void {
    this.gamesService.getAll().then(games => this.games = games);
    this.gamesService.getFields().then(fields => this.cols = fields);
    this.gamesService.getSelectedGame().subscribe({next: (game) => this.selectedGame = game});
  }

  /**
   * Select the game
   */
  public selectGame() {
      this.gamesService.selectGame(this.selectedGame);
      this.router.navigateByUrl(`/games/${this.selectedGame?.id}/cards`);
  }

  /**
   * Open the create games dialog
   */
  public openCreateGameDialog() {

  }

}
