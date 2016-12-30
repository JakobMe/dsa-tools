#!/usr/bin/env node
/*jshint esversion: 6 */

// Modules
var program = require("commander");
var colors = require("colors");
var fs = require("fs");

/*jshint esversion: 6 */

// Constants
const VERSION               = "1.0.0";
const DICE_20               = "w20";
const DICE_6                = "w6";
const DICE_20_VALUE         = 20;
const DICE_6_VALUE          = 6;
const ROLLS_MIN             = 1;
const ROLL_RESULT_MIN       = 1;
const ROLL_CRIT_THRESH      = 2;
const MOD_DEFAULT           = 0;
const SKILL_MIN             = 0;
const SKILL_REST_LENGTH     = 3;
const SKILL_LEVEL_THRESH    = 3;
const SKILL_LEVEL_LENGTH    = 2;
const ATTR_ROLLS            = 3;
const ATTR_MIN              = 8;
const ATTR_DELIMITER        = "/";
const CHAR_TAB              = "\t";
const CHAR_BREAK            = "\r";
const CHAR_NEWLINE          = "\n";
const CHAR_PLACEHOLDER      = "%s";
const CHAR_DOT              = ".";
const CHAR_SPACE            = " ";
const CHAR_PLUS             = "+";
const CHAR_PLUSMINUS        = "±";
const CHAR_TIMES            = "×";
const CHAR_SUM              = "Σ";
const CHAR_COLON            = ":";
const CHAR_PAREN_LEFT       = "(";
const CHAR_PAREN_RIGHT      = ")";
const CHAR_BRACKET_LEFT     = "[";
const CHAR_BRACKET_RIGHT    = "]";
const CHAR_LEVEL            = "QS";
const TEXT_ERROR_ATTR       = "Wrong attribute format!";
const TEXT_HINT_ATTR        = "e.g. 11/13/12";
const TEXT_HINT_FLOP        = "Misslungen: Folgeproben kumulativ -1.";
const TEXT_HINT_FAILURE     = "Patzer: Sammelprobe misslungen.";
const TEXT_HINT_SUCCESS     = "Krit. Erfolg: QS × 2, Erschwernis abgebaut.";

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

/*jshint esversion: 6 */

/**
 * Commands module; encapsulates all command functions.
 * @returns {Object} Public interface
 */
var Commands = (function() {

    /**
     * Default function for dice commands.
     * @param {Number} n Sides of dice
     * @param {String} rolls Number of rolls as string
     * @param {Object} options Command options
     */
    function roll(n, rolls, options) {

        // Initialize and convert arguments and values
        rolls     = Func.toInt(rolls, 1);
        var plus  = Func.toInt(options.plus, 0);
        var minus = Func.toInt(options.minus, 0);
        var sum   = plus - minus;
        var max   = n * rolls + sum;

        // Print title
        Func.printLn();
        Func.printLn(Func.colorDice(rolls, n) + Func.colorMod(plus - minus));
        Func.printLn();

        // Roll dice, add to sum, print results
        Func.rollDice(n, rolls).forEach(function(roll, i) {
            sum += roll;
            var content = Func.colorRoll(Func.indent(roll, max), roll, 1, n);
            Func.li(i + 1, rolls, content);
        });
        Func.printLn();

        // Print sum if necessary
        if (rolls > 1 || plus > 0 || minus > 0) {
            Func.printLn(Func.colorSum(sum, true, rolls, max));
            Func.printLn();
        }
    }

    /**
     * Command: skill; makes a skill-check.
     * @param {String} attr Skill attributes (e.g. 10/12/11)
     * @param {String} value Skill value
     * @param {Object} options Command options
     */
    function skill(attr, value, options) {

        // Fix value, initialize plus, minus, mod and repeat options
        value = Func.toInt(value, SKILL_MIN);
        var plus = Func.toInt(options.plus, MOD_DEFAULT);
        var minus = Func.toInt(options.minus, MOD_DEFAULT);
        var repeat = Func.toInt(options.sammel, ROLLS_MIN);
        var mod = (plus - minus);

        // Split attributes argument
        attr = attr.split(ATTR_DELIMITER);

        // Check if attributes are invalid
        if (attr.length < ATTR_ROLLS) {
            console.log(CHAR_NEWLINE + CHAR_TAB + TEXT_ERROR_ATTR.red);
            console.log(CHAR_TAB + TEXT_HINT_ATTR.grey + CHAR_NEWLINE);

        // Continue with valid attributes
        } else {

            // Fix attribute values
            attr.forEach(function(val, i) {
                attr[i] = Func.toInt(val, ATTR_MIN);
            });

            // Initialize and color mod output string
            var modStr = CHAR_PLACEHOLDER;
            if (mod < 0) { modStr = modStr.red; }
            else if (mod > 0) { modStr = (CHAR_PLUS + modStr).green; }
            else { modStr = (CHAR_PLUSMINUS + modStr).grey.dim; }

            // Initialize total quality-levels and additional mod
            var modAddtional = 0;
            var levelsTotal = 0;
            var levelsTotalStr = CHAR_PLACEHOLDER;

            // Color levels total string
            if (repeat > ROLLS_MIN) { levelsTotalStr = levelsTotalStr.cyan; }
            else { levelsTotalStr = levelsTotalStr.grey.dim; }

            // Print title
            console.log(
                CHAR_NEWLINE + CHAR_TAB + ATTR_ROLLS.toString().yellow +
                DICE_20 + CHAR_SPACE + CHAR_PAREN_LEFT +
                CHAR_PLACEHOLDER.magenta + CHAR_PAREN_RIGHT + CHAR_SPACE +
                modStr + CHAR_SPACE + CHAR_BRACKET_LEFT +
                CHAR_PLACEHOLDER.magenta + CHAR_BRACKET_RIGHT + CHAR_SPACE +
                (CHAR_TIMES + CHAR_PLACEHOLDER).grey.dim + CHAR_NEWLINE,
                attr.join(ATTR_DELIMITER), mod, value, repeat
            );

            // Repeat checks
            for (let i = 0; i < repeat; i++) {

                // Initialize skill-points and results
                var points = value + 0;
                var results = [];
                var resultsStr = [];
                var countSuccess = 0;
                var countFailure = 0;
                var levelsCurrent = 0;
                var levelsCurrentStr =
                    CHAR_LEVEL + CHAR_SPACE + CHAR_PLACEHOLDER;

                // Make rolls, save result, calculate points
                for (let j = 0; j < attr.length; j++) {

                    // Roll and save result, subtract points
                    var val = attr[j];
                    var roll = Func.rollDice(DICE_20_VALUE, ROLLS_MIN)[0];
                    results.push(roll);
                    points -= Math.max(
                        0, roll - Math.max(0, val + mod + modAddtional));

                    // Color results string
                    var rollStr = CHAR_PLACEHOLDER;
                    if (roll === DICE_20_VALUE) {
                        countFailure++;
                        resultsStr.push(rollStr.red);
                    } else if (roll === ROLL_RESULT_MIN) {
                        countSuccess++;
                        resultsStr.push(rollStr.green);
                    } else {
                        resultsStr.push(rollStr.grey);
                    }
                }

                // Calculate levels
                var levelsResult = 0;
                if (points === 0) { levelsResult = 1; }
                else if (points > 0) {
                    levelsResult = Math.ceil(points / SKILL_LEVEL_THRESH);
                }

                // Add current levels
                levelsCurrent = levelsResult;
                levelsTotal += levelsResult;

                // Color remaining points string
                var pointsStr = CHAR_PLACEHOLDER;
                if (points >= 0) { pointsStr = pointsStr.green; }
                else { pointsStr = pointsStr.red; }

                // Add effects of critical successes
                if (countSuccess >= ROLL_CRIT_THRESH) {
                    levelsResult = Math.max(1, levelsResult);
                    levelsCurrent += levelsResult;
                    levelsTotal += levelsResult;
                    modAddtional = 0;
                }

                // Add effects to critical failures
                if (countFailure >= ROLL_CRIT_THRESH) {
                    levelsCurrent = 0;
                    levelsTotal = 0;
                }

                // Add effect to failures
                if (points < 0) { modAddtional--; }

                // Color current level string
                if (levelsResult <= 0) {
                    levelsCurrentStr = levelsCurrentStr.dim.grey.dim;
                }

                // Add spaces to remaining points
                points = points.toString();
                var spaces = SKILL_REST_LENGTH - points.length;
                for (let j = 0; j < spaces; j++) {
                    points = CHAR_SPACE + points;
                }

                // Print result
                console.log(
                    CHAR_TAB + (CHAR_PLACEHOLDER + CHAR_DOT).grey.dim +
                    CHAR_SPACE + resultsStr[0] + ATTR_DELIMITER.grey +
                    resultsStr[1] + ATTR_DELIMITER.grey + resultsStr[2] +
                    CHAR_TAB + pointsStr + CHAR_TAB + levelsCurrentStr +
                    CHAR_TAB + CHAR_SUM.grey.dim + CHAR_SPACE + levelsTotalStr,
                    (i + 1), results[0], results[1], results[2], points,
                    levelsCurrent, levelsTotal
                );

                // Abort on critical failure
                if (countFailure >= ROLL_CRIT_THRESH) { break; }
            }

            // Print hints
            if (repeat > ROLLS_MIN) {
                console.log((
                    CHAR_NEWLINE + CHAR_TAB + TEXT_HINT_FLOP +
                    CHAR_NEWLINE + CHAR_TAB + TEXT_HINT_SUCCESS +
                    CHAR_NEWLINE + CHAR_TAB + TEXT_HINT_FAILURE
                ).grey.dim);
            }

            // Print linebreak
            console.log(CHAR_BREAK);
        }
    }

    // Public interface
    return {
        roll  : roll,
        skill : skill
    };

})();

/*jshint esversion: 6 */

/*
 * Commands:
 * w<n> [-m, --minus <malus>] [-p, --plus <bonus>] [würfel]
 */
[100, 20, 12, 10, 8, 6, 4, 3, 2].forEach(function(n) {
    program
        .command("w" + n + " [würfel]")
        .description("Anzahl an W" + n + " würfeln")
        .option("-p, --plus <bonus>", "Bonus zur Summe der Würfel")
        .option("-m, --minus <malus>", "Malus zur Summe der Würfel")
        .action(function(rolls, options) {
            Commands.roll(n, rolls, options);
        });
});

/*
 * Command:
 * probe [-m, --minus <malus>] [-p, --plus <bonus>]
 * [-s, --sammel <versuche>] <eigenschaften> <fw>
 */
program
    .command("probe <eigenschaften> <fw>")
    .description("Eine Fertigkeitsprobe würfeln")
    .option("-s, --sammel <versuche>", "Sammelprobe mit Anzahl an Versuchen")
    .option("-m, --minus <malus>", "Erschwernis auf Probe")
    .option("-p, --plus <bonus>", "Erleichterung auf Probe")
    .action(Commands.skill);

// Add version and parse
program.version("0.0.1").parse(process.argv);
