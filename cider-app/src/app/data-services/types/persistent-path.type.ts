/**
 * PersistentPath interface represents a path with an associated bookmark.
 * It is used to store and manage recent project URLs in the application.
 */
export interface PersistentPath {
    path: string;
    bookmark: string | undefined;
}