import { EntityField } from '../types/entity-field.type';
import { EntityService } from '../types/entity-service.type';
import { SearchParameters } from '../types/search-parameters.type';
import { SearchResult } from '../types/search-result.type';
import { SortDirection } from '../types/search-sort.type';
import { AppDB } from './db';

export class IndexedDbService<Entity, Identity extends string | number> implements EntityService<Entity, Identity> {

  protected db: AppDB;
  protected tableName: string;
  protected fields: EntityField<Entity>[];

  constructor(db: AppDB, tableName: string, fields?: EntityField<Entity>[]) {
    this.db = db;
    this.tableName = tableName;
    this.fields = fields || [];
  }

  getEntityName(entity: Entity): string {
    return '' + (<any>entity)[this.getIdField()];
  }

  getIdField(): string {
    return 'id';
  }

  getFields(equalityCriterias?: {[key: string]: any;}) {
    return new Promise<EntityField<Entity>[]>((resolve, reject) => {
      resolve(this.fields);
    });
  }

  getIdToNameMap(equalityCriterias?: {[key: string]: any;}): Promise<Map<Identity, string>> {
    const idField = this.getIdField();
    return this.getAll(equalityCriterias).then(items => items.reduce((map, item) => 
      map.set((<any>item)[idField], this.getEntityName(item)), new Map()));
  }

  /**
   * Get idToName lookups for each external service used in the entity fields
   * @returns 
   */
  getLookups(equalityCriterias?: {[key: string]: any;}): Promise<Map<EntityService<any, string | number>, Map<string | number, string>>> {
    return this.getFields(equalityCriterias).then(fields => fields
      .filter(field => field.service).map(field => field.service)
      .reduce(async (promiseMap, service) => {
        const map = await promiseMap;
        return service && !map.has(service) ? map.set(service, await service.getIdToNameMap(equalityCriterias)) : map
      }, Promise.resolve(new Map())));
  }

  search(searchParameters: SearchParameters, equalityCriterias?: {[key: string]: any;}): Promise<SearchResult<Entity>> {
    let query = equalityCriterias ? this.db.table(this.tableName).where(equalityCriterias) 
      : this.db.table(this.tableName).toCollection();
    if (searchParameters.sorting && searchParameters.sorting.length > 0) {
      if (searchParameters.sorting[0].direction == SortDirection.desc) {
        query = query.reverse();
      }
    }
    const filters: {(record: any): boolean}[] = [];
    if (searchParameters.query) {
      filters.push((record) => JSON.stringify(record).toLowerCase()
        .includes(searchParameters.query?.toLowerCase() || ''));
    }
    if (searchParameters.filters && searchParameters.filters.length > 0) {
      searchParameters.filters?.forEach(filter => {
        filters.push((record) => {
          return (record[filter.field] ? JSON.stringify(record[filter.field]) : '').toString().toLowerCase()
            .includes(filter.filter?.toString().toLowerCase());
        });
      });
    }
    if (filters && filters.length > 0) {
      query = query.filter(record => filters.every(filter => filter(record)));
    }

    return query
    .sortBy(searchParameters.sorting?.map(filter => filter.field)[0] || this.getIdField())
    .then(records => {
      return {
        records: records,
        total: records.length
      };
    });
  }

  getAll(equalityCriterias?: {[key: string]: any;}): Promise<Entity[]> {
    return equalityCriterias ? this.db.table(this.tableName).where(equalityCriterias).toArray()
      : this.db.table(this.tableName).toArray();
  }

  get(id: Identity): Promise<Entity> {
    return this.db.table(this.tableName).get(id);
  }

  create(entity: Entity, overrideParent?: boolean): Promise<Entity> {
    return this.db.table(this.tableName).add(entity).then(entityId => 
      this.db.table(this.tableName).get(entityId));
  }

  update(id: Identity, entity: Entity): Promise<Entity> {
    return this.db.table(this.tableName).put(entity, id).then(entityId => 
      this.db.table(this.tableName).get(entityId));
  }

  delete(id: Identity): Promise<boolean> {
    return this.db.table(this.tableName).delete(id).then(() => true);
  }

  deleteAll(equalityCriterias?: {[key: string]: any;}): Promise<boolean> {
    return equalityCriterias ? this.db.table(this.tableName).where(equalityCriterias).delete().then(() => true)
      : this.db.table(this.tableName).clear().then(() => true);
  }

  emptyTable(): Promise<boolean> {
    return this.db.table(this.tableName).clear().then(() => true);
  }

}
