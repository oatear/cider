
/**
 * Defines an entity field
 */
export interface EntityField<Entity> {
    field: keyof Entity;
    header: string;
    type: FieldType;
    required?: boolean;
    conversion?: (entity: Entity) => any;
}

/**
 * Field Type
 */
export enum FieldType {
    string,
    number
}