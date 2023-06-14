export var EditorOpenContext;
(function (EditorOpenContext) {
    /**
     * Default: the editor is opening via a programmatic call
     * to the editor service API.
     */
    EditorOpenContext[EditorOpenContext["API"] = 0] = "API";
    /**
     * Indicates that a user action triggered the opening, e.g.
     * via mouse or keyboard use.
     */
    EditorOpenContext[EditorOpenContext["USER"] = 1] = "USER";
})(EditorOpenContext || (EditorOpenContext = {}));
