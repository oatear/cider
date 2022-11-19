import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { DecksService } from './data-services/services/decks.service';

@Injectable({
  providedIn: 'root'
})
export class DeckGuard implements CanActivate {
  constructor(private decksService: DecksService) {
  }

  canActivate(route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      let deckIdString = route.paramMap.get('deckId');
      if (deckIdString) {
        return this.decksService.get(Number(deckIdString))
          .then(deck => {
            this.decksService.selectDeck(deck);
            return true;
          });
      } else {
        return false;
      }
  }
  
}
