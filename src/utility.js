/**
 * Utility module; provides general utility function.
 * @returns {Object} Public interface
 */
var Util = (function() {

    /**
     * Generate a random integer between 'min' and 'max'.
     * @param   {Number} min Smallest allowed integer
     * @param   {Number} max Biggest allowed integer
     * @returns {Number} Random integer
     */
    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Convert string to integer.
     * @param   {String} string String to convert
     * @returns {Number} Converted integer
     */
    function toInt(string) {
        var int = parseInt(string);
        return isNaN(int) ? 0 : int;
    }

    /**
     * Sort function for array sorting (alphabetically).
     * @param   {String} a First string
     * @param   {String} b Second string
     * @returns {Number} Comparison
     */
    function sortAlpha(a, b) {
        return a.localeCompare(b);
    }

    // Public interface
    return {
        randomInt : randomInt,
        sortAlpha : sortAlpha,
        toInt     : toInt
    };

})();
