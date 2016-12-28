/*jshint esversion: 6 */

/**
 * Commands module; encapsulates all command functions.
 * @returns {Object} Public interface
 */
var Commands = (function() {

    /**
     * Command: w20; rolls twenty-sided dice.
     * @param {String} rolls Number of dice rolls
     */
    function w20(rolls) {

        // Fix rolls argument
        rolls = Functions.convertToInt(rolls, ROLLS_MIN);

        // Print title
        console.log(
            CHAR_NEWLINE + CHAR_TAB + CHAR_PLACEHOLDER.yellow +
            DICE_20 + CHAR_NEWLINE,
            rolls
        );

        // Roll dice, print results
        Functions.rollDice(DICE_20_VALUE, rolls).forEach(function(roll, i) {

            // Color roll string
            var rollString = CHAR_PLACEHOLDER;
            if (roll === DICE_20_VALUE) {
                rollString = rollString.red;
            } else if (roll === ROLL_RESULT_MIN) {
                rollString = rollString.green;
            }

            // Print result
            console.log(
                CHAR_TAB + (CHAR_PLACEHOLDER + CHAR_DOT).grey.dim +
                CHAR_SPACE + rollString,
                (i + 1), roll
            );
        });

        // Print linebreak
        console.log(CHAR_BREAK);
    }

    /**
     * Command: w6; rolls six-sided dice.
     * @param {String} rolls Number of dice rolls
     * @param {Object} options Command options
     */
    function w6(rolls, options) {

        // Fix rolls and plus/minus arguments, initialize sum and mod
        rolls = Functions.convertToInt(rolls, ROLLS_MIN);
        var plus = Functions.convertToInt(options.plus, MOD_DEFAULT);
        var minus = Functions.convertToInt(options.minus, MOD_DEFAULT);
        var mod = (plus - minus);
        var sum = mod + 0;

        // Initialize mod output strings
        var modString = CHAR_PLACEHOLDER;
        if (mod < 0) { modString = modString.red; }
        else if (mod > 0) { modString = (CHAR_PLUS + modString).green; }
        else { modString = (CHAR_PLUSMINUS + modString).grey.dim; }

        // Print title
        console.log(
            CHAR_NEWLINE + CHAR_TAB + CHAR_PLACEHOLDER.yellow +
            DICE_6 + CHAR_SPACE + modString + CHAR_NEWLINE,
            rolls, mod
        );

        // Roll dice
        Functions.rollDice(DICE_6_VALUE, rolls).forEach(function(roll, i) {

            // Color roll string
            var rollString = CHAR_SPACE + CHAR_PLACEHOLDER;
            if (roll === DICE_6_VALUE) { rollString = rollString.green; }
            else if (roll === ROLL_RESULT_MIN) { rollString = rollString.red; }

            // Print result
            console.log(
                CHAR_TAB + (CHAR_PLACEHOLDER + CHAR_DOT).grey.dim + rollString,
                (i + 1), roll
            );

            // Add result to sum
            sum += roll;
        });

        // Print sum
        if ((rolls > ROLLS_MIN) || (mod !== MOD_DEFAULT)) {
            console.log(
                CHAR_NEWLINE + CHAR_TAB +
                (CHAR_SUM + CHAR_COLON).grey.dim + CHAR_SPACE +
                CHAR_PLACEHOLDER.cyan + CHAR_NEWLINE,
                sum
            );
        } else { console.log(CHAR_BREAK); }
    }

    /**
     * Command: skill; makes a skill-check.
     * @param {String} attr Skill attributes (e.g. 10/12/11)
     * @param {String} value Skill value
     * @param {Object} options Command options
     */
    function skill(attr, value, options) {

        // Fix value, initialize plus, minus, mod and repeat options
        value = Functions.convertToInt(value, SKILL_MIN);
        var plus = Functions.convertToInt(options.plus, MOD_DEFAULT);
        var minus = Functions.convertToInt(options.minus, MOD_DEFAULT);
        var repeat = Functions.convertToInt(options.repeat, ROLLS_MIN);
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
                attr[i] = Functions.convertToInt(val, ATTR_MIN);
            });

            // Initialize and color mod output string
            var modString = CHAR_PLACEHOLDER;
            if (mod < 0) { modString = modString.red; }
            else if (mod > 0) { modString = (CHAR_PLUS + modString).green; }
            else { modString = (CHAR_PLUSMINUS + modString).grey.dim; }

            // Initialize total quality-levels and additional mod
            var modAddtional = 0;
            var levelsTotal = 0;
            var levelsTotalString = CHAR_PLACEHOLDER;

            // Color levels total string
            if (repeat > ROLLS_MIN) {
                levelsTotalString = levelsTotalString.cyan;
            } else {
                levelsTotalString = levelsTotalString.grey.dim;
            }

            // Print title
            console.log(
                CHAR_NEWLINE + CHAR_TAB + ATTR_ROLLS.toString().yellow +
                DICE_20 + CHAR_SPACE + CHAR_PAREN_LEFT +
                CHAR_PLACEHOLDER.magenta + CHAR_PAREN_RIGHT + CHAR_SPACE +
                modString + CHAR_SPACE + CHAR_BRACKET_LEFT +
                CHAR_PLACEHOLDER.magenta + CHAR_BRACKET_RIGHT + CHAR_SPACE +
                (CHAR_TIMES + CHAR_PLACEHOLDER).grey.dim + CHAR_NEWLINE,
                attr.join(ATTR_DELIMITER), mod, value, repeat
            );

            // Repeat checks
            for (let i = 0; i < repeat; i++) {

                // Initialize skill-points and results
                var points = value + 0;
                var results = [];
                var resultsString = [];
                var countSuccess = 0;
                var countFailure = 0;
                var levelsCurrent = 0;
                var levelsCurrentString =
                    CHAR_LEVEL + CHAR_SPACE + CHAR_PLACEHOLDER;

                // Make rolls, save result, calculate points
                for (let j = 0; j < attr.length; j++) {

                    // Roll and save result, subtract points
                    var val = attr[j];
                    var roll = Functions.rollDice(DICE_20_VALUE, ROLLS_MIN)[0];
                    results.push(roll);
                    points -= Math.max(
                        0, roll - Math.max(0, val + mod + modAddtional));

                    // Color results string
                    var rollString = CHAR_PLACEHOLDER;
                    if (roll === DICE_20_VALUE) {
                        countFailure++;
                        resultsString.push(rollString.red);
                    } else if (roll === ROLL_RESULT_MIN) {
                        countSuccess++;
                        resultsString.push(rollString.green);
                    } else {
                        resultsString.push(rollString.grey);
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
                var pointsString = CHAR_PLACEHOLDER;
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
                for (let j = 0; j < spaces; j++) {
                    points = CHAR_SPACE + points;
                }

                // Print result
                console.log(
                    CHAR_TAB + (CHAR_PLACEHOLDER + CHAR_DOT).grey.dim +
                    CHAR_SPACE + resultsString[0] + ATTR_DELIMITER.grey +
                    resultsString[1] + ATTR_DELIMITER.grey + resultsString[2] +
                    CHAR_TAB + pointsString + CHAR_TAB + levelsCurrentString +
                    CHAR_TAB + CHAR_SUM.grey.dim + CHAR_SPACE +
                    levelsTotalString,
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
        w20   : w20,
        w6    : w6,
        skill : skill
    };

})();
