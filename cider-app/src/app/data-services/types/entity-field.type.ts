import { EntityService } from "./entity-service.type";
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
    service?: EntityService<any, string | number>;
    conversion?: (entity: Entity) => any;
    options?: string[];
}