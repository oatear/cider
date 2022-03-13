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
    getFields: () => Promise<EntityField<Entity>[]>;
    getIdField: () => string;
    search: (searchParameters: SearchParameters) => Promise<SearchResult<Entity>>;
    getAll: () => Promise<Entity[]>;
    get: (id: Identity) => Promise<Entity>;
    create: (entity: Entity) => Promise<Entity>;
    update: (id: Identity, entity: Entity) => Promise<Entity>;
    delete: (id: Identity) => Promise<boolean>;
    deleteAll: () => Promise<boolean>;
}
