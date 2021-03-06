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
            output = " " + output;
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
        return output.join("/");
    }

    /**
     * Format a dice string.
     * @param   {Number} n Number of rolls
     * @param   {Number} m Number of sides of dice
     * @returns {String} Formatted string
     */
    function dice(n, m) {
        return n.toString() + "w" + m.toString() + " ";
    }

    /**
     * Format an attributes string.
     * @param   {Number[]} ints Array of integers of attributes
     * @returns {String}   Formatted string
     */
    function attr(ints) {
        return enclose(ints.join("/"), "(", ") ");
    }

    /**
     * Format a string in brackets.
     * @param   {String} str String to format
     * @returns {String} Formatted string
     */
    function brackets(str) {
        return enclose(str, "[", "] ");
    }

    /**
     * Format a mod string.
     * @param   {Number} int Mod integer
     * @returns {String} Formatted string
     */
    function mod(int) {
        var output = int.toString() + " ";
        return int < 0 ? output.red
                       : int > 0 ? ("+" + output).green
                                 : ("±" + output).grey.dim;
    }

    /**
     * Format a times string.
     * @param   {Number} int Number of times
     * @returns {String} Formatted string
     */
    function times(int) {
        var output = "×" + int.toString();
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
        var symbol  = indent("Σ", addends);
        var delimit = colon || false ? ": " : " ";
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
        var icon = crit || slip ? " ‼" : "";
            icon = crit ? icon.green : slip ? icon.red : icon.grey.dim;
        var qual = "\tQS " + indent(int, max);
            qual = int < min ? qual.grey.dim : qual;
        return qual + icon + "\t";
    }

    /**
     * Format a skill-points string.
     * @param   {Number} int Number to format
     * @param   {Number} max Number of maximum points
     * @returns {String} Formatted string
     */
    function points(int, max) {
        var output = "\t" + indent(int, (max * -1));
        return int < 0 ? output.red : output.green;
    }

    /**
     * Format a value raise from start to end.
     * @param   {Number} start Start value
     * @param   {Number} end   End value
     * @returns {String} Formatted string
     */
    function raise(start, end) {
        var output = start.toString() + " -> " + end.toString();
        return Str.brackets(output).grey.dim;
    }

    /**
     * Format a cost string.
     * @param   {Number} value Cost value
     * @returns {String} Formatted string
     */
    function cost(value) {
        return (value.toString() + " AP").green;
    }

    /**
     * Format a quoted string.
     * @param   {String} string String to format
     * @returns {String} Formatted string
     */
    function quote(str) {
        return enclose(str, "\"", "\"");
    }

    /**
     * Format a percent string.
     * @param   {Number} float Float number of percent
     * @returns {String} Formatted string
     */
    function percent(float) {
        return float.toString() + "%";
    }

    /**
     * Format a progressbar string.
     * @param   {Number} current Integer of current step in progress
     * @param   {Number} total   Integer of total steps in progress
     * @returns {String} Formatted string
     */
    function progressbar(current, total) {
        var rate    = current / total;
        var finish  = percent(Math.round(rate * 100));
        var steps   = Math.round(rate * 15);
        var fill    = "=".repeat(steps);
        var blank   = " ".repeat(15 - steps);
        return Str.brackets(" " + fill.cyan + blank + " ") + finish.magenta;
    }

    /**
     * Insert linebreaks in a string to fit a max number of chars per line.
     * @param   {String}        str      String to insert linebreaks into
     * @param   {String|Object} ignore   String/Regex to ignore
     * @param   {Number}        maxchars Max number of chars per line
     * @returns {String}        New string with linebreaks
     */
    function linebreaks(str, ignore, maxchars) {
        var paragraphs = [];
        str.split("\n").forEach(function(paragraph) {
            var lines = [""], i = 0;
            paragraph.split(" ").forEach(function(word) {
                if (!squeeze(word, lines[i], ignore, maxchars)) {
                    lines[++i] = "";
                }
                lines[i] += word + " ";
            });
            lines.forEach(function(line, i) { lines[i] = line.trim(); });
            paragraphs.push(lines.join("\n"));
        });
        return paragraphs.join("\n");
    }

    /**
     * Check if a word can be squeezed in a line.
     * @param   {String}        word    Word to be squeezed in line
     * @param   {String}        line    Line to squeeze word into
     * @param   {String|Object} ignore  String/Regex to ignore
     * @param   {Number}        maxchars Max number of chars per line
     * @returns {Boolean}       Word fits in line or not
     */
    function squeeze(word, line, ignore, maxchars) {
        return (word.replace(ignore, "").length +
                line.replace(ignore, "").length) <= maxchars;
    }

    /**
     * Shorten a string with ellipsis.
     * @param   {String} str String to shorten
     * @param   {Number} max Maximum number of chars
     * @returns {String} Shortened string
     */
    function shorten(str, max) {
        if (!squeeze(str, "...", "", max)) {
            return str.substr(0, max - 4) + "...";
        }
        return str;
    }

    // Public interface
    return {
        squeeze     : squeeze,
        shorten     : shorten,
        linebreaks  : linebreaks,
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
        cost        : cost,
        quality     : quality,
        points      : points,
        raise       : raise,
        quote       : quote
    };

})();
