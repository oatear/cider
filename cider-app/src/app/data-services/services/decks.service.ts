import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Deck } from '../types/deck.type';
import { IndexedDbService } from '../indexed-db/indexed-db.service';
import { AppDB } from '../indexed-db/db';
import { FieldType } from '../types/field-type.type';

@Injectable({
  providedIn: 'root'
})
export class DecksService extends IndexedDbService<Deck, number> {
  selectedDeck: BehaviorSubject<Deck | undefined>;
  decksUpdated: BehaviorSubject<boolean>;

  constructor() {
    super(AppDB.DECKS_TABLE, [
      {field: 'id', header: 'ID', type: FieldType.number, hidden: true},
      {field: 'name', header: 'Name', type: FieldType.text}
    ]);
    this.selectedDeck = new BehaviorSubject<Deck | undefined>(undefined);
    this.decksUpdated = new BehaviorSubject<boolean>(true);
  }

  override getEntityName(entity: Deck) {
    return entity.name;
  }

  /**
   * Select the deck being edited
   * 
   * @param deck 
   */
  public selectDeck(deck: Deck | undefined) {
    if (this.selectedDeck.getValue()?.id !== deck?.id) {
      this.selectedDeck.next(deck);
    }
  }

  /**
   * Ttrigger an update for decks having changed
   */
  public triggerDecksUpdated() {
    this.decksUpdated.next(true);
  }

  /**
   * Return the selected deck
   * 
   * @returns 
   */
  public getSelectedDeck() {
    return this.selectedDeck.asObservable();
  }

  /**
   * Return a trigger for when the deck list is updated
   * 
   * @returns 
   */
  public getDecksUpdated() {
    return this.decksUpdated.asObservable();
  }
}