import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from '../types/game.type';
import { InMemoryService } from '../in-memory/in-memory.service';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';

@Injectable({
  providedIn: 'root'
})
export class GamesService extends IndexedDbService<Game, number> {
  selectedGame: BehaviorSubject<Game | undefined>;

  constructor() {
    super(AppDB.GAMES_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.string}
    ]);
    this.selectedGame = new BehaviorSubject<Game | undefined>({id: 1, name: 'Apple Cider Game'});
  }

  override getEntityName(entity: Game) {
    return entity.name;
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