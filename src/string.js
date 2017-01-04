/**
 * Utility module; provides utility functions for string formatting.
 * @returns {Object} Public interface
 */
var Str = (function() {

    /**
     * Format an indented string.
     * @param   {String} str String to format
     * @param   {String} max Longest possible string
     * @returns {String} Formatted string
     */
    function indent(str, max) {
        var string = str.toString(); var longest = max.toString();
        for (var i = 0; i < (longest.length - string.length); i++) {
            str = G.STR.SPACE + str;
        }
        return str;
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
        str = str.toString();
        return int === good ? str.green
                            : int === bad ? str.red
                                          : str;
    }

    /**
     * Format a rolls results string.
     * @param   {Number[]} ints Array of integers of roll results
     * @param   {Number}   good Definition of a good roll
     * @param   {Number}   bad  Definition of a bad roll
     * @returns {String}   Formatted string
     */
    function rolls(ints, good, bad) {
        var str = [];
        ints.forEach(function(int) {
            str.push(roll(int, int, good, bad));
        });
        return str.join(G.STR.DELIMITER);
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
        var str = int.toString() + G.STR.SPACE;
        return int < 0 ? str.red
                       : int > 0 ? (G.STR.PLUS + str).green
                                 : (G.STR.PLUSMINUS + str).grey.dim;
    }

    /**
     * Format a times string.
     * @param   {Number} int Number of times
     * @returns {String} Formatted string
     */
    function times(int) {
        var str = G.STR.TIMES + int.toString();
        return int > 1 ? str : str.grey.dim;
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
        var symbol  = indent(G.STR.SUM, addends || 0);
        var delimit = colon || false ? G.STR.COLON + G.STR.SPACE : G.STR.SPACE;
        return (symbol + delimit).grey.dim + indent(int, max || 0);
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
        var str = G.STR.TAB + indent(int, (max * -1));
        return int < 0 ? str.red : str.green;
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
     * Format a phrase string.
     * @param   {String} str String to format
     * @returns {String} Formatted string
     */
    function phrase(str) {
        return quote(str).yellow + G.STR.HYPHEN.grey.dim;
    }

    /**
     * Format a probability string.
     * @param   {Number} float Float number of probability
     * @returns {String} Formatted string
     */
    function probability(float) {
        return G.STR.PROB + G.STR.SPACE + float.toString() + G.STR.PERCENT;
    }

    // Public interface
    return {
        probability : probability,
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
        quote       : quote,
        phrase      : phrase
    };

})();
