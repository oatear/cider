/**
 * Field sort
 */
export interface SearchSort {
    field: string;
    direction: SortDirection;
}

/**
 * Sort Direction
 */
export enum SortDirection {
    asc,
    desc
}