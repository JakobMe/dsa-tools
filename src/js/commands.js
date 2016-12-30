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
