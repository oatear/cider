import { SearchFilter } from "./search-filter.type";
import { SearchSort } from "./search-sort.type";

/**
 * Search parameters
 */
export interface SearchParameters {
    filters: SearchFilter[];
    sorting: SearchSort[];
    query: string;
    limit: number;
    offset: number;
}
