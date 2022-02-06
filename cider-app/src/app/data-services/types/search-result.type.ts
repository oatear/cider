/**
 * Defines a search result
 */
export interface SearchResult<Entity> {
    records: Entity[];
    total: number;
}
