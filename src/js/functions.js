/*jshint esversion: 6 */

/**
 * Functions module; encapsulates all helper functions.
 * @returns {Object} Public interface
 */
var Func = (function() {

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
     * Roll a number of dice with specified number of sides.
     * @param {Number} sides Number of sides of rolled dice
     * @param {Number} [rolls] Number of rolled dice
     */
    function rollDice(sides, rolls) {
        var results = [];
        for (let i = 0; i < toInt(rolls, 1); i++) {
            results.push(_randInt(1, sides));
        }
        return results;
    }

    /**
     * Indent a string according the longest string in the set.
     * @param {String} string String to indent
     * @param {String|Number} longest Longest string to base indentation on
     * @returns {String} Indented string
     */
    function indent(string, longest) {
        var lenStr = string.toString().length;
        var lenLon = longest.toString().length;
        for (let i = 0; i < (lenLon - lenStr); i++) { string = " " + string; }
        return string.toString();
    }

    /**
     * Print a line in console, indent by tab.
     * @param {String} content Content of line
     */
    function printLn(content) {
        console.log("\t" + (content || ""));
    }

    /**
     * Print an element of a list as a line.
     * @param {Number} i Number of list-element
     * @param {Number} size Size of list
     * @param {String} content Content of list-element
     */
    function li(i, size, content) {
        printLn((indent(i, size) + ". ").grey.dim + content);
    }

    /**
     * Colors a result of a dice roll if it's a good or bad roll.
     * @param {String} text Input text
     * @param {Number} roll Result of roll
     * @param {Number} good Definition of a good roll
     * @param {Number} bad Definition of a bad roll
     * @returns {String} Colored string of roll result
     */
    function colorRoll(text, roll, good, bad) {
        text = text.toString();
        return roll === good ? text.green
                             : roll === bad ? text.red
                                            : text;
    }

    /**
     * Creates a colored string of dice.
     * @param {Number} rolls Number of rolls
     * @param {Number} sides Number of sides of dice
     * @returns {String} String of dice (e.g. 3w20)
     */
    function colorDice(rolls, sides) {
        return rolls.toString().yellow + "w" + sides.toString() + " ";
    }

    /**
     * Creates a colored string of a mod.
     * @param {Number} mod Mod integer
     * @returns {String} Colored string of mod
     */
    function colorMod(mod) {
        var output = mod.toString();
        return mod < 0 ? output.red
                       : mod > 0 ? ("+" + output).green
                                 : ("±" + output).grey.dim;
    }

    /**
     * Creates a color string of a sum.
     * @param {Number} sum Integer of sum
     * @param {Boolean} [colon] Add a colon to sum-symbol
     * @param {Number} [items] Number of summed items for indentation
     * @param {Number} [max] Number of max sum for indentation
     * @returns {String} Colored string of sum
     */
    function colorSum(sum, colon, items, max) {
        var sym = indent("Σ", items || 0) + ((colon || false) ? ": " : " ");
        return sym.grey.dim + indent(sum, max || 0).cyan;
    }

    // Public interface
    return {
        li        : li,
        rollDice  : rollDice,
        colorDice : colorDice,
        colorRoll : colorRoll,
        colorSum  : colorSum,
        colorMod  : colorMod,
        toInt     : toInt,
        indent    : indent,
        printLn   : printLn
    };

})();
