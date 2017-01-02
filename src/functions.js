/**
 * Functions module; encapsulates all helper functions.
 * @returns {Object} Public interface
 */
var F = (function() {

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
        for (var i = 0; i < toInt(rolls, G.ROLLS_MIN); i++) {
            results.push(_randInt(1, sides));
        }
        return results;
    }

    /**
     * Split string of attributes and convert to integers.
     * @param {String} attr String of attributes
     * @returns {Number[]} Array of attribute values
     */
    function splitAttr(attr) {
        var values = [];
        attr.split("/").forEach(function(val) {
            values.push(toInt(val, G.ATTR_MIN));
        });
        return values;
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
        for (var i = 0; i < (lenLon - lenStr); i++) { string = " " + string; }
        return string.toString();
    }

    /**
     * Print a line in console, indent by tab.
     * @param {String} content Content of line
     */
    function printLine(content) {
        Terminal((content || "") + "\n");
    }

    /**
     * Move n lines up in terminal.
     * @param {Number} n Number of lines to move up
     */
    function printUp(n) {
        for (var i = 0; i < (n || 1); i++) {
            Terminal.previousLine(1);
            Terminal.eraseLine();
        }
    }

    /**
     * Print n empty lines.
     * @param {Number} n Number of empty lines
     */
    function printEmpty(n) {
        for (var i = 0; i < (n || 1); i++) {
            printLine("");
        }
    }

    /**
     * Print an element of a list as a line.
     * @param {Number} i Number of list-element
     * @param {Number} size Size of list
     * @param {String} content Content of list-element
     */
    function printList(i, size, content) {
        printLine((indent(i, size) + ". ").grey.dim + content);
    }

    /**
     * Print a message.
     * @param {String} text Text to print
     * @param {Number} size Size of list the message is put in
     * @param {Boolean} error Error-message?
     * @param {Boolean} success Success-message?
     */
    function printMsg(text, size, error, success) {
        var icon = indent("‼", size);
            error = error || false;
            success = success || false;
            icon = error ? icon.red : success ? icon.green : icon.grey.dim;
        printLine(icon + "  " + text);
    }

    /**
     * Creates a colored string of a roll result.
     * @param {String} text Input text
     * @param {Number} roll Result of roll
     * @param {Number} good Definition of a good roll
     * @param {Number} bad Definition of a bad roll
     * @param {Boolean} grey Make default text grey
     * @returns {String} Colored string of roll result
     */
    function strRoll(text, roll, good, bad, grey) {
        text = text.toString();
        return roll === good ? text.green
                             : roll === bad ? text.red
                                            : grey === true ? text.grey
                                                            : text;
    }

    /**
     * Creates a colored string of a set of roll results.
     * @param {Number[]} rolls Array of roll results
     * @param {Number} good Definition of a good roll
     * @param {Number} bad Definition of a bad roll
     * @returns {String} Colored string of roll results
     */
    function strRolls(rolls, good, bad) {
        var output = [];
        rolls.forEach(function(roll) {
            output.push(strRoll(roll.toString(), roll, good, bad, true));
        });
        return output.join("/".grey);
    }

    /**
     * Creates a colored string of dice.
     * @param {Number} rolls Number of rolls
     * @param {Number} sides Number of sides of dice
     * @returns {String} String of dice (e.g. 3w20)
     */
    function strDice(rolls, sides) {
        return rolls.toString().yellow + "w" + sides.toString() + " ";
    }

    /**
     * Creates a colored string of attributes.
     * @param {Number[]} attr Array of attribute values
     * @returns {String} String of attributes (e.g. 10/12/11)
     */
    function strAttr(attr) {
        return "(" + attr.join("/").magenta + ") ";
    }

    /**
     * Creates a colored string of a skill-value.
     * @param {Number} val Skill-value
     * @returns {String} Colored string of skill-value
     */
    function strVal(val) {
        return "[" + val.toString().magenta + "] ";
    }

    /**
     * Creates a colored string of a mod.
     * @param {Number} mod Mod integer
     * @returns {String} Colored string of mod
     */
    function strMod(mod) {
        var output = mod.toString() + " ";
        return mod < G.MOD_MIN ? output.red
                               : mod > G.MOD_MIN ? ("+" + output).green
                                                 : ("±" + output).grey.dim;
    }

    /**
     * Creates a colored string of skill-check repeats.
     * @param {Number} repeat Number of repeats
     * @returns {String} Colored string of repeats
     */
    function strRepeat(repeat) {
        var output = "×" + repeat.toString();
        return repeat > G.ROLLS_MIN ? output.yellow : output.grey.dim;
    }

    /**
     * Creates a color string of a sum.
     * @param {Number} sum Integer of sum
     * @param {Boolean} [colon] Add a colon to sum-symbol
     * @param {Number} [items] Number of summed items for indentation
     * @param {Number} [max] Number of max sum for indentation
     * @returns {String} Colored string of sum
     */
    function strSum(sum, colon, items, max) {
        var sym = indent("Σ", items || 0) + ((colon || false) ? ": " : " ");
        return sym.grey.dim + indent(sum, max || 0).cyan;
    }

    /**
     * Creates a colored string of a quality-level.
     * @param {Number} quality Quality-level
     * @returns {String} Colored tring of quality-level
     */
    function strQuality(quality, crit, slip) {
        var icon = crit || slip ? " ‼" : "";
            icon = crit ? icon.green : slip ? icon.red : icon.grey.dim;
        var qual = "\tQS " + indent(quality, G.QUAL_MAX);
            qual = quality < G.QUAL_SUCCESS ? qual.grey.dim : qual;
        return qual + icon + "\t";
    }

    /**
     * Creates a colored string of remaining points.
     * @param {Number} points Number of remaining points
     * @returns {String} Colored string of remaining points
     */
    function strPoints(points) {
        var max = (-(G.D_20 * G.ROLLS_ATTR)).toString();
        var output = "\t" + indent(points, max);
        return points < G.SKILL_MIN ? output.red
                                    : output.green;
    }

    /**
     * Creates a colored and quoted string.
     * @param {String} text Text to color
     * @returns {String} Colored quoted string
     */
    function strQuote(text) {
        return "„" + text.toString() + "“";
    }

    /**
     * Creates a color string of a keyword.
     * @param {String} keyword Keyword to color
     * @returns {String} Colored string of keyword
     */
    function strKeyword(keyword) {
        return strQuote(keyword).yellow + " — ".grey.dim;
    }

    /**
     * Count rolls of specific value in set of rolls.
     * @param {Number[]} rolls Array of roll results
     * @param {Number} value Desired result value
     * @returns {Number} Count of desired result values
     */
    function countRolls(rolls, value) {
        var count = 0;
        rolls.forEach(function(roll) { count += roll === value ? 1 : 0; });
        return count;
    }

    /**
     * Caluclate quality level of remaining skill points.
     * @param {Number} points Remaining skill points
     * @param {Boolean} crit Critical success?
     * @param {Boolean} slip Critical slip?
     * @param {Boolean} repeated Repeated check?
     * @returns {Number} Caluclated quality level
     */
    function calcQuality(points, crit, slip, repeated) {
        var calc = Math.ceil(points / G.QUAL_DIVIDE);
        var min  = crit ? G.QUAL_SUCCESS : G.QUAL_MIN;
        var mult = crit && repeated ? G.QUAL_MULTIPLY : slip ? 0 : 1;
        var qual = points === G.SKILL_MIN ? G.QUAL_SUCCESS : calc;
        return Math.max(Math.min(qual * mult, G.QUAL_MAX), min);
    }

    /**
     * Format and color a text.
     * @param {String} input Input text
     * @returns {String} Output text
     */
    function formatOutput(input) {
        input = input.replace(G.REGEX_P, "\n");
        input = input.replace(G.REGEX_H, G.REGEX_REPLACE.green);
        input = input.replace(G.REGEX_B, G.REGEX_REPLACE.blue);
        input = input.replace(G.REGEX_I, G.REGEX_REPLACE.yellow);
        return input;
    }

    /**
     * Enclose a string in two other strings.
     * @param {String} str Inner string
     * @param {String} l Left string
     * @param {Boolean} r Right newlines
     * @returns {String} Enclosed string
     */
    function enclose(str, l, r) {
        return l + str + r;
    }

    /**
     * Sort alphabetically.
     * @param {String} a First string
     * @param {String} b Second string
     * @returns {Number} Comparison
     */
    function sortAlpha(a, b) {
        return a.localeCompare(b);
    }

    // Public interface
    return {
        printEmpty   : printEmpty,
        printLine    : printLine,
        printList    : printList,
        printMsg     : printMsg,
        printUp      : printUp,
        formatOutput : formatOutput,
        splitAttr    : splitAttr,
        rollDice     : rollDice,
        countRolls   : countRolls,
        calcQuality  : calcQuality,
        strQuote     : strQuote,
        strKeyword   : strKeyword,
        strQuality   : strQuality,
        strPoints    : strPoints,
        strRepeat    : strRepeat,
        strRolls     : strRolls,
        strDice      : strDice,
        strRoll      : strRoll,
        strAttr      : strAttr,
        strVal       : strVal,
        strSum       : strSum,
        strMod       : strMod,
        toInt        : toInt,
        indent       : indent,
        enclose      : enclose,
        sortAlpha    : sortAlpha
    };

})();
