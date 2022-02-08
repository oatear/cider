import { EntityField } from '../types/entity-field.type';
import { EntityService } from '../types/entity-service.type';
import { SearchParameters } from '../types/search-parameters.type';
import { SearchResult } from '../types/search-result.type';

export class InMemoryService<Entity, Identity> implements EntityService<Entity, Identity>{

  protected fields: EntityField<Entity>[];
  protected records: Entity[];

  constructor(fields?: EntityField<Entity>[], records?: Entity[]) {
    this.fields = fields || [];
    this.records = records || [];
  }

  getFields() {
    return new Promise<EntityField<Entity>[]>((resolve, reject) => {
      resolve(this.fields);
    });
  }

   search(searchParameters: SearchParameters) {
    return new Promise<SearchResult<Entity>>((resolve, reject) => {
      resolve({
        records: this.records,
        total: this.records.length
      });
    });
  }

  getAll() {
    return new Promise<Entity[]>((resolve, reject) => {
      resolve(this.records);
    });
  }

  get(id: Identity) {
    return new Promise<Entity>((resolve, reject) => {
      resolve(this.records[0]);
    });
  }

  create(entity: Entity) {
    return new Promise<Entity>((resolve, reject) => {
      this.records.push(entity);
      resolve(entity);
    });
  }

  update(id: Identity, entity: Entity) {
    return new Promise<Entity>((resolve, reject) => {
      resolve(this.records[0]);
    });
  }

  delete(id: Identity) {
    return new Promise<boolean>((resolve, reject) => {
      return true;
    });
  }

}
