#!/usr/bin/env node

// Modules
var program = require("commander");
var colors = require("colors");

// Constants
const VERSION           = "1.0.0";
const DICE_20           = 20;
const DICE_6            = 6;
const ROLLS_MIN         = 1;
const PLUS_MIN          = 0;

/**
 * Functions module; encapsulates all helper functions.
 * @returns {Object} Public interface
 */
var Functions = (function() {

    // Constants
    const ROLL_RESULT_MIN = 1;

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
 * Command: w20 [rolls]
 */
program
    .command("w20 [rolls]")
    .description("roll a number of w20 dice")
    .action(function(rolls) {

        // Fix rolls argument
        rolls = Functions.convertToInt(rolls, ROLLS_MIN);

        // Print result
        console.log("\n  " + "%s".bgBlack.yellow + "w20:\n", rolls);
        Functions.rollDice(DICE_20, rolls).forEach(function(roll, i) {
            console.log("  %s.".grey + " %s".green, (i + 1), roll);
        });
        console.log("\r");
    });

/*
 * Command: w6 [-p, --plus <bonus>] [rolls]
 */
program
    .command("w6 [rolls]")
    .description("roll a number of w6 dice")
    .option("-p, --plus <bonus>", "bonus to sum of rolls")
    .action(function(rolls, options) {

        // Fix rolls and plus arguments, initialize sum
        rolls = Functions.convertToInt(rolls, ROLLS_MIN);
        plus = Functions.convertToInt(options.plus, PLUS_MIN);
        sum = plus;

        var bonus = "+%s";
        if (plus > 0) { bonus = bonus.bgBlack.red; }
        else { bonus = bonus.grey; }

        // Print results
        console.log("\n  " + "%s".bgBlack.yellow + "w6 " + bonus + ":\n", rolls, plus);
        Functions.rollDice(DICE_6, rolls).forEach(function(roll, i) {
            console.log("  %s.".grey + " %s".green, (i + 1), roll);
            sum += roll;
        });

        // Print sum if necessary
        if ((rolls > ROLLS_MIN) || (plus > PLUS_MIN)) {
            console.log("\n  = ".grey + "%s\n".blue, sum);
        } else {
            console.log("\r");
        }
    });

// Parse
program.version(VERSION).parse(process.argv);
