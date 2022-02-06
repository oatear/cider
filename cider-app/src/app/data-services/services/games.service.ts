import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { EntityField, FieldType } from '../types/entity-field.type';
import { Game } from '../types/game.type';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService extends InMemoryService<Game, number> {
  selectedGame: Subject<Game | undefined>;

  constructor() {
    super([
      {field: 'name', header: 'Name', type: FieldType.string}
    ], [
      {name: 'Apple Cider Game', id: 1},
      {name: 'Crazy Game', id: 2}
    ]);
    this.selectedGame = new Subject<Game | undefined>();
  }

  /**
   * Select the game being edited
   * 
   * @param game 
   */
  public selectGame(game: Game | undefined) {
    this.selectedGame.next(game);
  }

  /**
   * Return the selected game
   * 
   * @returns 
   */
  public getSelectedGame() {
    return this.selectedGame.asObservable();
  }
}