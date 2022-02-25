import { IndexedDbService } from "../indexed-db/indexed-db.service";
import { FieldType } from "./field-type.type";

/**
 * Defines an entity field
 */
export interface EntityField<Entity> {
    field: keyof Entity;
    header: string;
    type: FieldType;
    description?: string;
    hidden?: boolean;
    required?: boolean;
    service?: IndexedDbService<any, string | number>;
    conversion?: (entity: Entity) => any;
}