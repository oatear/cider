import { firstValueFrom } from 'rxjs';
import { GamesService } from '../services/games.service';
import { EntityField } from '../types/entity-field.type';
import { SearchParameters } from '../types/search-parameters.type';
import { IndexedDbService } from './indexed-db.service';

export class GamesChildService<Entity, Identity extends string | number> extends IndexedDbService<Entity, Identity> {
  private static readonly GAME_ID: string = 'gameId';
  gamesService: GamesService;

  constructor(gamesService: GamesService, tableName: string, fields?: EntityField<Entity>[]) {
    super(tableName, fields);
    this.gamesService = gamesService;
  }

  override search(searchParameters: SearchParameters, equalityCriterias?: {[key: string]: any;}) {
    return firstValueFrom(this.gamesService.getSelectedGame())
      .then(game => super.search(searchParameters, 
        {...{gameId: (game || {}).id}, ...equalityCriterias}));
  }

  override getAll(equalityCriterias?: {[key: string]: any;}) {
    return firstValueFrom(this.gamesService.getSelectedGame())
      .then(game => super.getAll(
        {...{gameId: (game || {}).id}, ...equalityCriterias}));
  }

  override get(id: Identity) {
    return firstValueFrom(this.gamesService.getSelectedGame())
      .then(game => super.get(id));
  }

  override create(entity: Entity) {
    return firstValueFrom(this.gamesService.getSelectedGame())
      .then(game => {
        (<any>entity)[GamesChildService.GAME_ID] = game?.id;
        return super.create(entity);
      });
  }

  override update(id: Identity, entity: Entity) {
    return firstValueFrom(this.gamesService.getSelectedGame())
      .then(game => {
        (<any>entity)[GamesChildService.GAME_ID] = game?.id;
        return super.update(id, entity);
      });
  }

  override delete(id: Identity) {
    return super.delete(id);
  }

}
