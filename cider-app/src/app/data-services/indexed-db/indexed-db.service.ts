import { IndexableType } from 'dexie';
import { EntityField } from '../types/entity-field.type';
import { EntityService } from '../types/entity-service.type';
import { SearchParameters } from '../types/search-parameters.type';
import { SearchResult } from '../types/search-result.type';
import { SortDirection } from '../types/search-sort.type';
import { db } from './db';

export class IndexedDbService<Entity, Identity extends string | number> implements EntityService<Entity, Identity>{

  protected tableName: string;
  protected fields: EntityField<Entity>[];
  protected records: Entity[];

  constructor(tableName: string, fields?: EntityField<Entity>[], records?: Entity[]) {
    this.tableName = tableName;
    this.fields = fields || [];
    this.records = records || [];
  }

  getIdField() : string {
    return 'id';
  }

  getFields() {
    return new Promise<EntityField<Entity>[]>((resolve, reject) => {
      resolve(this.fields);
    });
  }

  search(searchParameters: SearchParameters) {
    let query = db.table(this.tableName).toCollection();
    if (searchParameters.sorting && searchParameters.sorting.length > 0) {
      if (searchParameters.sorting[0].direction == SortDirection.desc) {
        query = query.reverse();
      }
    }
    if (searchParameters.query) {
      query = query.filter(record => JSON.stringify(record).toLowerCase()
      .includes(searchParameters.query?.toLowerCase() || ''));
    }
    if (searchParameters.filters && searchParameters.filters.length > 0) {
      query = query.filter(record => 
        searchParameters.filters?.find(filter => 
          JSON.stringify(record[filter.field]).toLowerCase()
          .includes(filter.filter.toLowerCase())) !== undefined);
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

  getAll() {
    return db.table(this.tableName).toArray();
  }

  get(id: Identity) {
    return db.table(this.tableName).get(id);
  }

  create(entity: Entity) {
    return db.table(this.tableName).add(entity).then(entityId => 
      db.table(this.tableName).get(entityId));
  }

  update(id: Identity, entity: Entity) {
    return db.table(this.tableName).put(entity, id).then(entityId => 
      db.table(this.tableName).get(entityId));
  }

  delete(id: Identity) {
    return db.table(this.tableName).delete(id).then(() => true);
  }

}
