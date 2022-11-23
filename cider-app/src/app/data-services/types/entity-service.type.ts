import { EntityField } from "./entity-field.type";
import { SearchParameters } from "./search-parameters.type";
import { SearchResult } from "./search-result.type";

/**
 * Represents a service that implements CRUD
 * Create/Read/Update/Delete
 * 
 * E - Entity Type
 * I - ID Type
 */
export interface EntityService<Entity, Identity extends string | number> {
    getEntityName: (entity: Entity) => string;
    getFields: (equalityCriterias?: {[key: string]: any;}) => Promise<EntityField<Entity>[]>;
    getIdField: () => string;
    getIdToNameMap: (equalityCriterias?: {[key: string]: any;}) => Promise<Map<Identity, string>>;
    getLookups: (equalityCriterias?: {[key: string]: any;}) => Promise<Map<EntityService<any, string | number>, Map<string | number, string>>>;
    search: (searchParameters: SearchParameters) => Promise<SearchResult<Entity>>;
    getAll: () => Promise<Entity[]>;
    get: (id: Identity) => Promise<Entity>;
    create: (entity: Entity, overrideParent?: boolean) => Promise<Entity>;
    update: (id: Identity, entity: Entity) => Promise<Entity>;
    delete: (id: Identity) => Promise<boolean>;
    deleteAll: () => Promise<boolean>;
    emptyTable: () => Promise<boolean>;
}
