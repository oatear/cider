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
export interface EntityService<E, I extends string | number> {
    getFields: () => Promise<EntityField<E>[]>;
    getIdField: () => string;
    search: (searchParameters: SearchParameters) => Promise<SearchResult<E>>;
    getAll: () => Promise<E[]>;
    get: (id: I) => Promise<E>;
    create: (entity: E) => Promise<E>;
    update: (id: I, entity: E) => Promise<E>;
    delete: (id: I) => Promise<boolean>;
}
