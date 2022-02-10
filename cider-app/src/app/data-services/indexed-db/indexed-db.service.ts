import { IndexableType } from 'dexie';
import { EntityField } from '../types/entity-field.type';
import { EntityService } from '../types/entity-service.type';
import { SearchParameters } from '../types/search-parameters.type';
import { SearchResult } from '../types/search-result.type';
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

  getFields() {
    return new Promise<EntityField<Entity>[]>((resolve, reject) => {
      resolve(this.fields);
    });
  }

   search(searchParameters: SearchParameters) {
    return db.table(this.tableName).toArray().then(records => {
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
