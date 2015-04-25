declare module 'esrever' {
    /**
     * A string representing the semantic version number.
     */
    var version: string;
    /**
     * This function takes a string and returns the reversed version of that string, correctly accounting for Unicode combining marks and astral symbols.
     * @param str String to reverse.
     */
    function reverse(str: string): string;
}
