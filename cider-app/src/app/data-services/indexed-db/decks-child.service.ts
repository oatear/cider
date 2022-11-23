import { firstValueFrom } from 'rxjs';
import { DecksService } from '../services/decks.service';
import { EntityField } from '../types/entity-field.type';
import { SearchParameters } from '../types/search-parameters.type';
import { IndexedDbService } from './indexed-db.service';

export class DecksChildService<Entity, Identity extends string | number> extends IndexedDbService<Entity, Identity> {
  private static readonly DECK_ID: string = 'deckId';
  decksService: DecksService;

  constructor(decksService: DecksService, tableName: string, fields?: EntityField<Entity>[]) {
    super(tableName, fields);
    this.decksService = decksService;
  }

  override search(searchParameters: SearchParameters, equalityCriterias?: {[key: string]: any;}) {
    return firstValueFrom(this.decksService.getSelectedDeck())
      .then(deck => super.search(searchParameters, 
        {...{deckId: (deck || {}).id}, ...equalityCriterias}));
  }

  override getAll(equalityCriterias?: {[key: string]: any;}) {
    return firstValueFrom(this.decksService.getSelectedDeck())
      .then(deck => super.getAll(
        {...{deckId: (deck || {}).id}, ...equalityCriterias}));
  }

  override get(id: Identity) {
    return firstValueFrom(this.decksService.getSelectedDeck())
      .then(deck => super.get(id));
  }

  override create(entity: Entity, overrideParent?: boolean) {
    return firstValueFrom(this.decksService.getSelectedDeck())
      .then(deck => {
        if (!overrideParent) {
          (<any>entity)[DecksChildService.DECK_ID] = deck?.id;
        }
        return super.create(entity);
      });
  }

  override update(id: Identity, entity: Entity) {
    return firstValueFrom(this.decksService.getSelectedDeck())
      .then(deck => {
        (<any>entity)[DecksChildService.DECK_ID] = deck?.id;
        return super.update(id, entity);
      });
  }

  override delete(id: Identity): Promise<boolean> {
    return super.delete(id);
  }

  override deleteAll(equalityCriterias?: {[key: string]: any;}): Promise<boolean> {
    return firstValueFrom(this.decksService.getSelectedDeck())
      .then(deck => super.deleteAll(
        {...{deckId: (deck || {}).id}, ...equalityCriterias}));
  }

}
