#!/usr/bin/env node

// Modules
var program = require("commander");
var colors = require("colors");

// Constants
const VERSION               = "1.0.0";
const DICE_20               = 20;
const DICE_6                = 6;
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

/*
 * Command:
 * w20 [rolls]
 */
program
    .command("w20 [rolls]")
    .description("roll w20 dice")
    .action(function(rolls) {

        // Fix rolls argument
        rolls = Functions.convertToInt(rolls, ROLLS_MIN);

        // Print result
        console.log("\n\t" + "%s".yellow + "w20\n", rolls);
        Functions.rollDice(DICE_20, rolls).forEach(function(roll, i) {
            console.log("\t%s.".grey.dim + " %s", (i + 1), roll);
        });
        console.log("\r");
    });

/*
 * Command:
 * w6 [-p, --plus <bonus>] [-m, --minus <malus>] [rolls]
 */
program
    .command("w6 [rolls]")
    .description("roll w6 dice")
    .option("-p, --plus <bonus>", "bonus to sum of rolls")
    .option("-m, --minus <malus>", "malus to sum of rolls")
    .action(function(rolls, options) {

        // Fix rolls and plus/minus arguments, initialize sum
        rolls = Functions.convertToInt(rolls, ROLLS_MIN);
        var plus = Functions.convertToInt(options.plus, MOD_DEFAULT);
        var minus = Functions.convertToInt(options.minus, MOD_DEFAULT);
        var sum = (plus - minus);

        // Initialize sum and mod output strings
        var mod = "";
        if (sum < 0) { mod = "%s".red; }
        else if (sum > 0) { mod = "+%s".green; }
        else { mod = "±%s".grey; }

        // Print title
        console.log(
            "\n\t" + "%s".yellow + "w6 " + mod + "\n",
            rolls, (plus - minus)
        );

        // Print results
        Functions.rollDice(DICE_6, rolls).forEach(function(roll, i) {
            console.log("\t%s.".grey.dim + " %s", (i + 1), roll);
            sum += roll;
        });

        // Print sum
        if ((rolls > ROLLS_MIN) || (plus - minus !== MOD_DEFAULT)) {
            console.log("\n\tΣ: ".grey.dim + "%s\n".cyan, sum);
        } else {
            console.log("\r");
        }
    });

/*
 * Command:
 * skill [-m, --minus <malus>] [-p, --plus <bonus>]
 * [-r, --repeat <times>] <attr> <value>
 */
program
    .command("skill <attr> <value>")
    .description("make a skill-check")
    .option("-r, --repeat <times>", "repeat skill-check")
    .option("-m, --minus <malus>", "make skill-check harder by malus")
    .option("-p, --plus <bonus>", "make skill-check easier by bonus")
    .action(function(attr, value, options) {

        // Fix value, initialize plus, minus and repeat options
        value = Functions.convertToInt(value, SKILL_MIN);
        var plus = Functions.convertToInt(options.plus, MOD_DEFAULT);
        var minus = Functions.convertToInt(options.minus, MOD_DEFAULT);
        var repeat = Functions.convertToInt(options.repeat, ROLLS_MIN);
        var mod = (plus - minus);

        // Split attributes argument
        attr = attr.split(ATTR_DELIMITER);

        // Check if attributes are invalid
        if (attr.length < ATTR_ROLLS) {
            console.log("\n\t" + "Wrong attribute format!".red);
            console.log("\te.g. 10/10/10".grey + "\n");

        // Continue with valid attributes
        } else {

            // Fix attribute values
            attr.forEach(function(val, i) {
                attr[i] = Functions.convertToInt(val, ATTR_MIN);
            });

            // Initialize mod output string
            var modString = "%s";
            if (mod < 0) { modString = modString.red; }
            else if (mod > 0) { modString = ("+" + modString).green; }
            else { modString = ("±" + modString).grey.dim; }

            // Initialize total quality-levels and additional mod
            var levelsTotal = 0;
            var modAddtional = 0;

            // Print title
            console.log(
                "\n\t" + "3".yellow + "w20 (" + "%s".magenta + ") "
                + modString + " [" + "%s".magenta + "] " + "×%s".grey.dim + "\n",
                attr.join(ATTR_DELIMITER), mod, value, repeat
            );

            // Repeat checks
            for (let i = 0; i < repeat; i++) {

                // Initialize skill-points and results
                var points = value + 0;
                var results = [];
                var resultsString = [];
                var levelsCurrent = 0;
                var levelsCurrentString = "QS %s";
                var countSuccess = 0;
                var countFailure = 0;

                // Make rolls, save result, calculate points
                attr.forEach(function(val, j) {

                    // Roll and save result, subtract points
                    var roll = Functions.rollDice(DICE_20, ROLLS_MIN)[0];
                    results.push(roll);
                    points -= Math.max(
                        0, roll - Math.max(0, val + mod + modAddtional));

                    // Color results string
                    var rollString = "%s";
                    if (roll === DICE_20) {
                        countFailure++;
                        resultsString.push(rollString.red);
                    } else if (roll === ROLL_RESULT_MIN) {
                        countSuccess++;
                        resultsString.push(rollString.green);
                    } else {
                        resultsString.push(rollString.grey);
                    }
                });

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
                var pointsString = "%s";
                if (points >= 0) { pointsString = pointsString.green; }
                else { pointsString = pointsString.red; }

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
                    levelsCurrentString =
                        levelsCurrentString.dim.grey.dim;
                }

                // Add spaces to remaining points
                points = points.toString();
                var spaces = SKILL_REST_LENGTH - points.length;
                for (let j = 0; j < spaces; j++) { points = " " + points; }

                // Print result
                console.log(
                    "\t%s. ".grey.dim +
                    resultsString[0] + ATTR_DELIMITER.grey +
                    resultsString[1] + ATTR_DELIMITER.grey +
                    resultsString[2] + "\t" + pointsString +
                    "\t" + levelsCurrentString +
                    "\tΣ ".grey.dim + "%s".cyan,
                    (i + 1), results[0], results[1], results[2], points,
                    levelsCurrent, levelsTotal
                );

                // Abort on critical failure
                if (countFailure >= ROLL_CRIT_THRESH) { break; }
            }

            // Print linebreak
            console.log("\r");
        }
    });

// Add version and parse
program.version(VERSION).parse(process.argv);
