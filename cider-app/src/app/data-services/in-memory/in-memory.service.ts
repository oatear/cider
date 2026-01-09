import { EntityField } from '../types/entity-field.type';
import { EntityService } from '../types/entity-service.type';
import { SearchParameters } from '../types/search-parameters.type';
import { SearchResult } from '../types/search-result.type';

export class InMemoryService<Entity, Identity extends string | number> implements EntityService<Entity, Identity> {

  protected fields: EntityField<Entity>[];
  protected records: Entity[];

  constructor(fields?: EntityField<Entity>[], records?: Entity[]) {
    this.fields = fields || [];
    this.records = records || [];
  }

  getTableName() {
    return 'in-memory';
  }

  getEntityName(entity: Entity) {
    return '' + (<any>entity)[this.getIdField()];
  }

  getIdField(): string {
    return 'id';
  }

  getFields() {
    return new Promise<EntityField<Entity>[]>((resolve, reject) => {
      resolve(this.fields);
    });
  }

  getIdToNameMap() {
    return new Promise<Map<Identity, string>>((resolve, reject) => {
      resolve(new Map());
    });
  }

  getLookups() {
    return new Promise<Map<EntityService<any, string | number>, Map<string | number, string>>>((resolve, reject) => {
      resolve(new Map());
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

  deleteAll() {
    return new Promise<boolean>((resolve, reject) => {
      this.records = [];
      resolve(true);
    });
  }

  emptyTable() {
    return this.deleteAll();
  }

}
