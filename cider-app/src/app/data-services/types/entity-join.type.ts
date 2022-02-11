import { Table } from "dexie";
/**
 * Defines a join between an entity id field to a remote table
 * The result of the join is saved into the localVariable as a list
 */
export interface EntityJoin<Entity> {
    table: Table;
    localIdField: string;
    tableIdField: string;
    localVariable: string;
}
