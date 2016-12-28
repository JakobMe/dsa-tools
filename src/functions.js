/*jshint esversion: 6 */

/**
 * Functions module; encapsulates all helper functions.
 * @returns {Object} Public interface
 */
var Functions = (function() {

    /**
     * Convert string to integer with default fallback.
     * @param {String} string String to convert
     * @param {Number} defaultNumber Default fallback number
     * @returns {Number} Converted number
     */
    function convertToInt(string, defaultNumber) {
        string = parseInt(string);
        if (isNaN(string)) { string = defaultNumber; }
        return string;
    }

    /**
     * Return a random number between 'min' and 'max' (inclusive).
     * @param {Number} min Smallest allowed number
     * @param {Number} max Biggest allowed number
     * @returns {Number} Random number
     */
    function _randomNumber(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Roll a number of dice with specified number of sides.
     * @param {Number} sides Number of sides of rolled dice
     * @param {Number} [rolls] Number of rolled dice
     */
    function rollDice(sides, rolls) {
        var results = [];
        for (let i = 0; i < convertToInt(rolls, ROLLS_MIN); i++) {
            results.push(_randomNumber(ROLL_RESULT_MIN, sides));
        }
        return results;
    }

    // Public interface
    return {
        rollDice     : rollDice,
        convertToInt : convertToInt
    };

})();
