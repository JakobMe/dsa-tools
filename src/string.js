/**
 * Utility module; provides utility functions for string formatting.
 * @returns {Object} Public interface
 */
var Str = (function() {

    /**
     * Format an indented string.
     * @param   {String|Number} str   String to format
     * @param   {String|Number} [max] Longest possible string
     * @returns {String}        Formatted string
     */
    function indent(str, max) {
        var output  = str.toString();
        var string  = str.toString();
        var longest = (typeof max === "undefined" ? "" : max).toString();
        for (var i = 0; i < (longest.length - string.length); i++) {
            output = G.STR.SPACE + output;
        }
        return output;
    }

    /**
     * Format a string enclosed in strings.
     * @param   {String} str Inner string
     * @param   {String} l   Left string
     * @param   {String} r   Right string
     * @returns {String} Formatted string
     */
    function enclose(str, l, r) {
        return l + str.toString() + r;
    }

    /**
     * Format a roll result string.
     * @param   {String}  str  String to format
     * @param   {Number}  int  Integer of roll result
     * @param   {Number}  good Definition of a good roll
     * @param   {Number}  bad  Definition of a bad roll
     * @returns {String}  Formatted string
     */
    function roll(str, int, good, bad) {
        var output = str.toString();
        return int === good ? output.green
                            : int === bad ? output.red
                                          : output;
    }

    /**
     * Format a rolls results string.
     * @param   {Number[]} ints Array of integers of roll results
     * @param   {Number}   good Definition of a good roll
     * @param   {Number}   bad  Definition of a bad roll
     * @returns {String}   Formatted string
     */
    function rolls(ints, good, bad) {
        var output = [];
        ints.forEach(function(int) {
            output.push(roll(int, int, good, bad));
        });
        return output.join(G.STR.DELIMITER);
    }

    /**
     * Format a dice string.
     * @param   {Number} n Number of rolls
     * @param   {Number} m Number of sides of dice
     * @returns {String} Formatted string
     */
    function dice(n, m) {
        return n.toString() + G.STR.DICE + m.toString() + G.STR.SPACE;
    }

    /**
     * Format an attributes string.
     * @param   {Number[]} ints Array of integers of attributes
     * @returns {String}   Formatted string
     */
    function attr(ints) {
        return enclose(ints.join(G.STR.DELIMITER), G.STR.PAREN_LEFT,
                       G.STR.PAREN_RIGHT + G.STR.SPACE);
    }

    /**
     * Format a string in brackets.
     * @param   {String} str String to format
     * @returns {String} Formatted string
     */
    function brackets(str) {
        return enclose(str, G.STR.BRACK_LEFT, G.STR.BRACK_RIGHT + G.STR.SPACE);
    }

    /**
     * Format a mod string.
     * @param   {Number} int Mod integer
     * @returns {String} Formatted string
     */
    function mod(int) {
        var output = int.toString() + G.STR.SPACE;
        return int < 0 ? output.red
                       : int > 0 ? (G.STR.PLUS + output).green
                                 : (G.STR.PLUSMINUS + output).grey.dim;
    }

    /**
     * Format a times string.
     * @param   {Number} int Number of times
     * @returns {String} Formatted string
     */
    function times(int) {
        var output = G.STR.TIMES + int.toString();
        return int > 1 ? output.grey.dim : output.grey.dim;
    }

    /**
     * Format a sum string.
     * @param   {Number}  int       Integer of sum
     * @param   {Boolean} [colon]   Add a colon to sum-symbol
     * @param   {Number}  [addends] Number of addends of sum
     * @param   {Number}  [max]     Number of max value of sum
     * @returns {String}  Formatted string
     */
    function sum(int, colon, addends, max) {
        var total   = indent(int, max);
        var symbol  = indent(G.STR.SUM, addends);
        var delimit = colon || false ? G.STR.COLON + G.STR.SPACE : G.STR.SPACE;
        return (symbol + delimit).grey.dim + total.cyan;
    }

    /**
     * Format a quality-level string.
     * @param   {Number}  int  Number to format
     * @param   {Boolean} crit Skill-check critted
     * @param   {Boolean} slip Skill-check slipped
     * @param   {Number}  min  Minimum quality-level
     * @param   {Number}  max  Maximum quality-level
     * @returns {String}  Formatted string
     */
    function quality(int, crit, slip, min, max) {
        var icon = crit || slip ? G.STR.SPACE + G.STR.ALERT : "";
            icon = crit ? icon.green : slip ? icon.red : icon.grey.dim;
        var qual = G.STR.TAB + G.STR.QUAL + G.STR.SPACE + indent(int, max);
            qual = int < min ? qual.grey.dim : qual;
        return qual + icon + G.STR.TAB;
    }

    /**
     * Format a skill-points string.
     * @param   {Number} int Number to format
     * @param   {Number} max Number of maximum points
     * @returns {String} Formatted string
     */
    function points(int, max) {
        var output = G.STR.TAB + indent(int, (max * -1));
        return int < 0 ? output.red : output.green;
    }

    /**
     * Format a quoted string.
     * @param   {String} string String to format
     * @returns {String} Formatted string
     */
    function quote(str) {
        return enclose(str, G.STR.QUOTE_LEFT, G.STR.QUOTE_RIGHT);
    }

    /**
     * Format a percent string.
     * @param   {Number} float Float number of percent
     * @returns {String} Formatted string
     */
    function percent(float) {
        return float.toString() + G.STR.PERCENT;
    }

    /**
     * Format a progressbar string.
     * @param   {Number} current Integer of current step in progress
     * @param   {Number} total   Integer of total steps in progress
     * @param   {Number} n       Integer of steps to display
     * @returns {String} Formatted string
     */
    function progressbar(current, total, n) {
        var rate    = current / total;
        var finish  = percent(Math.round(rate * 100));
        var steps   = Math.round(rate * n);
        var fill    = G.STR.SPACE + G.STR.FILL.repeat(steps);
        var blank   = G.STR.BLANK.repeat(n - steps) + G.STR.SPACE;
        return Str.brackets(fill.cyan + blank) + finish.magenta;
    }

    // Public interface
    return {
        percent     : percent,
        progressbar : progressbar,
        indent      : indent,
        enclose     : enclose,
        roll        : roll,
        rolls       : rolls,
        dice        : dice,
        attr        : attr,
        brackets    : brackets,
        mod         : mod,
        times       : times,
        sum         : sum,
        quality     : quality,
        points      : points,
        quote       : quote
    };

})();
