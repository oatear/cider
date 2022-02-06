import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Game } from '../types/game.type';

@Injectable({
  providedIn: 'root'
})
export class GamesService {
  selectedGame: Subject<Game | undefined>;
  games: BehaviorSubject<Game[]>;

  private readonly defaultGames : Game[] = [
    {name: 'Apple Cider Game', id: 1},
    {name: 'Crazy Game', id: 2}
  ];

  constructor() {
    this.selectedGame = new Subject<Game | undefined>();
    this.games = new BehaviorSubject<Game[]>(this.defaultGames);
  }

  /**
   * Get all games
   * 
   * @returns 
   */
  public getAll() {
    return this.games.asObservable();
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