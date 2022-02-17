import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { GamesService } from './data-services/services/games.service';

@Injectable({
  providedIn: 'root'
})
export class GameGuard implements CanActivate {
  constructor(private gamesService: GamesService) {
  }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let gameIdString = route.paramMap.get('gameId');
      if (gameIdString) {
        return this.gamesService.get(Number(gameIdString))
          .then(game => {
            this.gamesService.selectGame(game);
            return true;
          });
      } else {
        return false;
      }
  }
  
}
