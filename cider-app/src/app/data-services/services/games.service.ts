import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { EntityField, FieldType } from '../types/entity-field.type';
import { Game } from '../types/game.type';
import { InMemoryService } from './in-memory.service';

@Injectable({
  providedIn: 'root'
})
export class GamesService extends InMemoryService<Game, number> {
  selectedGame: BehaviorSubject<Game | undefined>;

  constructor() {
    super([
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string}
    ], [
      {id: 1, name: 'Apple Cider Game'},
      {id: 2, name: 'Crazy Game'}
    ]);
    this.selectedGame = new BehaviorSubject<Game | undefined>(this.records[0]);
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