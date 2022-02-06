import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import {ButtonModule} from 'primeng/button';
import { GamesService } from '../data-services/services/games.service';
import { Game } from '../data-services/types/game.type';

@Component({
  selector: 'app-games',
  templateUrl: './games.component.html',
  styleUrls: ['./games.component.scss']
})
export class GamesComponent implements OnInit {

  cols: any[];
  games: Game[];
  selectedGame: Game | undefined;

  constructor(private gamesService: GamesService, 
    private router: Router) {
    this.cols = [];
    this.games = [];
    this.selectedGame = undefined;
  }

  ngOnInit(): void {
    this.cols = [
      {field: 'name', header: 'Name'}
    ];
    //this.gamesService.getAll().subscribe({next: (games) => this.games = games});
    this.gamesService.getAll().subscribe({next: (games) => {
      console.log('games: ', games);
      this.games = games
    }});
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
