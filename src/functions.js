/*jshint esversion: 6 */

/**
 * Functions module; encapsulates all helper functions.
 * @returns {Object} Public interface
 */
var Func = (function() {

    /**
     * Convert string to integer with default fallback.
     * @param {String} string String to convert
     * @param {Number} fallback Default fallback integer
     * @returns {Number} Converted integer
     */
    function toInt(string, fallback) {
        var number = parseInt(string);
        if (isNaN(number)) { number = fallback; }
        return number;
    }

    /**
     * Return a random integer between 'min' and 'max' (inclusive).
     * @param {Number} min Smallest allowed integer
     * @param {Number} max Biggest allowed integer
     * @returns {Number} Random integer
     */
    function _randInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /**
     * Roll a number of dice with specified number of sides.
     * @param {Number} sides Number of sides of rolled dice
     * @param {Number} [rolls] Number of rolled dice
     */
    function rollDice(sides, rolls) {
        var results = [];
        for (let i = 0; i < toInt(rolls, ROLLS_MIN); i++) {
            results.push(_randInt(ROLL_RESULT_MIN, sides));
        }
        return results;
    }

    // Public interface
    return {
        rollDice : rollDice,
        toInt    : toInt
    };

})();
